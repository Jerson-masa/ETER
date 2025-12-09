import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary)] rounded-full blur-[120px] mix-blend-screen opacity-20"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent)] rounded-full blur-[120px] mix-blend-screen opacity-20"></div>
      </div>

      <div className="z-10 text-center max-w-4xl mx-auto space-y-8 glass-panel p-12 rounded-[2rem] animate-float">
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
          <Link href="/login" className="btn-primary no-underline text-black">
            Iniciar Consulta
          </Link>
          <button className="px-8 py-3 rounded-full border border-gray-700 text-gray-300 hover:bg-white/5 transition-all uppercase tracking-wider text-sm font-medium">
            Ver Planes
          </button>
        </div>
      </div>
    </main>
  );
}
