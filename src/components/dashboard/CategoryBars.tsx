import { hues } from '../../data/mockData'
import { colorFor, fmt } from '../../lib/format'

type CategoryBarsProps = {
  catSpend: Record<string, number>
}

export function CategoryBars({ catSpend }: CategoryBarsProps) {
  const maxCat = Math.max(1, ...Object.values(catSpend))
  const bars = Object.keys(catSpend)
    .sort((a, b) => catSpend[b] - catSpend[a])
    .slice(0, 5)
    .map((nome) => ({
      nome,
      valorDisplay: fmt(catSpend[nome]),
      widthPct: (catSpend[nome] / maxCat) * 100,
      color: colorFor(hues[nome] ?? 0),
    }))

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-[22px_24px]">
      <div className="font-heading text-[15px] font-bold">Por categoria</div>
      {bars.map((bar) => (
        <div key={bar.nome} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[12.5px]">
            <div className="font-semibold">{bar.nome}</div>
            <div className="text-text-secondary">{bar.valorDisplay}</div>
          </div>
          <div className="h-[7px] overflow-hidden rounded-pill bg-pill-bg">
            <div
              className="h-full rounded-pill transition-[width] duration-500 ease-out"
              style={{ width: `${bar.widthPct}%`, background: bar.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
