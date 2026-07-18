export function PlaceholderCard({ fase }: { fase: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-6 text-text-secondary">
      Conteúdo desta tela entra na {fase}.
    </div>
  )
}
