import { useState, useEffect } from 'react'
import Login from './pages/Login'
import CodeValidation from './pages/PrimeiroAcessoToken'

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return window.location.hash === '#code-validation' ? 'code-validation' : 'login'
  })

  useEffect(() => {
    function handleHashChange() {
      if (window.location.hash === '#code-validation') {
        setCurrentPage('code-validation')
      } else {
        setCurrentPage('login')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function navigateTo(page) {
    window.location.hash = page === 'code-validation' ? 'code-validation' : ''
    setCurrentPage(page)
  }

  if (currentPage === 'code-validation') {
    return <CodeValidation onBack={() => navigateTo('login')} />
  }

  return <Login onNavigate={navigateTo} />
}

export default App