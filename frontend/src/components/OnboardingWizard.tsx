import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Category {
  key: string;
  name: string;
  icon: string;
  sub_categories: string[];
}

interface Suggestion {
  name: string;
  hourly_rate?: number;
  max_students?: number;
  type?: string;
}

interface CategorySuggestions {
  category: string;
  icon: string;
  suggestions: {
    groups: Suggestion[];
    locations: Suggestion[];
    pricing: {
      min: number;
      max: number;
      suggested: number;
      unit: string;
    };
  };
}

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { setOnboardingComplete } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CategorySuggestions | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<Category[]>('/api/onboarding/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setStep(2);
  };

  const handleSubCategorySelect = (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    setStep(3);
  };

  const handleComplete = async () => {
    if (!selectedCategory || !selectedSubCategory) return;

    try {
      setLoading(true);
      const response = await api.post<{ success: boolean; message: string; suggestions: CategorySuggestions }>(
        '/api/onboarding/complete',
        {
          category_key: selectedCategory,
          sub_category: selectedSubCategory,
        }
      );

      if (response.data.success) {
        setSuggestions(response.data.suggestions);
        setStep(4);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Erro ao completar configuração inicial');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    // Update auth store to mark onboarding as complete
    setOnboardingComplete(true);
    navigate('/dashboard');
  };

  const selectedCategoryData = categories.find((c) => c.key === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s ? 'bg-white text-blue-600' : 'bg-blue-400 text-white opacity-50'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 w-16 mx-2 transition-all ${
                      step > s ? 'bg-white' : 'bg-blue-400 opacity-50'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-white text-center font-medium">
            {step === 1 && 'Escolha sua área de atuação'}
            {step === 2 && 'Selecione sua especialidade'}
            {step === 3 && 'Confirme sua escolha'}
            {step === 4 && 'Sua configuração personalizada'}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Select Category */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Bem-vindo ao TeacherFlow! 🎉</h2>
              <p className="text-gray-600 mb-8 text-center">Vamos personalizar sua experiência. Qual é sua área de atuação?</p>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Carregando categorias...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => handleCategorySelect(category.key)}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all group"
                    >
                      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                      <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">{category.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Sub-Category */}
          {step === 2 && selectedCategoryData && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                {selectedCategoryData.icon} {selectedCategoryData.name}
              </h2>
              <p className="text-gray-600 mb-8 text-center">Qual é sua especialidade?</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {selectedCategoryData.sub_categories.map((subCat) => (
                  <button
                    key={subCat}
                    onClick={() => handleSubCategorySelect(subCat)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <span className="text-sm font-medium text-gray-800">{subCat}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="mt-6 px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* Step 3: Confirm Selection */}
          {step === 3 && selectedCategoryData && (
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedCategoryData.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfeito!</h2>
              <p className="text-gray-600 mb-8">
                Você selecionou: <strong>{selectedSubCategory}</strong>
              </p>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 inline-block">
                <p className="text-sm text-gray-700 mb-4">
                  Vamos criar sua configuração inicial personalizada com:
                </p>
                <ul className="text-left text-sm text-gray-700 space-y-2">
                  <li>✅ Turmas sugeridas com preços adequados</li>
                  <li>✅ Locais recomendados para suas aulas</li>
                  <li>✅ Faixas de preço do mercado</li>
                  <li>✅ Dicas específicas para {selectedSubCategory}</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Configurando...' : 'Confirmar e Continuar →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Show Suggestions */}
          {step === 4 && suggestions && (
            <div>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{suggestions.icon}</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Tudo Pronto! 🎉</h2>
                <p className="text-gray-600">Aqui estão suas recomendações personalizadas:</p>
              </div>

              {/* Turmas Sugeridas */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  📚 Turmas Sugeridas
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {suggestions.suggestions.groups.map((group, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all">
                      <h4 className="font-semibold text-gray-800 mb-2">{group.name}</h4>
                      <p className="text-sm text-gray-600">R$ {group.hourly_rate}/hora</p>
                      <p className="text-xs text-gray-500">Até {group.max_students} alunos</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locais Recomendados */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  📍 Locais Recomendados
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {suggestions.suggestions.locations.map((location, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-all">
                      <h4 className="font-semibold text-gray-800">{location.name}</h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Faixa de Preço */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💰 Faixa de Preço do Mercado</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Mínimo</p>
                    <p className="text-2xl font-bold text-gray-800">R$ {suggestions.suggestions.pricing.min}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Recomendado</p>
                    <p className="text-3xl font-bold text-green-600">R$ {suggestions.suggestions.pricing.suggested}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Máximo</p>
                    <p className="text-2xl font-bold text-gray-800">R$ {suggestions.suggestions.pricing.max}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                Ir para o Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
