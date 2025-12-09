import { NextResponse } from 'next/server';

// Stripe will be initialized when keys are available
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
    premium: {
        name: 'Místico',
        credits: 50,
        priceAmount: 999, // in cents
    },
    vip: {
        name: 'Iluminado',
        credits: -1, // -1 = unlimited
        priceAmount: 1999,
    },
};

export async function POST(request) {
    try {
        const { priceId, planId } = await request.json();

        // Validate plan
        if (!planId || !PLANS[planId]) {
            return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
        }

        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                {
                    error: 'Sistema de pagos no configurado. Por favor configura STRIPE_SECRET_KEY.',
                    needsConfig: true
                },
                { status: 503 }
            );
        }

        // Dynamic import of Stripe
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Get the origin for redirect URLs
        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard?success=true&plan=${planId}`,
            cancel_url: `${origin}/pricing?canceled=true`,
            metadata: {
                planId,
                credits: PLANS[planId].credits,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);

        // Handle specific Stripe errors
        if (error.type === 'StripeInvalidRequestError') {
            return NextResponse.json(
                { error: 'Configuración de Stripe incorrecta. Verifica los Price IDs.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error al crear la sesión de pago' },
            { status: 500 }
        );
    }
}
