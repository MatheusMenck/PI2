import { getStoredAuthUser } from '../authUser'
import './AtalhoAdministrador.css'

export default function AtalhoAdministrador({ aoNavegar, ativo = false }) {
  if (getStoredAuthUser()?.cargo !== 'admin') return null

  return (
    <button
      className="func-admin"
      type="button"
      aria-current={ativo ? 'page' : undefined}
      onClick={() => aoNavegar('funcionarios')}
    >
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="21" cy="11" r="7" />
        <path d="m16 16-11 11v2h4v-3h3v-3h3l1-1" />
      </svg>
      <span>Administrador</span>
    </button>
  )
}
