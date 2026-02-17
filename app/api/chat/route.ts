import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'AI API Key not configured' }, { status: 500 });
        }

        // System Prompt - Define the AI persona
        const systemPrompt = `You are a helpful, friendly, and professional virtual assistant for WIDAMA Pharmacy.
Your goal is to assist customers with questions about medicines, health products, and pharmacy services.
- Be concise and polite.
- If you don't know an answer, advise them to contact the pharmacy directly at 0546014734.
- Do NOT provide medical advice or prescriptions.
- You can mention we are located at WIDAMA Towers, Ashaiman Lebanon.
- Current Time: ${new Date().toLocaleString()}
`;

        // Filter and format history for the API
        // We only send the last 10 messages to keep context but save tokens
        const recentHistory = history.slice(-10).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant', // Map 'agent' to 'assistant'
            content: msg.content
        }));

        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentHistory,
            { role: 'user', content: message }
        ];

        // Call Groq API (OpenAI compatible endpoint)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error:', errorData);
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
