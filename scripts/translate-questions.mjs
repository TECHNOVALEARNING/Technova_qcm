import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { invokeLLM, listLLMModels } from "../server/_core/llm.ts";

const DATA_ROOT = "/home/ubuntu/qcm-data-work";
const sourcePath = `${DATA_ROOT}/raw/open_triviaqa_selected.json`;
const insectPath = `${DATA_ROOT}/raw/wikidata_insects.json`;
const cachePath = `${DATA_ROOT}/processed/translation_cache.json`;
const defaultOutputPath = `${DATA_ROOT}/processed/question_extensions_fr.json`;
const batchSize = 8;
const workerCount = 8;

const schema = {
  type: "json_schema",
  json_schema: {
    name: "quiz_translation_batch",
    strict: true,
    schema: {
      type: "object",
      properties: {
        translations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              index: { type: "integer" },
              question: { type: "string" },
              correctAnswer: { type: "string" },
              incorrectAnswers: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
            },
            required: ["index", "question", "correctAnswer", "incorrectAnswers"],
            additionalProperties: false,
          },
        },
      },
      required: ["translations"],
      additionalProperties: false,
    },
  },
};

const args = process.argv.slice(2);
const limitIndex = args.indexOf("--limit");
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : null;
const outputIndex = args.indexOf("--output");
const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : defaultOutputPath;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function gate(batch, translations) {
  const sourceIndexes = new Set(batch.map((item) => item.sourceIndex));
  const translationIndexes = new Set(translations.map((item) => item.index));
  if (sourceIndexes.size !== translationIndexes.size || [...sourceIndexes].some((index) => !translationIndexes.has(index))) {
    throw new Error("Le lot de traduction ne couvre pas exactement les questions envoyées.");
  }
  for (const item of translations) {
    const answers = [item.correctAnswer, ...item.incorrectAnswers];
    if (!item.question?.trim() || item.question.trim().length < 8 || answers.some((answer) => !answer?.trim())) {
      throw new Error("Une question ou réponse traduite est vide.");
    }
    if (new Set(answers.map((answer) => answer.trim().toLocaleLowerCase("fr-FR"))).size !== 4) {
      throw new Error("Les quatre réponses traduites doivent rester distinctes.");
    }
  }
  return translations;
}

async function translateBatch(batch, model) {
  const source = batch.map(({ sourceIndex, sourceQuestion, sourceCorrectAnswer, sourceIncorrectAnswers }) => ({
    index: sourceIndex,
    question: sourceQuestion,
    correctAnswer: sourceCorrectAnswer,
    incorrectAnswers: sourceIncorrectAnswers,
  }));

  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await invokeLLM({
        model,
        messages: [
          {
            role: "system",
            content: "Tu es un traducteur éditorial rigoureux pour un jeu de QCM en français. Traduis chaque question et chacune des quatre réponses vers un français naturel. Ne modifie jamais les faits, le sens, le nombre de réponses, ni l’unicité de la bonne réponse. Préserve les noms propres et les titres d’œuvres lorsqu’ils n’ont pas de traduction française usuelle. Ne donne aucune explication. Retourne uniquement le JSON demandé.",
          },
          {
            role: "user",
            content: `Traduis fidèlement les éléments suivants. La première réponse est la bonne réponse et les trois suivantes sont les distracteurs.\n${JSON.stringify(source)}`,
          },
        ],
        response_format: schema,
        maxTokens: 5000,
      });
      const content = response.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("Le modèle n’a retourné aucun contenu textuel.");
      return gate(batch, JSON.parse(content).translations);
    } catch (error) {
      lastError = error;
      await sleep(800 * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Échec de traduction inconnu.");
}

async function main() {
  const sourcePayload = JSON.parse(await readFile(sourcePath, "utf8"));
  const allSourceRecords = sourcePayload.records.map((record, sourceIndex) => ({ ...record, sourceIndex }));
  const sourceRecords = Number.isFinite(limit) && limit > 0 ? allSourceRecords.slice(0, limit) : allSourceRecords;
  const cache = existsSync(cachePath) ? JSON.parse(await readFile(cachePath, "utf8")) : {};
  const pending = sourceRecords.filter((record) => !cache[String(record.sourceIndex)]);
  const batches = Array.from({ length: Math.ceil(pending.length / batchSize) }, (_, index) => pending.slice(index * batchSize, (index + 1) * batchSize));
  const modelList = await listLLMModels();
  const model = modelList.data.find((item) => item.id === "gpt-5-mini")?.id || modelList.data.find((item) => item.id.startsWith("gpt-5-"))?.id;
  if (!model) throw new Error("Aucun modèle de traduction compatible n’est disponible.");

  console.log(JSON.stringify({ sourceRecords: sourceRecords.length, cached: sourceRecords.length - pending.length, pending: pending.length, batches: batches.length, model }));
  let nextBatch = 0;
  let completed = 0;
  async function worker() {
    while (nextBatch < batches.length) {
      const batch = batches[nextBatch];
      nextBatch += 1;
      const translations = await translateBatch(batch, model);
      for (const translation of translations) cache[String(translation.index)] = translation;
      await writeFile(cachePath, JSON.stringify(cache, null, 2), "utf8");
      completed += 1;
      console.log(`Lots traduits : ${completed}/${batches.length}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(workerCount, batches.length) }, () => worker()));

  const output = sourceRecords.map((source) => {
    const translation = cache[String(source.sourceIndex)];
    if (!translation) throw new Error(`Traduction manquante pour l’index ${source.sourceIndex}.`);
    return {
      id: `otqa-${source.sourceIndex + 1}`,
      question: translation.question.trim(),
      answers: [translation.correctAnswer.trim(), ...translation.incorrectAnswers.map((answer) => answer.trim())],
      correctIndex: 0,
      goodComment: "Bonne réponse ! Bravo !",
      badComment: `La bonne réponse était « ${translation.correctAnswer.trim()} ».`,
      themes: [source.assignedTheme],
      difficulty: source.sourceDifficulty,
      source: source.source,
      sourceUrl: source.sourceUrl,
      license: source.license,
    };
  });

  const insects = JSON.parse(await readFile(insectPath, "utf8")).records.map((source, index) => ({
    id: `wikidata-insect-${index + 1}`,
    question: source.sourceQuestion,
    answers: [source.sourceCorrectAnswer, ...source.sourceIncorrectAnswers],
    correctIndex: 0,
    goodComment: "Bonne réponse ! Bravo !",
    badComment: "La bonne réponse était « Les insectes ».",
    themes: [source.assignedTheme],
    difficulty: source.sourceDifficulty,
    source: source.source,
    sourceUrl: source.sourceUrl,
    license: source.license,
  }));
  const combined = [...output, ...insects];
  await writeFile(outputPath, JSON.stringify({ metadata: { count: combined.length, translationModel: model, attribution: "Questions adaptées d’OpenTriviaQA (CC BY-SA 4.0) et de Wikidata (CC0 1.0)." }, questions: combined }, null, 2), "utf8");
  console.log(JSON.stringify({ outputPath, count: combined.length }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
