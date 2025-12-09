"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [credits, setCredits] = useState(0);
    const [tier, setTier] = useState('free');
    const [loading, setLoading] = useState(true);
    const [consultations, setConsultations] = useState([]);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check for successful payment
        if (searchParams.get('success') === 'true') {
            const plan = searchParams.get('plan');
            alert(`¡Bienvenido al plan ${plan?.toUpperCase() || 'Premium'}! 🎉`);
        }
    }, [searchParams]);

    useEffect(() => {
        const getUserData = async () => {
            // 1. Check Auth
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

            if (authError || !authUser) {
                router.push('/login');
                return;
            }

            // 2. Fetch profile
            let { data: profile, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();

            // If no profile, create it (First Time Login Logic)
            if (!profile) {
                const { data: newProfile, error: createError } = await supabase.from('users').insert({
                    id: authUser.id,
                    email: authUser.email,
                    current_credits: 5,
                    subscription_tier: 'free',
                    subscription_status: 'active'
                }).select().single();

                if (!createError) profile = newProfile;
            }

            setUser(profile);
            setCredits(profile?.current_credits || 0);
            setTier(profile?.subscription_tier || 'free');

            // 3. Fetch recent consultations
            const { data: consults } = await supabase
                .from('consultations')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(5);

            setConsultations(consults || []);
            setLoading(false);
        };

        getUserData();

        // Listen for credit changes
        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
                if (payload.new.id === user?.id) {
                    setCredits(payload.new.current_credits);
                    setTier(payload.new.subscription_tier);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }, [router]);


    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const getBadgeClass = () => {
        switch (tier) {
            case 'vip': return 'badge-vip';
            case 'premium': return 'badge-premium';
            default: return 'badge-free';
        }
    };

    const getTierName = () => {
        switch (tier) {
            case 'vip': return 'Iluminado';
            case 'premium': return 'Místico';
            default: return 'Explorador';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[var(--primary)] animate-pulse">Cargando energía cósmica...</p>
        </div>
    );

    return (
        <div className="min-h-screen p-6 pb-24 md:p-12">
            <nav className="flex justify-between items-center mb-12">
                <Link href="/" className="text-2xl font-bold tracking-widest uppercase no-underline text-white">
                    ETER<span className="text-[var(--primary)]">.AI</span>
                </Link>
                <div className="flex items-center gap-4">
                    <span className={`badge ${getBadgeClass()}`}>
                        {getTierName()}
                    </span>
                    <div className="glass-panel px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                        <span className="text-[var(--primary)]">✦</span>
                        {tier === 'vip' ? '∞' : credits} Créditos
                    </div>
                    <button onClick={handleLogout} className="text-xs uppercase tracking-wider hover:text-[var(--primary)] transition-colors">
                        Salir
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

                {/* Quick Actions */}
                <div className="glass-panel p-8 rounded-[2rem] space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <h2 className="text-2xl font-bold">Nueva Consulta</h2>
                    <p className="text-gray-400">
                        {tier === 'vip'
                            ? 'Tienes consultas ilimitadas. ¡Pregunta lo que quieras!'
                            : 'Pregunta al oráculo. Cada respuesta consume 5 créditos.'}
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/consulta')}
                        className="btn-primary w-full"
                        disabled={tier !== 'vip' && credits < 5}
                    >
                        {tier !== 'vip' && credits < 5 ? 'Sin créditos' : 'Consultar'}
                    </button>
                </div>

                {/* Status / Upgrade */}
                <div className="glass-panel p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--accent)] blur-[60px] opacity-10"></div>
                    <h2 className="text-2xl font-bold">Tu Energía</h2>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <span>Saldo Actual</span>
                        <span className="text-2xl font-bold text-[var(--primary)]">
                            {tier === 'vip' ? '∞' : credits}
                        </span>
                    </div>

                    {tier === 'free' ? (
                        <Link
                            href="/pricing"
                            className="btn-gold w-full block text-center no-underline"
                        >
                            ✦ Subir de Nivel
                        </Link>
                    ) : (
                        <div className="text-center text-sm text-gray-400">
                            Plan {getTierName()} activo
                        </div>
                    )}
                </div>

                {/* History */}
                <div className="md:col-span-2 glass-panel p-8 rounded-[2rem] space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-300">Consultas Recientes</h3>
                        {consultations.length > 0 && (
                            <span className="text-xs text-gray-500">{consultations.length} consultas</span>
                        )}
                    </div>

                    {consultations.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-sm">
                            <span className="text-4xl block mb-4 opacity-30">☾</span>
                            El historial estelar está vacío por ahora.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {consultations.map((consult) => (
                                <div
                                    key={consult.id}
                                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <p className="text-sm text-gray-400 line-clamp-1 flex-1">
                                            {consult.question}
                                        </p>
                                        <span className="text-xs text-gray-600 whitespace-nowrap">
                                            {formatDate(consult.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 line-clamp-2">
                                        {consult.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

