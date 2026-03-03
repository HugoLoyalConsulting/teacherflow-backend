import { useEffect, useState } from 'react'
import { Card, Badge } from '../components/UI'
import { Button } from '../components/Form'

type PaletteMode = 'classic' | 'vaporwave'

const paletteStorageKey = 'teacherflow-palette'

export const ProfilePage = () => {
  const [paletteMode, setPaletteMode] = useState<PaletteMode>('classic')

  useEffect(() => {
    const storedPalette = (localStorage.getItem(paletteStorageKey) as PaletteMode | null) || 'classic'
    setPaletteMode(storedPalette)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('palette-classic', 'palette-vaporwave')
    html.classList.add(paletteMode === 'vaporwave' ? 'palette-vaporwave' : 'palette-classic')
    localStorage.setItem(paletteStorageKey, paletteMode)
  }, [paletteMode])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Perfil</h1>
        <p className="text-gray-600 dark:text-gray-400">Preferências pessoais e informações da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Cores do app</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Selecione a paleta visual principal da interface.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button size="sm" variant={paletteMode === 'classic' ? 'primary' : 'secondary'} onClick={() => setPaletteMode('classic')}>
              Clássica
            </Button>
            <Button size="sm" variant={paletteMode === 'vaporwave' ? 'primary' : 'secondary'} onClick={() => setPaletteMode('vaporwave')}>
              Vaporwave
            </Button>
          </div>
          <div className="rounded-xl p-4 border border-gray-200 dark:border-slate-700 bg-gradient-to-r from-fuchsia-500/20 via-cyan-500/20 to-violet-500/20">
            <p className="text-sm font-medium">Preview de paleta</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Quando ativo, aplica destaque vibrante em botões e elementos de navegação.</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Conta e segurança</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 p-3">
              <span>Senha</span>
              <Badge variant="success">Atualizada</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 p-3">
              <span>Verificação em duas etapas</span>
              <Badge variant="warning">Opcional</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 p-3">
              <span>Sessões ativas</span>
              <Badge variant="default">1 dispositivo</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Visual</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Ajustes aplicados para contraste e aparência contemporânea.</p>
          <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
            <li>• Mais contraste em cartões, bordas e tipografia</li>
            <li>• Sombras mais perceptíveis para sensação de volume</li>
            <li>• Cantos arredondados e brilho sutil em elementos de destaque</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Preferências gerais</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 p-3">
              <span>Idioma</span>
              <Badge variant="default">Português (BR)</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 p-3">
              <span>Formato de data</span>
              <Badge variant="default">DD/MM/YYYY</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 p-3">
              <span>Moeda</span>
              <Badge variant="default">BRL (R$)</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
