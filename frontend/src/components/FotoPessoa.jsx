import { useEffect, useState } from 'react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

export default function FotoPessoa({ tipo, pessoa, alternativa = null, className, alt = '' }) {
  const [imagem, setImagem] = useState(null)
  const id = pessoa?.id ?? pessoa?.id_responsavel
  const caminho = id && pessoa?.foto ? `${API_URL}/fotos/${tipo}/${id}` : null

  useEffect(() => {
    if (!caminho) return

    const token = localStorage.getItem('auth_token')
    if (!token) return

    const controller = new AbortController()
    let url
    async function carregar() {
      try {
        const resposta = await fetch(caminho, {
          headers: { Accept: 'application/json, image/*', Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (!resposta.ok || !resposta.headers.get('Content-Type')?.startsWith('image/')) return

        const arquivo = await resposta.blob()
        if (controller.signal.aborted) return
        url = URL.createObjectURL(arquivo)
        setImagem({ caminho, url })
      } catch {
        // A imagem pode estar indisponível ou a navegação ter cancelado a requisição.
      }
    }

    carregar()
    return () => {
      controller.abort()
      if (url) URL.revokeObjectURL(url)
    }
  }, [caminho])

  if (!caminho || imagem?.caminho !== caminho) return alternativa
  return <img className={className} src={imagem.url} alt={alt} onError={() => setImagem(null)} />
}
