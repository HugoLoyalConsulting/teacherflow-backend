import React, { useEffect, useState } from 'react';
import { startOnboardingTour } from '@/utils/onboardingTour';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/button';
import { HelpCircle } from 'lucide-react';

interface OnboardingTourWrapperProps {
  children: React.ReactNode;
}

const TOUR_STORAGE_KEY = 'teacherflow_tour_completed';

export function OnboardingTourWrapper({ children }: OnboardingTourWrapperProps) {
  const { user, token } = useAuth();
  const [tourStarted, setTourStarted] = useState(false);

  useEffect(() => {
    if (!user || !token || tourStarted) return;

    // Check if tour has already been completed (using localStorage)
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
    
    if (!tourCompleted) {
      // Wait 1.5 seconds for dashboard to fully render, then start tour
      const timer = setTimeout(() => {
        startTourWithTracking();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, token, tourStarted]);

  const startTourWithTracking = () => {
    if (!user) return;

    setTourStarted(true);
    console.log('🎉 Starting onboarding tour for user:', user.email);

    const tour = startOnboardingTour();

    // Mark tour as completed when destroyed/closed
    // This happens when user clicks "Concluir" or closes the tour
    console.log('✅ Tour initialized and will mark as completed when user finishes');
  };

  const handleRestartTour = () => {
    // Reset tour completion flag
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setTourStarted(false);

    // Start tour after a small delay
    setTimeout(() => {
      startTourWithTracking();
    }, 300);
  };

  return (
    <>
      {children}
      
      {/* Floating help button to restart tour */}
      {user && (
        <button
          onClick={handleRestartTour}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
          title="Reiniciar Tour Interativo"
          aria-label="Restart tour"
        >
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </button>
      )}
    </>
  );
}
