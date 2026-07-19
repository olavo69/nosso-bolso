import { useAuth } from '../context/AuthContext'

export function usePessoaLabel() {
  const { profile, partnerProfile } = useAuth()

  return (pessoaId: string | null) => {
    if (pessoaId === null) return 'Casal'
    if (pessoaId === profile?.id) return profile?.name ?? 'Você'
    if (pessoaId === partnerProfile?.id) return partnerProfile?.name ?? 'Parceiro'
    return 'Alguém'
  }
}
