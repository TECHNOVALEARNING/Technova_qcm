export type QuizQuestion = {
  id: string | number;
  answers: string[];
  correctIndex: number;
  themes: string[];
};

export type SubmittedAnswer = {
  questionId: string;
  answer: string;
};

export type ThemeScore = {
  attempted: number;
  correct: number;
};

export type BadgeTier = "bronze" | "silver" | "gold";

const badgeThresholds: Array<{ tier: BadgeTier; threshold: number; label: string }> = [
  { tier: "gold", threshold: 30, label: "Maîtrise" },
  { tier: "silver", threshold: 15, label: "Élan" },
  { tier: "bronze", threshold: 5, label: "Départ" },
];

const canonicalTheme = (theme: string) => {
  const normalized = theme.trim().toLocaleLowerCase("fr-FR");
  return normalized ? normalized.charAt(0).toLocaleUpperCase("fr-FR") + normalized.slice(1) : normalized;
};

export function scoreSubmittedSession(questions: QuizQuestion[], submittedAnswers: SubmittedAnswer[]) {
  const selectedAnswerByQuestion = new Map(submittedAnswers.map((item) => [item.questionId, item.answer]));
  const progressByTheme = new Map<string, ThemeScore>();
  let score = 0;

  for (const question of questions) {
    const selected = selectedAnswerByQuestion.get(String(question.id));
    const correct = selected === question.answers[question.correctIndex];
    if (correct) score += 1;
    for (const rawTheme of question.themes) {
      const theme = canonicalTheme(rawTheme);
      const current = progressByTheme.get(theme) || { attempted: 0, correct: 0 };
      current.attempted += 1;
      if (correct) current.correct += 1;
      progressByTheme.set(theme, current);
    }
  }

  return { score, totalQuestions: questions.length, progressByTheme };
}

export function badgeForProgress(correctAnswers: number) {
  return badgeThresholds.find((badge) => correctAnswers >= badge.threshold) || null;
}

export function isNewBadge(previousCorrectAnswers: number, nextCorrectAnswers: number) {
  const before = badgeForProgress(previousCorrectAnswers)?.tier;
  const after = badgeForProgress(nextCorrectAnswers)?.tier;
  return after !== undefined && after !== before ? badgeForProgress(nextCorrectAnswers) : null;
}
