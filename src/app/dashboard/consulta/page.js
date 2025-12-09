"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ConsultationPage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAnswer('');
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Check profile for name/birthdate (required for backend logic)
            const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

            if (!profile?.birth_date) {
                // Simple prompt if missing data (could be better UI modal)
                const dob = prompt("Para consultar las estrellas, necesito tu fecha de nacimiento (YYYY-MM-DD):");
                if (dob) {
                    await supabase.from('users').update({ birth_date: dob }).eq('id', user.id);
                } else {
                    setLoading(false);
                    return;
                }
            }

            const res = await fetch('/api/consulta-sueno', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    question,
                    userName: profile?.full_name || 'Buscador',
                    birthDate: profile?.birth_date || new Date().toISOString() // Fallback if prompt failed
                }),
            });

            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else {
                setAnswer(data.answer);
            }
        } catch (err) {
            setError('Error de conexión con el cosmos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 flex flex-col items-center">
            <div className="w-full max-w-2xl space-y-8">
                <header className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">← Volver</button>
                    <h1 className="text-xl font-bold tracking-widest text-[var(--primary)]">ORÁCULO</h1>
                    <div className="w-8"></div> {/* Spacer */}
                </header>

                <div className="glass-panel p-8 rounded-[2rem] min-h-[400px] flex flex-col justify-between">
                    <div className="space-y-6 flex-grow overflow-y-auto mb-6 custom-scrollbar">
                        {!answer && !loading && (
                            <div className="text-center text-gray-500 mt-20">
                                <p className="text-6xl mb-4 opacity-20">☾</p>
                                <p>Las estrellas esperan tu pregunta...</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[var(--primary)] animate-pulse text-sm">Consultando los astros...</p>
                            </div>
                        )}

                        {answer && (
                            <div className="prose prose-invert animate-float">
                                <h3 className="text-[var(--accent)] font-serif italic text-lg mb-4">El Oráculo responde:</h3>
                                <p className="text-lg leading-relaxed whitespace-pre-wrap">{answer}</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-center">
                                {error}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Escribe tu sueño o pregunta..."
                            className="w-full bg-black/50 border border-gray-700 rounded-full py-4 px-6 pr-16 focus:outline-none focus:border-[var(--primary)] transition-all"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !question}
                            className="absolute right-2 top-2 p-2 bg-[var(--primary)] text-black rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
