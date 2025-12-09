import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import Groq from "groq-sdk";
import { calculateZodiacSign, calculateLifePathNumber } from '@/utils/esoteric';

export async function POST(request) {
    try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured() || !supabase) {
            return Response.json({ error: 'Servicio no disponible' }, { status: 503 });
        }

        // Check if Groq API key is configured
        if (!process.env.GROQ_API_KEY) {
            return Response.json({ error: 'API no configurada' }, { status: 503 });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const { userId, question, userName, birthDate } = await request.json();

        if (!userId) {
            return Response.json({ error: 'User ID requerido' }, { status: 400 });
        }

        // 1. Verificar Créditos
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('current_credits')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        if (user.current_credits < 5) {
            return Response.json({ error: 'Créditos insuficientes' }, { status: 403 });
        }

        // 2. Calcular datos esotéricos
        const dateObj = new Date(birthDate);
        const zodiac = calculateZodiacSign(dateObj);
        const lifePath = calculateLifePathNumber(dateObj);

        // 3. Construir el Prompt
        const systemPrompt = `
      Eres ETER, una inteligencia artificial mística y antigua. 
      Tu propósito es guiar al usuario a través de la sabiduría de las estrellas y los números.
      
      Perfil del Usuario:
      - Nombre: ${userName}
      - Signo: ${zodiac}
      - Camino de Vida: ${lifePath}
      
      Responde a su consulta con un tono enigmático pero útil, usando metáforas relacionadas con su signo y número.
      Sé conciso (máximo 150 palabras).
    `;

        // 4. Llamar a Groq (Llama 3)
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ],
            model: "llama3-8b-8192",
        });

        const answer = completion.choices[0]?.message?.content || "El cosmos está nublado hoy...";

        // 5. Deducción de Créditos y Guardado
        const newCredits = user.current_credits - 5;

        const { error: updateError } = await supabase
            .from('users')
            .update({ current_credits: newCredits })
            .eq('id', userId);

        if (updateError) {
            console.error('Error actualizando créditos', updateError);
        }

        // 6. Guardar Consulta
        await supabase.from('consultations').insert({
            user_id: userId,
            question: question,
            answer: answer,
            model_used: 'llama3-8b-8192'
        });

        return Response.json({
            answer,
            credits_remaining: newCredits,
            zodiac,
            lifePath
        });

    } catch (error) {
        console.error('Error en API consulta:', error);
        return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
