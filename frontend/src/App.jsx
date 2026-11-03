import { useState, useEffect } from 'react'
import Login from './pages/Login'
import PrimeiroAcessoToken from './pages/PrimeiroAcessoToken'
import PrimeiroAcesso from './pages/PrimeiroAcesso'
import Alunos from './pages/Alunos'
import RecuperacaoSenha from './pages/RecuperacaoSenha'
import Funcionarios from './pages/Funcionarios'
import Dashboard from './pages/Dashboard'
import Perfil from './pages/Perfil'

const PAGINAS = {
  funcionarios: Funcionarios,
  login: Login,
  primeiroacessotoken: PrimeiroAcessoToken,
  primeiroacesso: PrimeiroAcesso,
  alunos: Alunos,
  recuperacaosenha: RecuperacaoSenha,
  inicio: Dashboard,
  perfil: Perfil,
}

function App() {
  const [paginaAtual, setPaginaAtual] = useState(() => {
    const nomeNaUrl = window.location.pathname.replace(/^\/+/, '').toLowerCase()
    if (nomeNaUrl) return nomeNaUrl
    const token = localStorage.getItem('auth_token')
    return token ? 'inicio' : 'login'
  })

  useEffect(() => {
    function atualizarPagina() {
      const nomeNaUrl = window.location.pathname.replace(/^\/+/, '').toLowerCase()
      setPaginaAtual(nomeNaUrl || (localStorage.getItem('auth_token') ? 'inicio' : 'login'))
    }
 
    window.addEventListener('popstate', atualizarPagina)
    return () => window.removeEventListener('popstate', atualizarPagina)
  }, [])

  function navegar(nomePagina) {
    const limpo = (nomePagina || '').replace(/^\/+/, '').toLowerCase()
    const rota = `/${limpo}`
    window.history.pushState({}, '', rota)
    setPaginaAtual(limpo)
  }

  const ComponenteTela = PAGINAS[paginaAtual] || (localStorage.getItem('auth_token') ? Dashboard : Login)

  return (
    <ComponenteTela
      rota={paginaAtual}
      aoNavegar={navegar}
      onNavigate={navegar}
      onBack={() => navegar('Login')}
    />
  )
}

export default App
