import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="app-shell" style={{ overflowY: "auto" }}>
      <header className="site-header" style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <button className="back-home" onClick={() => setLocation("/")}>
          <ArrowLeft size={16} /> Retour à l'accueil
        </button>
      </header>

      <main style={{ maxWidth: "800px", margin: "4rem auto", padding: "0 2rem", color: "white", lineHeight: 1.6 }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", fontFamily: "'Space Grotesk', sans-serif" }}>Conditions d'Utilisation</h1>
        
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--coral)", marginBottom: "1rem" }}>1. Acceptation</h2>
          <p>En accédant à Technova QCM, vous acceptez pleinement et sans réserve les présentes conditions d'utilisation. Si vous n'êtes pas en accord avec ces termes, veuillez ne pas utiliser la plateforme.</p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--coral)", marginBottom: "1rem" }}>2. Objet du service</h2>
          <p>Technova QCM est une plateforme ludique d'apprentissage permettant de tester ses connaissances via des quiz (QCM) sur divers sujets technologiques, et de cumuler de l'expérience (XP) et des badges virtuels.</p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--coral)", marginBottom: "1rem" }}>3. Comportement de l'utilisateur</h2>
          <p>Vous vous engagez à utiliser la plateforme de manière loyale. Toute tentative de fraude, de modification du code client pour altérer le score, ou tout comportement visant à nuire à l'intégrité du classement pourra entraîner la suppression de votre compte.</p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--coral)", marginBottom: "1rem" }}>4. Propriété intellectuelle</h2>
          <p>L'ensemble des contenus, questions, designs et éléments graphiques présents sur Technova QCM sont la propriété exclusive de leurs auteurs. Toute reproduction non autorisée est interdite.</p>
        </section>
      </main>
    </div>
  );
}
