// Proxy para o OpenRouter: recebe a pergunta do usuário + contexto financeiro,
// injeta a API key (nunca exposta ao client) e retorna a resposta da IA.
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const MODEL = "anthropic/claude-3.5-haiku";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatTurn = { from: "user" | "bot"; text: string };

const handler = withSupabase(
  { auth: ["publishable"] },
  async (req) => {
    if (!OPENROUTER_API_KEY) {
      return Response.json(
        { error: "OPENROUTER_API_KEY não configurada nos secrets da função." },
        { status: 500 },
      );
    }

    const { message, history, financialContext } = (await req.json()) as {
      message: string;
      history?: ChatTurn[];
      financialContext?: string;
    };

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Campo 'message' é obrigatório." }, { status: 400 });
    }

    const systemPrompt = [
      "Você é a assistente financeira do Nosso Bolso, um app de finanças para casais.",
      "Responda em português do Brasil, de forma breve, prática e amigável.",
      "Baseie suas respostas nos dados financeiros reais do casal fornecidos abaixo.",
      "Se a pergunta não puder ser respondida com esses dados, seja honesta sobre isso.",
      "",
      financialContext ?? "",
    ].join("\n");

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).map((turn) => ({
        role: turn.from === "user" ? "user" : "assistant",
        content: turn.text,
      })),
      { role: "user", content: message },
    ];

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, messages }),
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      return Response.json({ error: errText }, { status: 502 });
    }

    const data = await openRouterRes.json();
    const reply: string =
      data.choices?.[0]?.message?.content ?? "Desculpe, não consegui responder agora.";

    return Response.json({ reply });
  },
);

export default {
  fetch: async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const res = await handler(req);
    const headers = new Headers(res.headers);
    for (const [key, value] of Object.entries(corsHeaders)) headers.set(key, value);
    return new Response(res.body, { status: res.status, headers });
  },
};
