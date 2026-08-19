import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="app-shell" style={{ overflowY: "auto" }}>
      <header className="site-header" style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <button className="back-home" onClick={() => setLocation("/")}>
          <ArrowLeft size={16} /> Retour à l'accueil
        </button>
      </header>

      <main style={{ maxWidth: "800px", margin: "4rem auto", padding: "0 2rem", color: "white", lineHeight: 1.6 }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", fontFamily: "'Space Grotesk', sans-serif" }}>Politique de Confidentialité</h1>
        
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--coral)", marginBottom: "1rem" }}>1. Collecte des données</h2>
          <p>Nous collectons uniquement les informations nécessaires au bon fonctionnement de la plateforme : votre pseudo, votre progression (XP, badges, niveau) et les données techniques indispensables à la sécurisation de votre compte.</p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--coral)", marginBottom: "1rem" }}>2. Utilisation des données</h2>
          <p>Vos données sont exclusivement utilisées pour sauvegarder votre progression dans le jeu, afficher le classement, et améliorer l'expérience utilisateur. Aucune donnée n'est revendue à des tiers.</p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--coral)", marginBottom: "1rem" }}>3. Cookies</h2>
          <p>Technova QCM utilise uniquement des cookies techniques (session et sécurité) strictement nécessaires au fonctionnement de l'espace membre. Aucun cookie de pistage publicitaire n'est utilisé.</p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--coral)", marginBottom: "1rem" }}>4. Vos droits</h2>
          <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ce droit, veuillez nous contacter via nos réseaux ou le support Technova Learning.</p>
        </section>
      </main>
    </div>
  );
}
