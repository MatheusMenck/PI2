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
    const nomeNaUrl = window.location.pathname.replace('/', '').toLowerCase()
    return nomeNaUrl || 'alunos' 
  })

  useEffect(() => {
    function atualizarPagina() {
      const nomeNaUrl = window.location.pathname.replace('/', '').toLowerCase()
      setPaginaAtual(nomeNaUrl || 'alunos')
    }
 
    window.addEventListener('popstate', atualizarPagina)
    return () => window.removeEventListener('popstate', atualizarPagina)
  }, [])

  function navegar(nomePagina) {
    const rota = `/${nomePagina}`
    window.history.pushState({}, '', rota)
    setPaginaAtual(nomePagina.toLowerCase())
  }

  const ComponenteTela = PAGINAS[paginaAtual] || Alunos

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
