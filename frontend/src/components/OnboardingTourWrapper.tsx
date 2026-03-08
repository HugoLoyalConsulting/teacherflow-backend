import React, { useEffect, useState } from 'react';
import { startOnboardingTour } from '@/utils/onboardingTour';
import { useAuthStore } from '@/store/authStore';
import { HelpCircle, Play, X } from 'lucide-react';
import { api } from '@/services/api';

interface OnboardingTourWrapperProps {
  children: React.ReactNode;
}

const TOUR_STORAGE_KEY = 'teacherflow_tour_completed';

export function OnboardingTourWrapper({ children }: OnboardingTourWrapperProps) {
  const { user, setOnboardingComplete } = useAuthStore();
  const [tourStarted, setTourStarted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!user || !token || tourStarted) return;

    const loadTourStatus = async () => {
      try {
        const response = await api.get('/tour/status');
        const completedInBackend = !!response.data?.tour_completed;
        const completedInStorage = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
        const tourCompleted = completedInBackend || completedInStorage;

        if (tourCompleted) {
          localStorage.setItem(TOUR_STORAGE_KEY, 'true');
          setOnboardingComplete(true);
          return;
        }

        setShowBanner(true);
        const timer = setTimeout(() => {
          startTourWithTracking();
        }, 2000);

        return () => clearTimeout(timer);
      } catch {
        const completedInStorage = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
        if (!completedInStorage) {
          setShowBanner(true);
        }
      }
    };

    loadTourStatus();
  }, [user, token, tourStarted]);

  const startTourWithTracking = () => {
    if (!user) return;

    setTourStarted(true);
    setShowBanner(false);
    console.log('🎉 Starting onboarding tour for user:', user.email);

    startOnboardingTour(async () => {
      try {
        await api.post('/tour/complete');
      } catch {
        // Keep local completion even if backend sync fails.
      }
      setOnboardingComplete(true);
    });
  };

  const handleRestartTour = () => {
    // Reset tour completion flag
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setTourStarted(false);
    setShowBanner(false);

    // Start tour after a small delay
    setTimeout(() => {
      startTourWithTracking();
    }, 300);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
  };

  return (
    <>
      {/* Welcome Banner - Shows before tour starts */}
      {showBanner && user && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg relative animate-fade-in">
          <button
            onClick={handleDismissBanner}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                🎉 Bem-vindo ao TeacherFlow, {user.name?.split(' ')[0]}!
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Preparamos um <strong>tour interativo de 9 passos</strong> para você começar. 
                Pop-ups vão te guiar para criar alunos, agendar aulas e muito mais!
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={startTourWithTracking}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Tour Agora
                </button>
                
                <button
                  onClick={() => {
                    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
                    setShowBanner(false);
                  }}
                  className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border-2 border-gray-300 dark:border-slate-600 transition-all"
                >
                  Pular (fazer depois)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {children}
      
      {/* Floating help button to restart tour */}
      {user && (
        <button
          onClick={handleRestartTour}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all bg-blue-600 hover:bg-blue-700 text-white border-4 border-white dark:border-slate-900 hover:scale-110 cursor-pointer group"
          title="Iniciar Tour Interativo"
          aria-label="Start tour"
        >
          <HelpCircle className="h-6 w-6" />
          <span className="absolute -top-12 right-0 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Tour Interativo
          </span>
        </button>
      )}
    </>
  );
}
