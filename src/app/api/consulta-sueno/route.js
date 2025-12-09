import { supabase } from '@/lib/supabaseClient';
import Groq from "groq-sdk";
import { calculateZodiacSign, calculateLifePathNumber } from '@/utils/esoteric';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
    try {
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

        // 2. Calcular datos esotéricos (si no vienen en el request, idealmente leemos de DB, pero calculamos aquí por robustez)
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

        // 5. Deducción de Créditos y Guardado (Transacción)
        // Hacemos esto 'optimista' o en transacción real si Supabase RPC lo permite, aquí paso a paso.
        const newCredits = user.current_credits - 5;

        const { error: updateError } = await supabase
            .from('users')
            .update({ current_credits: newCredits })
            .eq('id', userId);

        if (updateError) {
            console.error('Error actualizando créditos', updateError);
            // En producción, manejar rollback o cola de reintento
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
