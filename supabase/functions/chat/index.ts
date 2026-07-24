// Proxy para o OpenRouter: recebe a pergunta do usuário + contexto financeiro,
// injeta a API key (nunca exposta ao client) e retorna a resposta da IA.
// Também dá pra IA lançar transações de verdade via function calling quando o
// usuário relata um gasto/recebimento/aplicação em vez de só perguntar algo.
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const MODEL = "nvidia/nemotron-3-nano-30b-a3b:free";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatTurn = { from: "user" | "bot"; text: string };
type TipoTransacao = "receita" | "despesa" | "investimento";

const tipoLabel: Record<TipoTransacao, string> = {
  receita: "receita",
  despesa: "despesa",
  investimento: "investimento",
};

const statusFor: Record<TipoTransacao, string> = {
  receita: "recebido",
  despesa: "pago",
  investimento: "aplicado",
};

function buildRegistrarTransacaoTool(
  categorias: { nome: string; tipo: string }[],
  todayStr: string,
) {
  const porTipo = (tipo: string) =>
    categorias
      .filter((c) => c.tipo === tipo)
      .map((c) => c.nome)
      .join(", ") || "(nenhuma cadastrada)";

  return {
    type: "function",
    function: {
      name: "registrar_transacao",
      description: [
        "Registra uma nova transação financeira quando o usuário relata algo que já aconteceu",
        "(um gasto, um recebimento ou uma aplicação) — não use para perguntas ou pedidos de informação.",
        `Categorias de despesa disponíveis: ${porTipo("despesa")}.`,
        `Categorias de receita disponíveis: ${porTipo("receita")}.`,
        `Categorias de investimento disponíveis: ${porTipo("investimento")}.`,
        "Use exatamente um desses nomes de categoria, igual está escrito.",
        `Hoje é ${todayStr}. Só preencha o campo "data" se o usuário mencionar explicitamente quando aconteceu (ex: "ontem", "dia 10"); nunca invente uma data — se não for mencionada, deixe o campo de fora.`,
      ].join(" "),
      parameters: {
        type: "object",
        properties: {
          tipo: {
            type: "string",
            enum: ["receita", "despesa", "investimento"],
            description: "Tipo da transação",
          },
          valor: {
            type: "number",
            description: "Valor em reais, sempre positivo",
          },
          categoria: {
            type: "string",
            description: "Nome exato de uma das categorias disponíveis para o tipo escolhido",
          },
          descricao: {
            type: "string",
            description: "Descrição curta do que foi gasto/recebido/aplicado",
          },
          data: {
            type: "string",
            description: "Data no formato YYYY-MM-DD; se não informado, use a data de hoje",
          },
        },
        required: ["tipo", "valor", "categoria"],
      },
    },
  };
}

const handler = withSupabase(
  { auth: ["user"] },
  async (req, ctx) => {
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

    const userId = ctx.userClaims?.id;
    if (!userId) {
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("couple_id")
      .eq("id", userId)
      .maybeSingle();

    const coupleId = (profile as { couple_id: string | null } | null)?.couple_id ?? null;

    const { data: categoriasData } = coupleId
      ? await ctx.supabase.from("categories").select("nome, tipo")
      : { data: [] as { nome: string; tipo: string }[] };
    const categorias = categoriasData ?? [];

    const systemPrompt = [
      "Você é a assistente financeira do Nosso Bolso, um app de finanças pessoais que também pode ser compartilhado com um parceiro ou parceira.",
      "Responda em português do Brasil, de forma breve, prática e amigável.",
      "Escreva sempre em texto corrido, como numa conversa de chat — nunca use tabelas, listas markdown, negrito com asteriscos ou qualquer outra formatação markdown, pois o app exibe só texto simples.",
      "Só fale em \"casal\", \"vocês\" ou \"parceiro(a)\" se os dados abaixo mencionarem explicitamente um casal — se a conta for de uma pessoa só, fale na segunda pessoa do singular (\"você\", \"seus gastos\").",
      "Baseie suas respostas nos dados financeiros reais fornecidos abaixo.",
      "Se a pergunta não puder ser respondida com esses dados, seja honesta sobre isso.",
      "Se o usuário contar que gastou, recebeu ou aplicou algum valor, use a ferramenta registrar_transacao em vez de só responder em texto.",
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

    const todayStr = new Date().toISOString().slice(0, 10);
    const tools = coupleId ? [buildRegistrarTransacaoTool(categorias, todayStr)] : undefined;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        ...(tools ? { tools, tool_choice: "auto" } : {}),
      }),
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      return Response.json({ error: errText }, { status: 502 });
    }

    const data = await openRouterRes.json();
    const choice = data.choices?.[0]?.message;
    const toolCall = choice?.tool_calls?.[0];

    if (toolCall?.function?.name === "registrar_transacao" && coupleId) {
      let args: {
        tipo?: string;
        valor?: number;
        categoria?: string;
        descricao?: string;
        data?: string;
      } = {};
      try {
        args = JSON.parse(toolCall.function.arguments ?? "{}");
      } catch {
        // ignora, tratado como inválido abaixo
      }

      const tipo = args.tipo as TipoTransacao;
      const valor = typeof args.valor === "number" ? args.valor : parseFloat(String(args.valor));
      const categoriaValida = categorias.find(
        (c) => c.tipo === tipo && c.nome.toLowerCase() === String(args.categoria ?? "").toLowerCase(),
      );

      if (
        !tipo ||
        !["receita", "despesa", "investimento"].includes(tipo) ||
        !valor ||
        !(valor > 0) ||
        !categoriaValida
      ) {
        return Response.json({
          reply:
            "Quase consegui lançar isso, mas faltou uma informação (valor ou categoria válida). Pode confirmar o valor e a categoria?",
          transactionCreated: false,
        });
      }

      const today = new Date(`${todayStr}T00:00:00Z`);
      const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(args.data ?? "")
        ? new Date(`${args.data}T00:00:00Z`)
        : null;
      const diffDays = parsedDate
        ? (parsedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        : null;
      // margem de segurança: ignora datas absurdas (a IA às vezes "inventa" uma
      // data plausível em vez de deixar o campo de fora, então nunca confiamos
      // cegamente — só aceitamos algo entre ~1 ano atrás e 7 dias no futuro)
      const dataValida =
        diffDays !== null && diffDays >= -365 && diffDays <= 7
          ? (args.data as string)
          : todayStr;
      const descricao = args.descricao?.trim() || categoriaValida.nome;

      const { error: insertError } = await ctx.supabase.from("transactions").insert({
        couple_id: coupleId,
        pessoa_id: userId,
        type: tipo,
        amount: valor,
        categoria: categoriaValida.nome,
        descricao,
        data: dataValida,
        status: statusFor[tipo],
      });

      if (insertError) {
        return Response.json({
          reply: "Não consegui salvar essa transação agora. Tenta de novo em instantes.",
          transactionCreated: false,
        });
      }

      const valorFmt = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      return Response.json({
        reply: `Lancei ${tipoLabel[tipo]} de ${valorFmt} em ${categoriaValida.nome} — ${descricao} ✅`,
        transactionCreated: true,
      });
    }

    const reply: string = choice?.content ?? "Desculpe, não consegui responder agora.";
    return Response.json({ reply, transactionCreated: false });
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
