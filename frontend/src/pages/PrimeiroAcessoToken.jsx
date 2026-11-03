import { useEffect, useRef, useState } from 'react'
import './PrimeiroAcessoToken.css'

const CODE_LENGTH = 4

function PrimeiroAcesso({ onNavigate }) {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputsRef = useRef([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isFromEmail = params.get('origem') === 'email'

    if (!isFromEmail) {
      if (onNavigate) {
        onNavigate('login')
      } else {
        window.location.pathname = '/login'
      }
    }
  }, [onNavigate])

  function updateCode(index, value) {
    setCode((currentCode) =>
      currentCode.map((digit, digitIndex) =>
        digitIndex === index ? value : digit,
      ),
    )
  }

  function fillCode(value, startIndex = 0) {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH - startIndex)

    if (!digits) return

    setCode((currentCode) => {
      const nextCode = [...currentCode]
      digits.split('').forEach((digit, offset) => {
        nextCode[startIndex + offset] = digit
      })
      return nextCode
    })

    const nextInput = Math.min(startIndex + digits.length, CODE_LENGTH - 1)
    inputsRef.current[nextInput]?.focus()
  }

  function handleChange(index, event) {
    const value = event.target.value

    if (value.length > 1) {
      fillCode(value, index)
      return
    }

    const digit = value.replace(/\D/g, '')
    updateCode(index, digit)

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      event.preventDefault()
      updateCode(index - 1, '')
      inputsRef.current[index - 1]?.focus()
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      inputsRef.current[index - 1]?.focus()
    }

    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      event.preventDefault()
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handlePaste(index, event) {
    event.preventDefault()
    fillCode(event.clipboardData.getData('text'), index)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const token = code.join('')
    if (token.length < CODE_LENGTH) {
      setError('Por favor, preencha todos os dígitos do código.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/funcionarios/ativar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Código inválido ou expirado.')
      }

      if (data.funcionario?.id) {
        sessionStorage.setItem('ativacao_funcionario_id', data.funcionario.id)
      }

      if (onNavigate) {
        onNavigate('primeiroacesso')
      } else {
        window.location.pathname = '/primeiroacesso'
      }
    } catch (err) {
      setError(err.message || 'Erro ao validar o código. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="pagina-validacao">
      <section className="validation-card" aria-labelledby="validation-title">
        <div className="validation-user-icon" aria-hidden="true">
          <span className="validation-user-icon__head" />
          <span className="validation-user-icon__body" />
        </div>

        <h1 id="validation-title">Acessar pela primeira vez</h1>
        <p className="validation-subtitle">Um código foi enviado ao seu email</p>

        <form className="validation-form" onSubmit={handleSubmit}>
          <div className="code-fields" aria-label="Código de validação">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputsRef.current[index] = element
                }}
                aria-label={`Dígito ${index + 1} do código`}
                inputMode="numeric"
                maxLength="1"
                pattern="[0-9]*"
                type="text"
                value={digit}
                onChange={(event) => handleChange(index, event)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
              />
            ))}
          </div>
          {error && <p className="validation-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default PrimeiroAcesso
