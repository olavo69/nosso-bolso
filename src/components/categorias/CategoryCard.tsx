import { colorFor, fmt, tintFor } from '../../lib/format'

type CategoryCardProps = {
  nome: string
  hue: number
  spent: number
  budget: number
}

export function CategoryCard({ nome, hue, spent, budget }: CategoryCardProps) {
  const pct = Math.min(100, (spent / budget) * 100)
  const over = spent > budget

  return (
    <div className="pop-in flex flex-col gap-3.5 rounded-card border border-border bg-surface p-[22px]">
      <div className="flex items-center gap-3">
        <div
          className="flex h-[42px] w-[42px] items-center justify-center rounded-[13px] text-[15px] font-bold"
          style={{ background: tintFor(hue), color: colorFor(hue) }}
        >
          {nome.charAt(0)}
        </div>
        <div>
          <div className="text-[15px] font-bold">{nome}</div>
          <div className="text-xs text-text-muted">
            {over ? 'Acima do orçamento' : 'Dentro do orçamento'}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-[13px]">
        <div className="font-bold">{fmt(spent)}</div>
        <div className="text-text-muted">de {fmt(budget)}</div>
      </div>

      <div className="h-2 overflow-hidden rounded-pill bg-pill-bg">
        <div
          className="h-full rounded-pill transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: over ? 'var(--color-despesa)' : colorFor(hue),
          }}
        />
      </div>
    </div>
  )
}
