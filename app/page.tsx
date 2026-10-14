"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Icon } from "design-system-zeroz";

import "./landing.scss";

const features = [
  {
    icon: "trending_down",
    title: "Registro de despesas",
    description:
      "Cadastre seus gastos e organize tudo por categorias para saber exatamente para onde o dinheiro vai.",
  },
  {
    icon: "trending_up",
    title: "Registro de ganhos",
    description:
      "Lance suas receitas e identifique cada fonte de renda para enxergar de onde o dinheiro vem.",
  },
  {
    icon: "credit_card",
    title: "Formas de pagamento",
    description:
      "Associe cada despesa a um cartão, dinheiro, Pix ou qualquer forma de pagamento que você use.",
  },
  {
    icon: "monitoring",
    title: "Dashboard interativo",
    description:
      "Gráficos de linha, barras e pizza com filtros por período para analisar suas finanças.",
  },
  {
    icon: "upload_file",
    title: "Importação de transações",
    description:
      "Traga seus lançamentos de arquivos CSV em vez de digitar um por um.",
  },
  {
    icon: "dark_mode",
    title: "Tema claro e escuro",
    description:
      "Use o MeuDim do jeito mais confortável para você, a qualquer hora do dia.",
  },
];

const steps = [
  {
    title: "Crie sua conta",
    description:
      "Leva menos de um minuto. Basta informar nome, e-mail e uma senha.",
  },
  {
    title: "Registre ganhos e despesas",
    description:
      "Cadastre categorias, fontes de renda e formas de pagamento, depois lance suas movimentações.",
  },
  {
    title: "Acompanhe no dashboard",
    description:
      "Veja gráficos, filtre por data e tome decisões mais conscientes sobre o seu dinheiro.",
  },
];

const planItems = [
  "Despesas e ganhos ilimitados",
  "Categorias e fontes de renda",
  "Formas de pagamento",
  "Dashboard com gráficos e filtros",
  "Importação de transações via CSV",
];

const screens = [
  {
    light: "/screens/dashboard-light.png",
    dark: "/screens/dashboard-dark.png",
    title: "Dashboard",
    description:
      "Gráficos e filtros por período mostram em segundos como estão seus ganhos e gastos.",
  },
  {
    light: "/screens/despesas-light.png",
    dark: "/screens/despesas-dark.png",
    title: "Despesas",
    description:
      "Lance gastos com categoria e forma de pagamento, ou importe de um arquivo CSV.",
  },
  {
    light: "/screens/ganhos-light.png",
    dark: "/screens/ganhos-dark.png",
    title: "Ganhos",
    description:
      "Registre suas receitas e acompanhe de qual fonte de renda cada valor veio.",
  },
];

function ScreenFrame({
  light,
  dark,
  alt,
}: {
  light: string;
  dark: string;
  alt: string;
}) {
  const [lightFailed, setLightFailed] = useState(false);
  const [darkFailed, setDarkFailed] = useState(false);
  const allFailed = lightFailed && darkFailed;

  return (
    <div className="landing-frame">
      <div className="landing-frame-bar" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div
        className="landing-frame-body"
        data-light-failed={lightFailed || undefined}
        data-dark-failed={darkFailed || undefined}
      >
        {allFailed ? (
          <div className="landing-frame-placeholder">
            <Icon icon="image" size="lg" />
            <span>
              Adicione as imagens em public{light} e public{dark}
            </span>
          </div>
        ) : (
          <>
            {/* eslint-disable @next/next/no-img-element */}
            <img
              className="img-light"
              src={light}
              alt={alt}
              loading="lazy"
              onError={() => setLightFailed(true)}
            />
            <img
              className="img-dark"
              src={dark}
              alt={alt}
              loading="lazy"
              onError={() => setDarkFailed(true)}
            />
            {/* eslint-enable @next/next/no-img-element */}
          </>
        )}
      </div>
    </div>
  );
}

const delay = (i: number) =>
  ({ "--delay": `${i * 90}ms` }) as React.CSSProperties;

export default function Home() {
  const router = useRouter();
  const [revealReady, setRevealReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    setRevealReady(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => observer.observe(el));

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const goToLogin = () => router.push("/auth/login");
  const goToRegister = () => router.push("/auth/register");

  return (
    <div className={`landing${revealReady ? " reveal-ready" : ""}`}>
      <header className={`landing-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="landing-container landing-header-inner">
          <Image
            src="/meuDim.svg"
            alt="MeuDim"
            width={112}
            height={32}
            priority
          />
          <div className="landing-actions">
            <Button variant="secondary" size="md" onClick={goToLogin}>
              Entrar
            </Button>
            <Button variant="primary" size="md" onClick={goToRegister}>
              Criar conta
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-inner">
            <div className="landing-hero-text" data-reveal="up">
              <Badge
                label="Controle financeiro pessoal"
                type="light"
                variant="primary"
              />
              <h1>Entenda para onde seu dinheiro está indo</h1>
              <p>
                O MeuDim ajuda você a registrar ganhos e despesas, organizar por
                categorias e acompanhar tudo em um dashboard claro, para decidir
                melhor sobre as suas finanças.
              </p>
              <div className="landing-actions">
                <Button variant="primary" size="md" onClick={goToRegister}>
                  Criar conta
                </Button>
                <Button variant="secondary" size="md" onClick={goToLogin}>
                  Entrar
                </Button>
              </div>
            </div>
            <div
              className="landing-hero-media"
              data-reveal="left"
              style={delay(2)}
            >
              <video
                src="/video.mp4"
                autoPlay
                muted
                loop
                playsInline
                aria-label="Demonstração do MeuDim"
              />
            </div>
          </div>
        </section>

        <section className="landing-section" id="funcionalidades">
          <div className="landing-container">
            <header className="landing-section-header" data-reveal="up">
              <h2>Funcionalidades</h2>
              <p>
                Tudo o que você precisa para ter o controle das suas finanças.
              </p>
            </header>
            <div className="landing-grid">
              {features.map((feature, i) => (
                <div key={feature.title} data-reveal="up" style={delay(i % 3)}>
                  <Card>
                    <Card.Header>
                      <span className="landing-feature-icon">
                        <Icon icon={feature.icon} size="md" />
                      </span>
                      <h1>{feature.title}</h1>
                      <p>{feature.description}</p>
                    </Card.Header>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-alt" id="telas">
          <div className="landing-container">
            <header className="landing-section-header" data-reveal="up">
              <h2>Veja o MeuDim por dentro</h2>
              <p>
                Uma olhada nas telas do sistema para entender como tudo
                funciona.
              </p>
            </header>
            <div className="landing-showcase">
              {screens.map((screen, i) => (
                <article
                  key={screen.title}
                  className={`landing-showcase-row${i % 2 ? " reverse" : ""}`}
                >
                  <div
                    className="landing-showcase-text"
                    data-reveal={i % 2 ? "right" : "left"}
                  >
                    <span className="landing-step-number">{i + 1}</span>
                    <h3>{screen.title}</h3>
                    <p>{screen.description}</p>
                  </div>
                  <div data-reveal={i % 2 ? "left" : "right"} style={delay(1)}>
                    <ScreenFrame
                      light={screen.light}
                      dark={screen.dark}
                      alt={`Tela de ${screen.title} do MeuDim`}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section" id="como-funciona">
          <div className="landing-container">
            <header className="landing-section-header" data-reveal="up">
              <h2>Como funciona</h2>
              <p>Do cadastro ao dashboard em três passos simples.</p>
            </header>
            <ol className="landing-steps">
              {steps.map((step, index) => (
                <li key={step.title} data-reveal="up" style={delay(index)}>
                  <span className="landing-step-number">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="landing-section landing-section-alt" id="preco">
          <div className="landing-container">
            <header className="landing-section-header" data-reveal="up">
              <h2>Preço</h2>
              <p>Simples e sem surpresas.</p>
            </header>
            <div className="landing-pricing" data-reveal="zoom">
              <Card>
                <Card.Header>
                  <h1>Gratuito</h1>
                  <p>Tudo o que você precisa para organizar suas finanças.</p>
                </Card.Header>
                <Card.Content>
                  <div className="landing-price">
                    <strong>R$ 0</strong>
                    <span>/mês</span>
                  </div>
                  <ul className="landing-plan-items">
                    {planItems.map((item) => (
                      <li key={item}>
                        <Icon icon="check_circle" size="sm" fill />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card.Content>
                <Card.Footer>
                  <Button variant="primary" size="md" onClick={goToRegister}>
                    Criar conta
                  </Button>
                  <Button variant="secondary" size="md" onClick={goToLogin}>
                    Entrar
                  </Button>
                </Card.Footer>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container">
          <p>
            © {new Date().getFullYear()} MeuDim. Desenvolvido por Evandro Metz.
          </p>
        </div>
      </footer>
    </div>
  );
}
