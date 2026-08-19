import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BrainCircuit, Gamepad2, Megaphone, Users } from "lucide-react";
import { useLocation } from "wouter";
import { HeroAnimation } from "@/components/HeroAnimation";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const leaderboardQuery = trpc.quiz.leaderboard.useQuery({ limit: 5 });
  const leaderboardEntries = leaderboardQuery.data || [];

  const handleAction = () => {
    if (isAuthenticated) {
      setLocation("/play");
    } else {
      setLocation("/auth");
    }
  };

  return (
    <main className="app-shell landing-page">
      <a className="skip-link" href="#app-content">
        Aller au contenu
      </a>

      <header className="site-header">
        <div className="brand" aria-label="Technova QCM — accueil">
          <BrainCircuit className="text-coral" size={32} />
          <span className="brand-wordmark">TECHNOVA<span>QCM</span></span>
        </div>
        <div className="header-tools">
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Niveau {user.level || 1}
                </span>
                <div style={{ width: '80px', height: '4px', background: 'var(--line)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--coral)', width: `${((user.xp || 0) % 1000) / 10}%`, transition: 'width 0.3s ease' }} />
                </div>
              </div>
              {user.role === 'admin' && (
                <button type="button" className="account-link" style={{ color: 'var(--coral)' }} onClick={() => setLocation('/admin')}>Admin</button>
              )}
              <button type="button" className="account-link" onClick={handleAction}>Accéder au jeu</button>
              <button type="button" className="account-link" style={{ opacity: 0.7 }} onClick={async () => { await logout(); window.location.reload(); }}>Déconnexion</button>
            </div>
          ) : (
            <button type="button" className="account-link" onClick={handleAction}>S'inscrire / Se connecter</button>
          )}
        </div>
      </header>

      <section className="technova-ribbon" aria-label="Découvrir Technova Learning">
        <div className="ribbon-index">ÉCOSYSTÈME TECHNOVA</div>
        <p>Formations tech, e-books PLR et ressources digitales pour apprendre avec ambition.</p>
      </section>

      <div id="app-content" className="workspace">
        <div className="session-rail" aria-hidden="true">
          <div className="rail-number">01</div>
          <div className="rail-line" />
          <div className="rail-caption">TECHNOVA LEARNING</div>
          <BrainCircuit size={17} className="rail-bottom" />
        </div>

        {/* ===== HERO SECTION — fits exactly in the viewport ===== */}
        <section className="hero-fullscreen">
          <div className="hero-fullscreen__inner">
            {/* Left: copy */}
            <div className="hero-fullscreen__copy">
              <h1>
                Une question.<br />
                <em>Un réflexe.</em><br />
                Un point de plus.
              </h1>
              <p className="hero-fullscreen__desc">
                Bienvenue sur Technova QCM. Rejoignez une plateforme didactique conçue comme un véritable jeu.
                Répondez aux questions, débloquez des badges par thème et hissez-vous au sommet du classement.
              </p>

              <div className="hero-fullscreen__metrics">
                <div><strong>5000+</strong><span>QUESTIONS</span></div>
                <div><strong>4</strong><span>RÉPONSES</span></div>
                <div><strong>1</strong><span>CLASSEMENT</span></div>
              </div>

              <Button className="hero-fullscreen__cta" onClick={handleAction}>
                Commencer à jouer
                <Gamepad2 size={20} />
              </Button>
            </div>

            {/* Right: 3D image */}
            <div className="hero-fullscreen__art">
              <img
                src="/hero-3d-ui.png"
                alt="Interface de jeu Technova QCM en 3D — question, score, badges et manette"
                className="hero-fullscreen__img"
              />
            </div>
          </div>
        </section>

        {/* ===== ADVERTISEMENT SECTION ===== */}
        <section className="ad-section-wrapper" style={{ gridColumn: '1 / -1', width: '100%' }}>
          <section className="ad-section" aria-label="Espace Sponsorisé">
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .ad-marquee-container {
                overflow: hidden;
                width: 100%;
                display: flex;
              }
              .ad-marquee-track {
                display: flex;
                width: max-content;
                animation: marquee 40s linear infinite;
              }
              .ad-marquee-track:hover {
                animation-play-state: paused;
              }
              .ad-marquee-content {
                display: flex;
                align-items: center;
                padding-right: 3rem;
                white-space: nowrap;
              }
            `}</style>
            <div className="ad-container">
              <div className="ad-label">Sponsorisé</div>
              <div className="ad-content">
                <div className="ad-icon-wrapper">
                  <Megaphone size={28} strokeWidth={2} />
                </div>
                <div className="ad-text-content ad-marquee-container">
                  <div className="ad-marquee-track">
                    {/* First copy */}
                    <div className="ad-marquee-content">
                      <h3 className="ad-title" style={{ display: 'inline', marginRight: '1rem', color: 'var(--coral)' }}>Découvrez GAME EARN</h3>
                      <span className="ad-desc">La plateforme ultime pour jouer, gagner des récompenses exclusives et rentabiliser votre passion pour les jeux vidéo. Joue, gagne, prends ta place parmi les meilleurs et rejoins nous bientôt!</span>
                      <span style={{ margin: '0 2rem', color: 'var(--coral)' }}>•</span>
                      <h3 className="ad-title" style={{ display: 'inline', marginRight: '1rem', color: 'var(--coral)' }}>Découvrez GAME EARN</h3>
                      <span className="ad-desc">La plateforme ultime pour jouer, gagner des récompenses exclusives et rentabiliser votre passion pour les jeux vidéo. Joue, gagne, prends ta place parmi les meilleurs et rejoins nous bientôt!</span>
                    </div>
                    {/* Second copy (identical for seamless loop) */}
                    <div className="ad-marquee-content" aria-hidden="true">
                      <h3 className="ad-title" style={{ display: 'inline', marginRight: '1rem', color: 'var(--coral)' }}>Découvrez GAME EARN</h3>
                      <span className="ad-desc">La plateforme ultime pour jouer, gagner des récompenses exclusives et rentabiliser votre passion pour les jeux vidéo. Joue, gagne, prends ta place parmi les meilleurs et rejoins nous bientôt!</span>
                      <span style={{ margin: '0 2rem', color: 'var(--coral)' }}>•</span>
                      <h3 className="ad-title" style={{ display: 'inline', marginRight: '1rem', color: 'var(--coral)' }}>Découvrez GAME EARN</h3>
                      <span className="ad-desc">La plateforme ultime pour jouer, gagner des récompenses exclusives et rentabiliser votre passion pour les jeux vidéo. Joue, gagne, prends ta place parmi les meilleurs et rejoins nous bientôt!</span>
                    </div>
                  </div>
                </div>
                <div className="ad-action">
                  <button type="button" className="ad-button" onClick={() => window.open('https://gameearn.com', '_blank')}>
                    Voir GAME EARN <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* ===== ANIMATION SECTION (restored) ===== */}
        <section className="content-stage">
          <HeroAnimation />

          <section className="platform-promo" aria-label="Ressources Technova Learning">
            <div className="promo-visual"><img src="/technova-learning.jpg" alt="Bibliothèque digitale représentant les ressources d'apprentissage" /></div>
            <div className="promo-copy">
              <div className="eyebrow"><span>01</span> ALLER PLUS LOIN</div>
              <h2>Transformez votre curiosité en compétences.</h2>
              <p>Technova Learning propose des formations tech et des e-books PLR autour de l'IA, de la data et de la cybersécurité.</p>
              <a href="https://www.technovalearning.com" target="_blank" rel="noreferrer" className="promo-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--text)', paddingBottom: '0.2rem', width: 'fit-content', marginTop: '1rem' }}>
                Explorer les ressources <span>&gt;</span>
              </a>
            </div>
          </section>

          <section className="community-section" aria-label="Progression et classement">
            <div className="progress-card">
              <div className="community-kicker">VOTRE COLLECTION</div>
              <h2>Les bons réflexes deviennent des badges.</h2>
              {isAuthenticated && user ? (
                <div className="community-auth">
                  <p>Vous êtes <strong>Niveau {user.level || 1}</strong> avec <strong>{user.xp || 0} XP</strong>. Cumulez 1000 XP pour passer au niveau supérieur !</p>
                  <Button type="button" onClick={handleAction}>Continuer la progression</Button>
                </div>
              ) : (
                <div className="community-auth">
                  <p>Connectez-vous pour conserver votre progression par thème et débloquer des badges exclusifs lors de vos parties.</p>
                  <Button type="button" onClick={handleAction}>Créer ma progression</Button>
                </div>
              )}
            </div>
            <div className="leaderboard-card">
              <div className="community-kicker"><Users size={17} aria-hidden="true" /> CLASSEMENT LIVE</div>
              <h2>Les esprits les plus affûtés.</h2>
              {leaderboardQuery.isLoading ? <p className="community-empty">Chargement du classement…</p> : leaderboardEntries.length > 0 ? (
                <ol className="leaderboard-list">
                  {leaderboardEntries.map((entry, index) => (
                    <li key={`${entry.userId}-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="leaderboard-rank">{String(index + 1).padStart(2, "0")}</span>
                      <strong>{entry.displayName}</strong>
                      <div style={{ marginLeft: 'auto', textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--coral)', textTransform: 'uppercase' }}>Niv {entry.level || 1}</span>
                         <span style={{ fontSize: '0.85rem' }}>{entry.xp || 0} XP</span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : <p className="community-empty">Le classement attend sa première session. À vous d'ouvrir le score.</p>}
            </div>
          </section>
        </section>
      </div>

      <footer className="site-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', opacity: 0.8 }}>
          <span style={{ fontWeight: 800, letterSpacing: '0.05em' }}>TECHNOVA QCM</span>
          <span>Jouez, apprenez, progressez.</span>
        </div>
        <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <a href="/privacy" style={{ color: 'var(--text)', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>Confidentialité</a>
          <a href="/terms" style={{ color: 'var(--text)', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>Conditions d'utilisation</a>
          <a href="mailto:support@technovalearning.com" style={{ color: 'var(--text)', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>Nous contacter</a>
        </div>
      </footer>
    </main>
  );
}
