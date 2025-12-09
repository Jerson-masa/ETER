'use client';
import Link from 'next/link';
import { useState } from 'react';

const plans = [
    {
        id: 'free',
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
        priceId: null,
    },
    {
        id: 'premium',
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
        priceId: 'price_premium', // Replace with actual Stripe Price ID
    },
    {
        id: 'vip',
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
        priceId: 'price_vip', // Replace with actual Stripe Price ID
    },
];

const faqs = [
    {
        question: '¿Qué son los créditos?',
        answer: 'Los créditos son la moneda dentro de ETER. Cada consulta al oráculo consume 5 créditos.',
    },
    {
        question: '¿Puedo cancelar mi suscripción?',
        answer: 'Sí, puedes cancelar en cualquier momento. Mantendrás acceso hasta el final del período pagado.',
    },
    {
        question: '¿Qué pasa si se me acaban los créditos?',
        answer: 'Puedes comprar créditos adicionales o esperar a tu próxima renovación mensual.',
    },
    {
        question: '¿Cómo funcionan las consultas ilimitadas?',
        answer: 'Con el plan Iluminado, puedes hacer todas las consultas que desees sin límite de créditos.',
    },
];

export default function PricingPage() {
    const [loading, setLoading] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);

    const handleSubscribe = async (plan) => {
        if (!plan.priceId) {
            // Free plan - redirect to signup
            window.location.href = '/login';
            return;
        }

        setLoading(plan.id);
        try {
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId: plan.priceId, planId: plan.id }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Error al procesar el pago');
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen py-24 px-8">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--primary)] rounded-full blur-[150px] opacity-10"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--accent)] rounded-full blur-[150px] opacity-10"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <Link href="/" className="inline-block mb-8 text-gray-400 hover:text-white transition-colors">
                        ← Volver al inicio
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Elige tu <span className="text-gradient-gold">Camino</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Selecciona el plan que mejor se adapte a tu búsqueda espiritual y comienza tu viaje hacia la iluminación.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-24">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.id}
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

                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={loading === plan.id}
                                className={`block text-center w-full py-3 rounded-full font-semibold text-sm uppercase tracking-wider transition-all ${plan.featured
                                        ? 'btn-gold'
                                        : 'border border-gray-700 text-gray-300 hover:bg-white/5'
                                    } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading === plan.id ? 'Procesando...' : plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="glass-panel rounded-2xl p-8 mb-24 overflow-x-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">Comparación de Planes</h2>
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Característica</th>
                                <th className="text-center py-4 px-4 text-gray-400 font-medium">Explorador</th>
                                <th className="text-center py-4 px-4 text-[var(--accent)] font-medium">Místico</th>
                                <th className="text-center py-4 px-4 text-gray-400 font-medium">Iluminado</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="border-b border-gray-800/50">
                                <td className="py-4 px-4">Créditos mensuales</td>
                                <td className="text-center py-4 px-4">5</td>
                                <td className="text-center py-4 px-4">50</td>
                                <td className="text-center py-4 px-4">∞</td>
                            </tr>
                            <tr className="border-b border-gray-800/50">
                                <td className="py-4 px-4">Consultas al oráculo</td>
                                <td className="text-center py-4 px-4">1</td>
                                <td className="text-center py-4 px-4">10</td>
                                <td className="text-center py-4 px-4">Ilimitadas</td>
                            </tr>
                            <tr className="border-b border-gray-800/50">
                                <td className="py-4 px-4">Interpretación de sueños</td>
                                <td className="text-center py-4 px-4 text-gray-500">—</td>
                                <td className="text-center py-4 px-4 text-[var(--primary)]">✓</td>
                                <td className="text-center py-4 px-4 text-[var(--primary)]">✓</td>
                            </tr>
                            <tr className="border-b border-gray-800/50">
                                <td className="py-4 px-4">Carta numerológica</td>
                                <td className="text-center py-4 px-4 text-gray-500">—</td>
                                <td className="text-center py-4 px-4 text-[var(--primary)]">✓</td>
                                <td className="text-center py-4 px-4 text-[var(--primary)]">✓</td>
                            </tr>
                            <tr className="border-b border-gray-800/50">
                                <td className="py-4 px-4">Carta astral completa</td>
                                <td className="text-center py-4 px-4 text-gray-500">—</td>
                                <td className="text-center py-4 px-4 text-gray-500">—</td>
                                <td className="text-center py-4 px-4 text-[var(--primary)]">✓</td>
                            </tr>
                            <tr className="border-b border-gray-800/50">
                                <td className="py-4 px-4">Predicciones mensuales</td>
                                <td className="text-center py-4 px-4 text-gray-500">—</td>
                                <td className="text-center py-4 px-4 text-gray-500">—</td>
                                <td className="text-center py-4 px-4 text-[var(--primary)]">✓</td>
                            </tr>
                            <tr>
                                <td className="py-4 px-4">Soporte prioritario</td>
                                <td className="text-center py-4 px-4 text-gray-500">—</td>
                                <td className="text-center py-4 px-4 text-gray-500">—</td>
                                <td className="text-center py-4 px-4 text-[var(--primary)]">✓</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* FAQ Section */}
                <div className="max-w-2xl mx-auto mb-24">
                    <h2 className="text-2xl font-bold mb-8 text-center">Preguntas Frecuentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="glass-panel rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                                >
                                    <span className="font-medium">{faq.question}</span>
                                    <span className="text-[var(--primary)] text-xl">{openFaq === index ? '−' : '+'}</span>
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-4 text-gray-400 text-sm animate-fade-in">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center glass-panel p-12 rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">¿Tienes dudas?</h2>
                        <p className="text-gray-400 mb-8">
                            Comienza con el plan gratuito y descubre el poder de ETER sin compromiso.
                        </p>
                        <Link href="/login" className="btn-primary inline-block no-underline text-black">
                            Probar Gratis
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
