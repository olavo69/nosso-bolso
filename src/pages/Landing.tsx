import { useEffect, useState } from 'react'
import { Link } from 'react-router'

const trustMessages = [
  'Seus dados ficam só entre vocês dois.',
  'Metas compartilhadas, sem perder o prazo de vista.',
  'Orçamento avisa antes de estourar o limite.',
  'Perguntem pro app sobre os gastos, na hora.',
]

const features = [
  {
    bg: 'oklch(94% 0.03 150)',
    fg: 'oklch(45% 0.14 150)',
    icon: '👀',
    title: 'Uma visão, duas contas',
    desc: 'Vejam juntos o saldo do mês, receitas, despesas e investimentos — filtrando por individual ou casal, sem comparar extratos separados.',
  },
  {
    bg: 'oklch(94% 0.03 40)',
    fg: 'oklch(45% 0.14 40)',
    icon: '🎯',
    title: 'Metas que os dois puxam',
    desc: 'Viagem, casa própria, casamento: criem a meta, acompanhem o progresso e saibam exatamente quanto falta pra chegar lá.',
  },
  {
    bg: 'oklch(94% 0.03 20)',
    fg: 'oklch(45% 0.14 20)',
    icon: '⚠',
    title: 'Orçamento que avisa antes de estourar',
    desc: 'Cada categoria tem um limite. A barra muda de cor quando o gasto do mês está passando do combinado.',
  },
  {
    bg: 'oklch(94% 0.03 260)',
    fg: 'oklch(45% 0.14 260)',
    icon: '💬',
    title: 'Perguntem pro app, não pra planilha',
    desc: '"Quanto gastamos com lazer esse mês?" A IA responde com base nos dados reais de vocês, na hora.',
  },
  {
    bg: 'oklch(94% 0.03 200)',
    fg: 'oklch(45% 0.14 200)',
    icon: '🔗',
    title: 'Duas contas, uma vida financeira',
    desc: 'Cada um mantém seu login, mas lançamentos, metas e categorias ficam automaticamente compartilhados pelo casal.',
  },
  {
    bg: 'oklch(94% 0.03 330)',
    fg: 'oklch(45% 0.14 330)',
    icon: '📊',
    title: 'Histórico sempre à mão',
    desc: 'Extrato mensal com filtro por período, pessoa e status — pago, pendente ou recorrente, tudo organizado.',
  },
]

const steps = [
  {
    number: 1,
    title: 'Criem a conta',
    desc: 'Cadastro rápido com e-mail ou Google.',
  },
  {
    number: 2,
    title: 'Convidem o parceiro(a)',
    desc: 'Um código de convite vincula as duas contas.',
  },
  {
    number: 3,
    title: 'Lancem e acompanhem juntos',
    desc: 'Toda despesa, meta e conquista, visível pros dois.',
  },
]

const testimonials = [
  {
    quote: 'Paramos de brigar sobre quem pagou o quê. Agora está tudo num lugar só.',
    name: 'Camila R.',
    role: 'usa há 8 meses',
    initials: 'CR',
    color: '#D9C9A3',
  },
  {
    quote: 'A IA me lembra dos gastos que eu nem lembrava que tinha feito.',
    name: 'Rafael T.',
    role: 'usa há 1 ano',
    initials: 'RT',
    color: '#A9C9B8',
  },
  {
    quote: 'Conseguimos juntar dinheiro pro casamento vendo a meta crescer toda semana.',
    name: 'Beatriz & Lucas',
    role: 'usam há 5 meses',
    initials: 'BL',
    color: '#BFD3E8',
  },
]

const faqs = [
  {
    q: 'Preciso ter uma conta bancária conjunta?',
    a: 'Não. Cada um mantém sua própria conta e login — o app une os lançamentos de forma automática, sem misturar contas bancárias reais.',
  },
  {
    q: 'Posso usar sozinho, sem convidar o parceiro?',
    a: 'Sim. O modo Individual funciona completo; o convite ao parceiro é opcional e pode ser feito quando quiserem.',
  },
  {
    q: 'Meus dados financeiros ficam visíveis pra outras pessoas?',
    a: 'Não. Só você e a pessoa que você convidar têm acesso às informações da conta.',
  },
  {
    q: 'O app é pago?',
    a: 'O plano casal é gratuito. Recursos avançados futuros serão opcionais.',
  },
  {
    q: 'Consigo ver gastos por pessoa mesmo compartilhando tudo?',
    a: 'Sim. Dashboard e extrato têm filtro por Individual, Casal ou por pessoa específica.',
  },
]

function Eyebrow({ children, center }: { children: string; center?: boolean }) {
  return (
    <div
      className={`text-[13px] font-bold tracking-[0.04em] text-accent uppercase ${center ? 'text-center' : ''}`}
    >
      {children}
    </div>
  )
}

function RotatingTrustLine() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % trustMessages.length)
        setVisible(true)
      }, 300)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-0.5 flex items-center gap-2 text-[13px] text-text-muted">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {trustMessages[index]}
      </span>
    </div>
  )
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-[15px] font-bold text-text"
      >
        {q}
        <span className="ml-4 text-lg text-text-muted">{open ? '–' : '+'}</span>
      </button>
      {open && <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">{a}</p>}
    </div>
  )
}

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="bg-bg text-text">
      <header className="mx-auto flex max-w-[1280px] items-center justify-between px-12 py-[22px]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-accent font-heading text-sm font-extrabold text-accent-ink">
            NB
          </div>
          <div className="font-heading text-base font-extrabold">Nosso Bolso</div>
        </div>
        <Link to="/login" className="text-[13.5px] font-bold text-text-secondary hover:text-accent">
          Já tenho conta
        </Link>
      </header>

      <section className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-14 px-12 pt-14 pb-[90px] md:grid-cols-2">
        <div className="flex flex-col gap-[22px]">
          <Eyebrow>Finanças a dois</Eyebrow>
          <h1 className="m-0 font-heading text-[52px] leading-[1.08] font-black tracking-tight text-balance">
            O dinheiro de vocês dois, numa página só.
          </h1>
          <p className="m-0 max-w-[480px] text-[17px] leading-relaxed text-text-secondary">
            Nosso Bolso é o app de finanças pra casais: lancem gastos, acompanhem metas e conversem com uma IA que
            já conhece as contas de vocês.
          </p>
          <div className="mt-1.5 flex items-center gap-4">
            <Link
              to="/login?mode=cadastrar"
              className="rounded-[14px] bg-accent px-[26px] py-[15px] text-[15px] font-bold text-accent-ink shadow-[0_10px_24px_-10px_var(--color-accent)] transition-transform hover:-translate-y-px"
            >
              Criar conta grátis
            </Link>
            <Link
              to="/login"
              className="rounded-[14px] border border-border px-5 py-[15px] text-[15px] font-bold text-text hover:bg-surface"
            >
              Já tenho conta
            </Link>
          </div>
          <RotatingTrustLine />
        </div>

        <div className="rounded-[24px] bg-sidebar p-5 shadow-[0_30px_60px_-25px_rgba(27,31,28,0.35)]">
          <div className="flex flex-col gap-4 rounded-2xl bg-[#FBFAF6] p-[22px]">
            <div className="flex items-center justify-between">
              <div className="font-heading text-[15px] font-extrabold text-text">Olá, Ana e Marcos 👋</div>
              <div className="flex">
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-[#FBFAF6] bg-[#D9C9A3] text-[10px] font-bold text-text">
                  AS
                </div>
                <div className="-ml-2 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-[#FBFAF6] bg-[#A9C9B8] text-[10px] font-bold text-text">
                  MS
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[14px] bg-sidebar p-4 text-bg">
                <div className="text-[11px] font-semibold text-sidebar-text-inactive">Saldo do mês</div>
                <div className="mt-1 font-heading text-xl font-extrabold">R$ 4.230</div>
              </div>
              <div className="rounded-[14px] border border-border bg-surface p-4">
                <div className="text-[11px] font-semibold text-text-muted">Meta: Viagem Bahia</div>
                <div className="mt-1 font-heading text-xl font-extrabold text-accent">52%</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-[14px] border border-border bg-surface px-4 py-3.5">
              <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-accent font-heading text-[10px] font-extrabold text-accent-ink">
                IA
              </div>
              <div className="text-[12.5px] text-text-secondary">
                "Vocês gastaram 12% menos com Lazer esse mês."
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-12 pt-5 pb-[100px]">
        <div className="mx-auto mb-12 flex max-w-[560px] flex-col items-center gap-3 text-center">
          <Eyebrow center>Funcionalidades</Eyebrow>
          <h2 className="m-0 font-heading text-[34px] font-extrabold text-balance">
            Cada centavo, visível pros dois
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-surface p-[26px]">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-[13px] text-[17px] font-extrabold"
                style={{ background: f.bg, color: f.fg }}
              >
                {f.icon}
              </div>
              <h3 className="m-0 font-heading text-[16.5px] font-bold">{f.title}</h3>
              <p className="m-0 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sidebar px-12 py-[90px]">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-[52px]">
          <h2 className="m-0 text-center font-heading text-[34px] font-extrabold text-bg">
            Em 3 passos, sem planilha
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.number} className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-heading text-[19px] font-extrabold text-accent-ink">
                  {s.number}
                </div>
                <h3 className="m-0 font-heading text-lg font-bold text-bg">{s.title}</h3>
                <p className="m-0 text-sm leading-relaxed text-sidebar-text-inactive">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-12 py-[90px]">
        <Eyebrow center>O que os casais dizem</Eyebrow>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-[26px]">
              <p className="m-0 text-[14.5px] leading-relaxed text-[#3A3D38]">"{t.quote}"</p>
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-xs font-bold text-text"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[13px] font-bold">{t.name}</div>
                  <div className="text-[11.5px] text-text-muted">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-12 pb-[100px]">
        <h2 className="mb-9 text-center font-heading text-[30px] font-extrabold">Perguntas frequentes</h2>
        <div className="mx-auto flex max-w-[760px] flex-col gap-2.5">
          {faqs.map((item, i) => (
            <FaqItem
              key={item.q}
              q={item.q}
              a={item.a}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      <section className="bg-pill-bg px-12 py-[90px] text-center">
        <h2 className="mx-auto mb-4.5 max-w-[640px] font-heading text-[32px] font-extrabold text-balance">
          Comecem a organizar as finanças de vocês hoje
        </h2>
        <p className="m-0 mb-4.5 text-base text-text-secondary">Grátis no plano casal.</p>
        <Link
          to="/login?mode=cadastrar"
          className="mt-2 inline-block rounded-[14px] bg-accent px-[26px] py-[15px] text-[15px] font-bold text-accent-ink shadow-[0_10px_24px_-10px_var(--color-accent)]"
        >
          Criar conta grátis
        </Link>
      </section>

      <footer className="mx-auto flex max-w-[1280px] items-center justify-between px-12 py-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-accent font-heading text-xs font-extrabold text-accent-ink">
            NB
          </div>
          <div className="text-[13px] text-text-secondary">Nosso Bolso — feito pra quem divide a vida a dois.</div>
        </div>
        <div className="text-[12.5px] text-text-muted">© 2026 Nosso Bolso</div>
      </footer>
    </div>
  )
}
