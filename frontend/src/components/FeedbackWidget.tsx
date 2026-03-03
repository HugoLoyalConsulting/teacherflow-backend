// Componente de Feedback - Simples e Eficaz
import { useState } from 'react'
import { AlertCircle, SendIcon, X } from 'lucide-react'

export const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('bug')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !message.trim()) {
      alert('Preencha email e mensagem')
      return
    }

    setIsSending(true)
    
    try {
      const response = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          category,
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      })

      if (response.ok) {
        setSubmitted(true)
        setMessage('')
        setEmail('')
        
        // Fechar em 3 segundos
        setTimeout(() => {
          setIsOpen(false)
          setSubmitted(false)
        }, 3000)
      } else {
        alert('Erro ao enviar feedback')
      }
    } catch (error) {
      console.error('Feedback error:', error)
      alert('Erro ao enviar feedback')
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg text-sm font-medium transition-all"
      >
        💬 Feedback
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100%-2rem)] bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="font-bold text-gray-900 dark:text-white">Enviar Feedback</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {submitted ? (
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-green-600 dark:text-green-400 font-medium">Feedback enviado!</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Obrigado pelo seu feedback! Vamos revisar em breve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Melhoria</option>
                <option value="other">Outro</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder-gray-500"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensagem
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva seu feedback..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder-gray-500 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <SendIcon className="w-4 h-4" />
                  Enviar Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
