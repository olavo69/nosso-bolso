type ToggleProps = {
  checked: boolean
  onChange: () => void
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex h-6 w-10 items-center rounded-pill p-[3px] transition-colors duration-200"
      style={{ background: checked ? 'var(--color-accent)' : 'var(--color-border)' }}
    >
      <span
        className="h-[18px] w-[18px] rounded-full bg-white transition-transform duration-200"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}
