export type PersonFilterValue = 'todos' | string

type PersonFilterProps = {
  options: { key: PersonFilterValue; label: string }[]
  value: PersonFilterValue
  onChange: (value: PersonFilterValue) => void
}

export function PersonFilter({ options, value, onChange }: PersonFilterProps) {
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
