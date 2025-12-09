import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

// Plans configuration
const PLANS = {
    premium: { credits: 50, tier: 'premium' },
    vip: { credits: -1, tier: 'vip' }, // -1 = unlimited
};

export async function POST(request) {
    try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured() || !supabase) {
            return Response.json({ error: 'Servicio no disponible' }, { status: 503 });
        }

        const body = await request.text();

        // Verify Stripe signature in production
        let event;
        if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
            const sig = request.headers.get('stripe-signature');
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

            try {
                event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
            } catch (err) {
                console.error('Webhook signature verification failed:', err.message);
                return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
            }
        } else {
            // Development mode - parse without verification
            event = JSON.parse(body);
        }

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await handleCheckoutComplete(session);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await handleSubscriptionCanceled(subscription);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                await handleInvoicePaid(invoice);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Error en Webhook:', error);
        return Response.json({ error: 'Server Error' }, { status: 500 });
    }
}

// Handle successful checkout
async function handleCheckoutComplete(session) {
    const { planId, credits } = session.metadata || {};
    const customerEmail = session.customer_email || session.customer_details?.email;

    if (!customerEmail) {
        console.log('No customer email found in session');
        return;
    }

    // Find user by email
    const { data: user } = await supabase
        .from('users')
        .select('id, current_credits')
        .eq('email', customerEmail)
        .single();

    if (!user) {
        console.log('User not found for email:', customerEmail);
        return;
    }

    const plan = PLANS[planId] || { credits: parseInt(credits) || 0, tier: 'free' };

    // Update user subscription
    await supabase.from('users').update({
        subscription_tier: plan.tier,
        subscription_status: 'active',
        stripe_customer_id: session.customer,
        current_credits: plan.credits === -1
            ? 999999 // Unlimited represented as high number
            : (user.current_credits || 0) + plan.credits,
    }).eq('id', user.id);

    // Record transaction
    await supabase.from('transactions').insert({
        user_id: user.id,
        amount: session.amount_total / 100,
        currency: session.currency || 'usd',
        credits_purchased: plan.credits === -1 ? 0 : plan.credits,
        stripe_payment_id: session.id,
        status: 'completed'
    });
}

// Handle subscription updates (upgrade/downgrade)
async function handleSubscriptionUpdate(subscription) {
    const customerId = subscription.customer;

    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!user) return;

    await supabase.from('users').update({
        subscription_status: subscription.status,
        subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
    }).eq('id', user.id);
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription) {
    const customerId = subscription.customer;

    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!user) return;

    // Downgrade to free tier
    await supabase.from('users').update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
    }).eq('id', user.id);
}

// Handle monthly subscription renewal
async function handleInvoicePaid(invoice) {
    if (invoice.billing_reason !== 'subscription_cycle') return;

    const customerId = invoice.customer;

    const { data: user } = await supabase
        .from('users')
        .select('id, subscription_tier')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!user) return;

    const plan = PLANS[user.subscription_tier];
    if (!plan) return;

    // Renew credits for the new billing cycle
    if (plan.credits > 0) {
        await supabase.from('users').update({
            current_credits: plan.credits,
        }).eq('id', user.id);
    }

    // Record renewal transaction
    await supabase.from('transactions').insert({
        user_id: user.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        credits_purchased: plan.credits === -1 ? 0 : plan.credits,
        stripe_payment_id: invoice.id,
        status: 'completed'
    });
}

