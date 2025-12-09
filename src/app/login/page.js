"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) alert(error.message);
        else router.push('/dashboard');
        setLoading(false);
    };

    const handleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) alert(error.message);
        else alert('¡Revisa tu correo para confirmar!');
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-[var(--primary)] rounded-full blur-[100px] opacity-20 animate-pulse"></div>
            </div>

            <div className="glass-panel p-8 rounded-2xl w-full max-w-md space-y-6 z-10 border border-white/10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Bienvenido a <span className="text-[var(--primary)]">ETER</span></h1>
                    <p className="text-gray-400 text-sm">Tu puerta al conocimiento cósmico.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-gray-800 rounded-lg p-3 text-white focus:border-[var(--primary)] focus:outline-none transition-colors"
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-gray-800 rounded-lg p-3 text-white focus:border-[var(--primary)] focus:outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            disable={loading}
                            type="submit"
                            className="w-full btn-primary flex items-center justify-center">
                            {loading ? 'Cargando...' : 'Entrar'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSignUp}
                            className="w-full py-3 rounded-full border border-gray-700 text-gray-300 hover:bg-white/5 transition-all text-sm font-medium">
                            Crear Cuenta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
