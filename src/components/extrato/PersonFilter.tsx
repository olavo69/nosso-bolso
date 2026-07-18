import type { Pessoa } from '../../data/mockData'

type PersonFilterKey = 'todos' | Pessoa

const options: { key: PersonFilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'ana', label: 'Ana' },
  { key: 'marcos', label: 'Marcos' },
]

type PersonFilterProps = {
  value: PersonFilterKey
  onChange: (value: PersonFilterKey) => void
}

export function PersonFilter({ value, onChange }: PersonFilterProps) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`rounded-control border px-4 py-2.5 text-[13px] font-semibold transition-colors ${
            value === option.key
              ? 'border-text bg-text text-bg'
              : 'border-border bg-surface text-[#5B5F58]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
