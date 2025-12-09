import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
// import Stripe from 'stripe'; 
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Nota: Para producción, descomentar la verificación de firma de Stripe.
// Por ahora, implementamos la lógica base de recepción y actualización.

export async function POST(request) {
    try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured() || !supabase) {
            return Response.json({ error: 'Servicio no disponible' }, { status: 503 });
        }

        const body = await request.text();
        // const sig = request.headers.get('stripe-signature');

        // let event;
        // try {
        //   event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        // } catch (err) {
        //   return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        // }

        // Simulación de evento para MVP sin claves de Stripe aún
        const event = JSON.parse(body);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Metadatos enviados al crear la sesión en Stripe
            const userId = session.metadata.userId;
            const creditsAmount = parseInt(session.metadata.credits || '0');

            if (userId && creditsAmount > 0) {
                // 1. Obtener usuario actual
                const { data: user } = await supabase.from('users').select('current_credits').eq('id', userId).single();

                if (user) {
                    const newBalance = (user.current_credits || 0) + creditsAmount;

                    // 2. Actualizar créditos
                    await supabase.from('users').update({ current_credits: newBalance }).eq('id', userId);

                    // 3. Registrar transacción
                    await supabase.from('transactions').insert({
                        user_id: userId,
                        amount: session.amount_total / 100, // Stripe amount is in cents
                        currency: session.currency,
                        credits_purchased: creditsAmount,
                        stripe_payment_id: session.id,
                        status: 'completed'
                    });
                }
            }
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Error en Webhook:', error);
        return Response.json({ error: 'Server Error' }, { status: 500 });
    }
}
