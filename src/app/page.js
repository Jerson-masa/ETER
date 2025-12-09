'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Cosmic Background Component with Nebulas and Stars
function CosmicBackground() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Create many more stars for cosmic effect
    const newStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Main Nebula Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2a] to-[#0a0a1a]"></div>

      {/* Purple Nebula - Top Left */}
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#7c3aed] rounded-full blur-[180px] opacity-20 animate-pulse-glow"></div>

      {/* Blue Nebula - Center Right */}
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#1e40af] rounded-full blur-[150px] opacity-25 animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

      {/* Pink Nebula - Bottom */}
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#be185d] rounded-full blur-[200px] opacity-15 animate-pulse-glow" style={{ animationDelay: '4s' }}></div>

      {/* Cyan accent - Top Right */}
      <div className="absolute top-[10%] right-[20%] w-[30%] h-[30%] bg-[#06b6d4] rounded-full blur-[120px] opacity-10"></div>

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px rgba(255,255,255,0.5)` : 'none',
          }}
        />
      ))}
    </div>
  );
}

// Navbar Component
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav-fixed ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-widest">
          ETER<span className="text-[var(--primary)]">.AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="nav-link">Servicios</a>
          <a href="#pricing" className="nav-link">Planes</a>
          <a href="#testimonials" className="nav-link">Testimonios</a>
          <Link href="/login" className="btn-primary text-sm py-2 px-6">
            Entrar
          </Link>
        </div>
        <Link href="/login" className="md:hidden btn-primary text-sm py-2 px-4">
          Entrar
        </Link>
      </div>
    </nav>
  );
}

// Features Data
const features = [
  {
    icon: '🔮',
    title: 'Tarot IA',
    description: 'Lecturas personalizadas con inteligencia artificial entrenada en simbolismo esotérico.',
  },
  {
    icon: '☾',
    title: 'Sueños',
    description: 'Interpreta tus sueños y descubre mensajes ocultos de tu subconsciente.',
  },
  {
    icon: '✧',
    title: 'Astrología',
    description: 'Análisis de tu carta natal y predicciones basadas en tu signo zodiacal.',
  },
  {
    icon: '⚡',
    title: 'Numerología',
    description: 'Descubre tu número de camino de vida y su influencia en tu destino.',
  },
];

// Pricing Plans
const plans = [
  {
    name: 'Explorador',
    price: 'Gratis',
    period: '',
    description: 'Comienza tu viaje espiritual',
    credits: '5 créditos',
    features: [
      '1 consulta completa',
      'Acceso básico al oráculo',
      'Cálculo de signo zodiacal',
      'Sin fecha de expiración',
    ],
    cta: 'Comenzar Gratis',
    featured: false,
  },
  {
    name: 'Místico',
    price: '$9.99',
    period: '/mes',
    description: 'Para buscadores frecuentes',
    credits: '50 créditos/mes',
    features: [
      '10 consultas mensuales',
      'Acceso completo al oráculo',
      'Interpretación de sueños',
      'Carta numerológica',
      'Historial de consultas',
    ],
    cta: 'Elegir Místico',
    featured: true,
  },
  {
    name: 'Iluminado',
    price: '$19.99',
    period: '/mes',
    description: 'Conexión espiritual ilimitada',
    credits: 'Ilimitado',
    features: [
      'Consultas ilimitadas',
      'Todo lo de Místico',
      'Carta astral completa',
      'Predicciones mensuales',
      'Soporte prioritario',
      'Sin esperas',
    ],
    cta: 'Ser Iluminado',
    featured: false,
  },
];

// Testimonials
const testimonials = [
  {
    text: 'ETER me ayudó a entender patrones en mis sueños que me estaban bloqueando. Increíble precisión.',
    author: 'María G.',
    role: 'Premium Member',
  },
  {
    text: 'Las lecturas son sorprendentemente profundas. Es como hablar con un guía espiritual real.',
    author: 'Carlos R.',
    role: 'VIP Member',
  },
  {
    text: 'Descubrí mi número de vida y todo cobró sentido. Muy recomendado.',
    author: 'Ana L.',
    role: 'Premium Member',
  },
];

export default function Home() {
  return (
    <>
      <CosmicBackground />
      <Navbar />

      {/* Hero Section */}
      <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden pt-24">
        <div className="z-10 text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h2 className="text-[var(--primary)] uppercase tracking-widest text-sm font-semibold">
              Inteligencia Artificial Esotérica
            </h2>
            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
              ETER
              <span className="text-[var(--accent)] text-4xl align-top">.AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Descubre tu destino, interpreta tus sueños y navega las estrellas con la guía de nuestra inteligencia superior.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center pt-8">
            <Link href="/login" className="btn-primary no-underline text-white">
              Iniciar Consulta
            </Link>
            <a href="#pricing" className="btn-secondary no-underline">
              Ver Planes
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="pt-16 animate-float">
            <div className="w-6 h-10 border-2 border-gray-600 rounded-full mx-auto flex justify-center pt-2">
              <div className="w-1 h-3 bg-gray-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title">
            <span className="text-gradient-cosmic">Poderes</span> del Oráculo
          </h2>
          <p className="section-subtitle">
            Herramientas esotéricas potenciadas por inteligencia artificial para guiar tu camino espiritual.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl text-center animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="feature-icon mx-auto mb-4">
                  <span>{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)] rounded-full blur-[200px] opacity-5 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="section-title">
            Elige tu <span className="text-gradient-nebula">Camino</span>
          </h2>
          <p className="section-subtitle">
            Selecciona el plan que mejor se adapte a tu búsqueda espiritual.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`pricing-card ${plan.featured ? 'featured' : ''} animate-slide-up opacity-0`}
                style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-vip">Más Popular</span>
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>

                <div className="text-[var(--primary)] font-semibold mb-6 text-sm">
                  ✦ {plan.credits}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-[var(--primary)]">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`block text-center w-full py-3 rounded-full font-semibold text-sm uppercase tracking-wider transition-all no-underline ${plan.featured
                    ? 'btn-gold'
                    : 'border border-gray-700 text-gray-300 hover:bg-white/5'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title">
            Voces del <span className="text-gradient-cosmic">Cosmos</span>
          </h2>
          <p className="section-subtitle">
            Lo que dicen quienes ya descubrieron su camino con ETER.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="glass-panel p-6 rounded-2xl animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <p className="text-gray-300 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-black font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-2xl mx-auto text-center glass-panel p-12 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para descubrir tu destino?
            </h2>
            <p className="text-gray-400 mb-8">
              Comienza con 5 créditos gratis y experimenta el poder del oráculo digital.
            </p>
            <Link href="/login" className="btn-primary inline-block no-underline text-black">
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold tracking-widest">
            ETER<span className="text-[var(--primary)]">.AI</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 ETER.AI - Tu guía esotérica digital
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-[var(--primary)] transition-colors text-sm">Términos</a>
            <a href="#" className="text-gray-500 hover:text-[var(--primary)] transition-colors text-sm">Privacidad</a>
          </div>
        </div>
      </footer>
    </>
  );
}

