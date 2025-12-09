"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getUserData = async () => {
            // 1. Check Auth
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

            if (authError || !authUser) {
                router.push('/login');
                return;
            }

            // 2. Refresh DB data in case profile exists logic is missing in triggers
            // (Assuming a trigger creates the user or we handle it here on first login - simplified here)
            // Attempt to fetch profile
            let { data: profile, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();

            // If no profile, create it (First Time Login Logic fallback)
            if (!profile) {
                const { data: newProfile, error: createError } = await supabase.from('users').insert({
                    id: authUser.id,
                    email: authUser.email,
                    current_credits: 5 // Free credits
                }).select().single();

                if (!createError) profile = newProfile;
            }

            setUser(profile);
            setCredits(profile?.current_credits || 0);
            setLoading(false);
        };

        getUserData();

        // Listen for credit changes
        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
                if (payload.new.id === user?.id) setCredits(payload.new.current_credits);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }, [router]);


    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando energía cósmica...</div>;

    return (
        <div className="min-h-screen p-6 pb-24 md:p-12">
            <nav className="flex justify-between items-center mb-12">
                <h1 className="text-2xl font-bold tracking-widest uppercase">ETER</h1>
                <div className="flex items-center gap-4">
                    <div className="glass-panel px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                        <span className="text-[var(--primary)]">✦</span>
                        {credits} Créditos
                    </div>
                    <button onClick={handleLogout} className="text-xs uppercase tracking-wider hover:text-[var(--primary)]">Salir</button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

                {/* Quick Actions */}
                <div className="glass-panel p-8 rounded-[2rem] space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <h2 className="text-2xl font-bold">Nueva Consulta</h2>
                    <p className="text-gray-400">Pregunta al oráculo. Cada respuesta consume 5 créditos.</p>
                    <button onClick={() => router.push('/dashboard/consulta')} className="btn-primary w-full">
                        Consultar
                    </button>
                </div>

                {/* Status / Purchase */}
                <div className="glass-panel p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--accent)] blur-[60px] opacity-10"></div>
                    <h2 className="text-2xl font-bold">Tu Energía</h2>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <span>Saldo Actual</span>
                        <span className="text-2xl font-bold text-[var(--primary)]">{credits}</span>
                    </div>
                    <button className="w-full py-3 rounded-full border border-gray-700 hover:bg-white/5 transition-all text-sm uppercase tracking-wider">
                        Recargar Créditos
                    </button>
                </div>

                {/* History Preview */}
                <div className="md:col-span-2 glass-panel p-8 rounded-[2rem] space-y-6">
                    <h3 className="text-xl font-bold text-gray-300">Consultas Recientes</h3>
                    <div className="text-center py-12 text-gray-500 text-sm">
                        El historial estelar está vacío por ahora.
                    </div>
                </div>

            </main>
        </div>
    );
}
