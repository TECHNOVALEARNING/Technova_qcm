/**
 * Learning Circuit — page principale du jeu : éditorial suisse chaleureux,
 * ruban de contexte, encre marine et actions corail très lisibles.
 */
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import rawQuizData from "@/data/questions.json";
import { trpc } from "@/lib/trpc";
import {
  Award,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Copy,
  Crown,
  ExternalLink,
  Home as HomeIcon,
  Lightbulb,
  LogIn,
  Medal,
  PartyPopper,
  Play,
  RotateCcw,
  Share2,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

type RawQuestion = {
  id: number | string;
  question: string;
  answers: string[];
  correctIndex: number;
  goodComment: string;
  badComment: string;
  themes: string[];
  difficulty?: Exclude<Difficulty, "all">;
};

type QuizDataset = { questions: RawQuestion[] };
type SessionQuestion = RawQuestion & { choices: string[]; answerIndex: number };
type View = "home" | "quiz" | "result";
type Difficulty = "all" | "easy" | "medium" | "hard";
type Celebration = "answer" | "record" | null;
type ShareState = "idle" | "shared" | "copied";

const quizData = rawQuizData as QuizDataset;
const ALL_THEMES = "Tous les thèmes";
const totalQuestions = quizData.questions.length;
const difficultyOptions: { id: Exclude<Difficulty, "all">; label: string; description: string }[] = [
  { id: "easy", label: "Accessible", description: "réponse directe" },
  { id: "medium", label: "Intermédiaire", description: "un peu de recul" },
  { id: "hard", label: "Expert", description: "mémoire et nuance" },
];

const normalizeTheme = (theme: string) => theme.trim().toLocaleLowerCase("fr-FR");
const readableTheme = (theme: string) =>
  theme.length ? theme.charAt(0).toLocaleUpperCase("fr-FR") + theme.slice(1).toLocaleLowerCase("fr-FR") : theme;

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const index = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[index]] = [copy[index], copy[i]];
  }
  return copy;
}

function prepareQuestion(question: RawQuestion): SessionQuestion {
  const choices = shuffle(question.answers);
  return { ...question, choices, answerIndex: choices.indexOf(question.answers[question.correctIndex]) };
}

function getDifficulty(question: RawQuestion): Exclude<Difficulty, "all"> {
  if (question.difficulty === "easy" || question.difficulty === "medium" || question.difficulty === "hard") return question.difficulty;
  const answerAverageLength = question.answers.reduce((total, answer) => total + answer.length, 0) / question.answers.length;
  if (question.question.length > 145 || answerAverageLength > 25) return "hard";
  if (question.question.length > 90 || answerAverageLength > 16) return "medium";
  return "easy";
}

function getBestScore() {
  try {
    return Number(localStorage.getItem("technova-qcm-best-score") || "0");
  } catch {
    return 0;
  }
}

export default function PlayPage() {
  const [, setLocation] = useLocation();
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  const { user, isAuthenticated, logout } = useAuth();
  const trpcUtils = trpc.useUtils();
  const leaderboardQuery = trpc.quiz.leaderboard.useQuery({ limit: 6 });
  const progressQuery = trpc.quiz.myProgress.useQuery(undefined, { enabled: isAuthenticated });

  const [view, setView] = useState<View>("home");
  const [chosenTheme, setChosenTheme] = useState(ALL_THEMES);
  const [chosenDifficulty, setChosenDifficulty] = useState<Difficulty>("all");
  const [gameSize, setGameSize] = useState(10);
  const [customQuestionCount, setCustomQuestionCount] = useState("");
  const [session, setSession] = useState<SessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(getBestScore);
  const [missedThemes, setMissedThemes] = useState<string[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [celebration, setCelebration] = useState<Celebration>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [clientSessionId, setClientSessionId] = useState("");
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, string>>({});
  const [onlineState, setOnlineState] = useState<"idle" | "syncing" | "synced" | "signin" | "error">("idle");
  const [newBadges, setNewBadges] = useState<Array<{ theme: string; tier: "bronze" | "silver" | "gold"; label: string }>>([]);

  const submitSession = trpc.quiz.submitSession.useMutation({
    onSuccess: (data) => {
      setOnlineState("synced");
      setNewBadges(data.newBadges);
      void trpcUtils.quiz.leaderboard.invalidate();
      void trpcUtils.quiz.myProgress.invalidate();
    },
    onError: () => setOnlineState("error"),
  });

  const themes = useMemo(() => {
    const index = new Map<string, { label: string; count: number }>();
    quizData.questions.forEach((question) => {
      question.themes.forEach((theme) => {
        const canonical = normalizeTheme(theme);
        const previous = index.get(canonical);
        index.set(canonical, { label: readableTheme(canonical), count: (previous?.count || 0) + 1 });
      });
    });
    return Array.from(index.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fr"));
  }, []);

  const activeQuestion = session[currentIndex];
  const progress = session.length ? ((currentIndex + (selectedAnswer !== null ? 1 : 0)) / session.length) * 100 : 0;
  const sessionThemeLabel = chosenTheme === ALL_THEMES ? "Culture générale" : chosenTheme;
  const sessionDifficultyLabel = difficultyOptions.find((option) => option.id === chosenDifficulty)?.label || "Tous les niveaux";
  const themedQuestions = useMemo(
    () => chosenTheme === ALL_THEMES
      ? quizData.questions
      : quizData.questions.filter((question) => question.themes.some((theme) => normalizeTheme(theme) === normalizeTheme(chosenTheme))),
    [chosenTheme],
  );
  const availableQuestions = useMemo(
    () => chosenDifficulty === "all" ? themedQuestions : themedQuestions.filter((question) => getDifficulty(question) === chosenDifficulty),
    [chosenDifficulty, themedQuestions],
  );
  const availableQuestionCount = availableQuestions.length;
  const configuredQuestionCount = customQuestionCount === "" ? gameSize : Number(customQuestionCount);
  const effectiveQuestionCount = Math.max(1, Math.min(Number.isFinite(configuredQuestionCount) ? configuredQuestionCount : gameSize, Math.max(1, availableQuestionCount)));
  const earnedBadges = (progressQuery.data || []).filter((item) => item.badge);
  const leaderboardEntries = leaderboardQuery.data || [];

  const playChime = (notes: number[]) => {
    if (!audioEnabled || typeof window === "undefined") return;
    const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const context = new AudioContextConstructor();
    const startAt = context.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt + index * 0.09);
      gain.gain.setValueAtTime(0.001, startAt + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.11, startAt + index * 0.09 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + index * 0.09 + 0.2);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt + index * 0.09);
      oscillator.stop(startAt + index * 0.09 + 0.22);
    });
    window.setTimeout(() => context.close(), notes.length * 100 + 360);
  };

  const triggerCelebration = (kind: Exclude<Celebration, null>) => {
    setCelebration(kind);
    window.setTimeout(() => setCelebration(null), kind === "record" ? 2200 : 720);
  };

  const startGame = () => {
    if (!isAuthenticated) return;
    if (!availableQuestionCount) return;
    const nextSession = shuffle(availableQuestions)
      .slice(0, effectiveQuestionCount)
      .map(prepareQuestion);
    setSession(nextSession);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setMissedThemes([]);
    setNewRecord(false);
    setShareState("idle");
    setSessionAnswers({});
    setNewBadges([]);
    setOnlineState("idle");
    setClientSessionId(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `technova-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    setView("quiz");
  };

  const chooseAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !activeQuestion) return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === activeQuestion.answerIndex) {
      setScore((previous) => previous + 1);
      playChime([659.25, 783.99]);
      triggerCelebration("answer");
    } else {
      setMissedThemes((previous) => Array.from(new Set([...previous, ...activeQuestion.themes.map(readableTheme)])));
    }
    setSessionAnswers((previous) => ({ ...previous, [String(activeQuestion.id)]: activeQuestion.choices[answerIndex] }));
  };

  const nextQuestion = () => {
    if (!activeQuestion || selectedAnswer === null) return;
    if (currentIndex + 1 < session.length) {
      setCurrentIndex((previous) => previous + 1);
      setSelectedAnswer(null);
      return;
    }
    const finalScore = score;
    const hasNewRecord = finalScore > bestScore;
    const nextBest = Math.max(bestScore, finalScore);
    setBestScore(nextBest);
    setNewRecord(hasNewRecord);
    try {
      localStorage.setItem("technova-qcm-best-score", String(nextBest));
    } catch {
      // Le score reste visible même si le stockage du navigateur est désactivé.
    }
    if (hasNewRecord) {
      playChime([523.25, 659.25, 783.99, 1046.5]);
      triggerCelebration("record");
    }
    const answers = session.map((question) => ({
      questionId: String(question.id),
      answer: question.id === activeQuestion.id ? activeQuestion.choices[selectedAnswer] : sessionAnswers[String(question.id)] || "",
    }));
    if (isAuthenticated && clientSessionId) {
      setOnlineState("syncing");
      submitSession.mutate({
        clientSessionId,
        displayName: user?.name?.trim() || "Joueur Technova",
        theme: chosenTheme,
        difficulty: chosenDifficulty,
        questionIds: session.map((question) => String(question.id)),
        answers,
      });
    } else {
      setOnlineState("signin");
    }
    setView("result");
  };

  const shareMessage = () => {
    const player = user?.name?.trim() ? `${user?.name?.trim()} a` : "J’ai";
    return `${player} obtenu ${score}/${session.length} au Technova QCM. Relèverez-vous le défi ? Jouez ici : ${window.location.origin}`;
  };

  const copyShareMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage());
      setShareState("copied");
    } catch {
      setShareState("idle");
    }
  };

  const handleShare = async () => {
    const message = shareMessage();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mon score Technova QCM", text: message, url: window.location.origin });
        setShareState("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setShareState("shared");
  };

  const leaveSession = () => {
    setView("home");
    setSelectedAnswer(null);
  };

  return (
    <main className="app-shell">
      <a className="skip-link" href="#app-content">
        Aller au contenu du jeu
      </a>

      <header className="site-header">
        <a className="brand" href="#app-content" aria-label="Technova QCM — accueil">
          <div className="brand-icon-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <BrainCircuit size={34} strokeWidth={2.5} color="white" />
            <span style={{ position: 'absolute', top: '4px', right: '-2px', width: '10px', height: '10px', background: 'var(--coral)', borderRadius: '50%' }} />
          </div>
          <span className="brand-wordmark">TECHNOVA<span>QCM</span></span>
        </a>
        <div className="header-tools">
          <button type="button" className={`sound-toggle ${audioEnabled ? "is-active" : ""}`} onClick={() => setAudioEnabled((previous) => !previous)} aria-pressed={audioEnabled} title={audioEnabled ? "Couper les sons" : "Activer les sons"}>
            {audioEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
            <span>Son</span>
          </button>
          {isAuthenticated ? (
            <>
              <a className="account-link" href="#progression"><Award size={15} aria-hidden="true" /> {earnedBadges.length} badge{earnedBadges.length > 1 ? "s" : ""}</a>
              <button type="button" className="account-link" onClick={() => { setLocation("/"); logout(); }} style={{ marginLeft: '1rem', opacity: 0.8 }}>Déconnexion</button>
            </>
          ) : (
            <button type="button" className="account-link" onClick={() => setLocation("/auth")}><LogIn size={15} aria-hidden="true" /> Se connecter</button>
          )}
        </div>
      </header>

      <section className="technova-ribbon" aria-label="Découvrir Technova Learning">
        <div className="ribbon-index"><Sparkles size={15} aria-hidden="true" /> ÉCOSYSTÈME TECHNOVA</div>
        <p>Formations tech, e-books PLR et ressources digitales pour apprendre avec ambition.</p>
        <a href="https://www.technovalearning.com" target="_blank" rel="noreferrer" className="ribbon-link">
          Découvrir la plateforme <ExternalLink size={15} aria-hidden="true" />
        </a>
      </section>

      {celebration && (
        <div className={`celebration-layer celebration-${celebration}`} aria-hidden="true">
          <div className="celebration-message">{celebration === "record" ? "Nouveau record !" : "Bonne réponse !"}</div>
          {Array.from({ length: celebration === "record" ? 18 : 11 }, (_, index) => <i key={index} />)}
        </div>
      )}

      <div id="app-content" className="workspace">
        <aside className="session-rail" aria-label="Repères de session">
          <div className="rail-number">{view === "quiz" ? String(currentIndex + 1).padStart(2, "0") : "00"}</div>
          <div className="rail-line" />
          <div className="rail-caption">{view === "quiz" ? sessionThemeLabel : "Session libre"}</div>
          <div className="rail-bottom"><BrainCircuit size={18} aria-hidden="true" /></div>
        </aside>

        <section className="content-stage">
          {view === "home" && (
            <section className="landing-view animate-enter">
              <section className="configuration-panel" aria-labelledby="configuration-title">
                <div className="panel-header">
                  <div>
                    <div className="eyebrow"><span>02</span> CONFIGURER LA PARTIE</div>
                    <h2 id="configuration-title">Composez votre défi</h2>
                  </div>
                  <div className="panel-note"><CircleHelp size={16} aria-hidden="true" /> Les questions sont tirées au sort.</div>
                </div>

                <div className="config-grid">
                  <div className="name-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Votre pseudo</span>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>
                      {user?.name || "Joueur"}
                    </div>
                    <a href="https://www.technovalearning.com/apps" target="_blank" rel="noopener noreferrer" className="technova-apps-btn">
                      <span className="technova-apps-dot"></span>
                      Accédez aux applications de Technova
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <div className="length-field">
                    <span>Nombre de questions</span>
                    <div className="length-control-row">
                      <div className="segmented-control" role="group" aria-label="Nombre de questions prédéfini">
                      {[5, 10, 15].map((size) => (
                          <button key={size} type="button" onClick={() => { setGameSize(size); setCustomQuestionCount(""); }} className={customQuestionCount === "" && gameSize === size ? "is-active" : ""}>{size}</button>
                      ))}
                      </div>
                      <label className="custom-count-field">
                        <span className="sr-only">Nombre personnalisé de questions</span>
                        <input type="number" min="1" max={availableQuestionCount} value={customQuestionCount} onChange={(event) => setCustomQuestionCount(event.target.value)} placeholder="Autre" />
                      </label>
                    </div>
                    <small>+5000 questions disponibles avec ces filtres. Maximum appliqué automatiquement.</small>
                  </div>
                </div>

                <div className="difficulty-picker">
                  <div className="theme-picker-heading"><span>Niveau estimé</span><span>selon la longueur et la nuance de la question</span></div>
                  <div className="difficulty-list" role="group" aria-label="Niveau de difficulté des questions">
                    {difficultyOptions.map((option) => {
                      const count = themedQuestions.filter((question) => getDifficulty(question) === option.id).length;
                      return <button key={option.id} type="button" onClick={() => setChosenDifficulty(option.id)} className={`difficulty-choice ${chosenDifficulty === option.id ? "is-active" : ""}`}>
                        <strong>{option.label}</strong><span>{option.description}</span><em>{count}</em>
                      </button>;
                    })}
                  </div>
                </div>

                <div className="theme-picker">
                  <div className="theme-picker-heading"><span>Choisissez un thème</span></div>
                  <div className="theme-list" role="group" aria-label="Thèmes de quiz">
                    <button type="button" onClick={() => setChosenTheme(ALL_THEMES)} className={`theme-chip theme-chip-all ${chosenTheme === ALL_THEMES ? "is-active" : ""}`}>
                      <span className="theme-chip-dot" /> {ALL_THEMES}
                    </button>
                    {themes.map((theme) => (
                      <button key={theme.label} type="button" onClick={() => setChosenTheme(theme.label)} className={`theme-chip ${chosenTheme === theme.label ? "is-active" : ""}`}>
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                  <Button className="start-button" size="lg" onClick={startGame} disabled={!availableQuestionCount}>
                    <Play size={17} fill="currentColor" aria-hidden="true" />
                    {availableQuestionCount ? `Lancer le défi ${effectiveQuestionCount} question${effectiveQuestionCount > 1 ? "s" : ""}` : "Aucune question avec ces filtres"}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
              </section>


              <section className="community-section" id="progression" aria-label="Progression et classement">
                <div className="progress-card">
                  <div className="community-kicker"><Award size={17} aria-hidden="true" /> VOTRE COLLECTION</div>
                  <h2>Les bons réflexes deviennent des badges.</h2>
                  {isAuthenticated ? (
                    progressQuery.isError ? (
                      <p className="community-error">Votre progression n’est pas disponible pour le moment. Vos scores locaux restent accessibles.</p>
                    ) : earnedBadges.length > 0 ? (
                      <div className="badge-list">
                        {earnedBadges.map((item) => (
                          <div key={item.theme} className={`progress-badge tier-${item.badge?.tier || "bronze"}`}>
                            <Medal size={19} aria-hidden="true" />
                            <div><strong>{item.theme}</strong><span>{item.badge?.label} · {item.correctAnswers} bonnes réponses</span></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="community-empty">Terminez une première session connectée pour lancer votre collection. Le premier badge arrive après cinq bonnes réponses dans un thème.</p>
                    )
                  ) : (
                    <div className="community-auth"><p>Connectez-vous pour conserver votre progression par thème et débloquer des badges.</p><Button type="button" onClick={() => startLogin()}><LogIn size={16} /> Créer ma progression</Button></div>
                  )}
                </div>
                <div className="leaderboard-card">
                  <div className="community-kicker"><Users size={17} aria-hidden="true" /> CLASSEMENT LIVE</div>
                  <h2>Les esprits les plus affûtés.</h2>
                  {leaderboardQuery.isLoading ? <p className="community-empty">Chargement du classement…</p> : leaderboardQuery.isError ? <p className="community-error">Le classement est momentanément indisponible. Réessayez dans quelques instants.</p> : leaderboardEntries.length > 0 ? (
                    <ol className="leaderboard-list">
                      {leaderboardEntries.map((entry, index) => (
                        <li key={entry.userId}>
                          <span className="leaderboard-rank">{String(index + 1).padStart(2, "0")}</span>
                          <strong>{entry.displayName}</strong>
                          <span>Niveau {entry.level} · {entry.xp} XP</span>
                        </li>
                      ))}
                    </ol>
                  ) : <p className="community-empty">Le classement attend sa première session. À vous d’ouvrir le score.</p>}
                </div>
              </section>
            </section>
          )}

          {view === "quiz" && activeQuestion && (
            <section className="quiz-view animate-enter" aria-live="polite">
              <div className="quiz-topbar">
                <button type="button" className="back-home" onClick={leaveSession}><HomeIcon size={16} aria-hidden="true" /> Quitter</button>
                <div className="quiz-meta"><span>{sessionThemeLabel} · {sessionDifficultyLabel}</span><span>Question {currentIndex + 1} / {session.length}</span></div>
              </div>
              <div className="progress-track" aria-label={`Progression : ${Math.round(progress)} %`}><span style={{ width: `${progress}%` }} /></div>

              <div className="question-layout">
                <div className="question-card">
                  <div className="question-id">Question <strong>{String(currentIndex + 1).padStart(2, "0")}</strong></div>
                  <h1>{activeQuestion.question}</h1>
                  <div className="question-tag-row">
                    {activeQuestion.themes.map((theme) => <span key={theme}>{readableTheme(theme)}</span>)}
                  </div>
                </div>
                <aside className="quiz-side-art">
                  <img src="/qcm-side-art.jpg" alt="Laboratoire imagé de connaissances et de données" />
                  <div><BrainCircuit size={20} aria-hidden="true" /> <span>Réfléchissez,<br />puis répondez.</span></div>
                </aside>
              </div>

              <div className="answer-list" aria-label="Réponses proposées">
                {activeQuestion.choices.map((choice, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === activeQuestion.answerIndex;
                  const state = selectedAnswer === null ? "" : isCorrect ? "is-correct" : isSelected ? "is-wrong" : "is-muted";
                  return (
                    <button key={`${choice}-${index}`} type="button" disabled={selectedAnswer !== null} onClick={() => chooseAnswer(index)} className={`answer-option ${state}`}>
                      <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="answer-text">{choice}</span>
                      {selectedAnswer !== null && isCorrect && <Check size={20} aria-label="Bonne réponse" />}
                      {selectedAnswer !== null && isSelected && !isCorrect && <X size={20} aria-label="Réponse incorrecte" />}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className={`feedback-panel ${selectedAnswer === activeQuestion.answerIndex ? "feedback-good" : "feedback-bad"}`}>
                  <div className="feedback-icon">{selectedAnswer === activeQuestion.answerIndex ? <Check size={21} /> : <Lightbulb size={21} />}</div>
                  <div><strong>{selectedAnswer === activeQuestion.answerIndex ? "Bien joué !" : "À retenir"}</strong><p>{selectedAnswer === activeQuestion.answerIndex ? activeQuestion.goodComment : activeQuestion.badComment}</p></div>
                  <Button className="next-button" onClick={nextQuestion}>{currentIndex + 1 === session.length ? "Voir mon résultat" : "Question suivante"}<ArrowRight size={16} /></Button>
                </div>
              )}
            </section>
          )}

          {view === "result" && (
            <section className="result-view animate-enter">
              <div className="result-header"><div className="eyebrow"><span>FIN</span> BILAN DE SESSION</div><button type="button" className="back-home" onClick={leaveSession}><HomeIcon size={16} aria-hidden="true" /> Accueil</button></div>
              <div className="result-main">
                <div className="result-score-block">
                  <div className="trophy-wrap"><Trophy size={36} aria-hidden="true" /></div>
                  <p>{user?.name?.trim() ? `${user?.name?.trim()}, voici votre score` : "Voici votre score"}</p>
                  <div className="score-display"><strong>{score}</strong><span>/ {session.length}</span></div>
                  <div className="score-bar"><span style={{ width: `${session.length ? (score / session.length) * 100 : 0}%` }} /></div>
                  <p className="score-note">{score === session.length ? "Sans faute : un très beau réflexe de connaissance." : score >= Math.ceil(session.length * 0.7) ? "Une session solide. Continuez sur votre lancée." : "Chaque réponse est une occasion d’apprendre."}</p>
                </div>
                <div className="result-detail">
                  {newRecord && <div className="record-banner" role="status"><PartyPopper size={19} aria-hidden="true" /><div><strong>Nouveau record personnel</strong><span>Votre score local est battu.</span></div></div>}
                  <div className="result-stat"><Crown size={19} aria-hidden="true" /><div><span>Meilleur score local</span><strong>{bestScore} point{bestScore > 1 ? "s" : ""}</strong></div></div>
                  <div className="result-stat"><BookOpen size={19} aria-hidden="true" /><div><span>Thème de session</span><strong>{sessionThemeLabel}</strong></div></div>
                  <div className="result-stat"><BrainCircuit size={19} aria-hidden="true" /><div><span>Niveau estimé</span><strong>{sessionDifficultyLabel}</strong></div></div>
                  {missedThemes.length > 0 && <div className="review-block"><span>À revoir lors du prochain défi</span><div>{missedThemes.map((theme) => <em key={theme}>{theme}</em>)}</div></div>}
                  {newBadges.map((badge) => <div className={`new-badge tier-${badge.tier}`} key={`${badge.theme}-${badge.tier}`} role="status"><Award size={20} aria-hidden="true" /><div><strong>Badge {badge.label} · {badge.theme}</strong><span>Une nouvelle étape de progression est déverrouillée.</span></div></div>)}
                  {onlineState !== "idle" && <div className={`online-sync online-${onlineState}`}><Users size={17} aria-hidden="true" /><span>{onlineState === "syncing" ? "Score en cours d’enregistrement…" : onlineState === "synced" ? "Score ajouté au classement et progression mise à jour." : onlineState === "signin" ? "Connectez-vous lors de la prochaine partie pour apparaître au classement." : "Le score local est disponible, mais la synchronisation en ligne n’a pas abouti."}</span></div>}
                  <Button className="restart-button" size="lg" onClick={startGame}><RotateCcw size={17} /> Rejouer une session</Button>
                </div>
              </div>
              <section className="share-card" aria-label="Partager votre résultat">
                <div className="share-icon"><Share2 size={23} aria-hidden="true" /></div>
                <div className="share-copy"><strong>Partagez votre défi</strong><p>Publiez votre score et invitez vos proches à découvrir Technova Learning.</p></div>
                <div className="share-actions">
                  <Button type="button" className="share-button" onClick={handleShare}><Share2 size={16} /> Partager mon score</Button>
                  <button type="button" className="copy-share" onClick={copyShareMessage}><Copy size={15} /> Copier</button>
                  {shareState !== "idle" && <span className="share-feedback" role="status">{shareState === "copied" ? "Message copié" : "Prêt à publier"}</span>}
                </div>
              </section>
              <section className="result-promo">
                <div><span>TECHNOVA LEARNING</span><h2>Continuez à apprendre, au-delà du quiz.</h2></div>
                <a href="https://www.technovalearning.com" target="_blank" rel="noreferrer">Voir les formations et e-books <ArrowRight size={17} /></a>
              </section>
            </section>
          )}
        </section>
      </div>

      <footer className="site-footer"><span>TECHNOVA QCM</span><span>Jouez, apprenez, progressez.</span><a href="https://www.technovalearning.com" target="_blank" rel="noreferrer">technovalearning.com</a></footer>
    </main>
  );
}
