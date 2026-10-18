import { useState, useEffect } from 'react'
import Login from './pages/Login'
import PrimeiroAcessoToken from './pages/PrimeiroAcessoToken'
import Alunos from './pages/Alunos'
import RecuperacaoSenha from './pages/RecuperacaoSenha'

const PAGINAS = {
  login: Login,
  primeiroacessotoken: PrimeiroAcessoToken,
  alunos: Alunos,
  recuperacaosenha: RecuperacaoSenha,
}

function App() {
  const [paginaAtual, setPaginaAtual] = useState(() => {
    const nomeNaUrl = window.location.pathname.replace(/^\/+/, '').toLowerCase()
    if (nomeNaUrl) return nomeNaUrl
    const token = localStorage.getItem('auth_token')
    return token ? 'alunos' : 'login'
  })

  useEffect(() => {
    function atualizarPagina() {
      const nomeNaUrl = window.location.pathname.replace(/^\/+/, '').toLowerCase()
      setPaginaAtual(nomeNaUrl || (localStorage.getItem('auth_token') ? 'alunos' : 'login'))
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

  const ComponenteTela = PAGINAS[paginaAtual] || (localStorage.getItem('auth_token') ? Alunos : Login)

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
