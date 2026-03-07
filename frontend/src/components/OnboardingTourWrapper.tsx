import React, { useEffect, useState } from 'react';
import { startOnboardingTour, shouldShowTour, resumeTourFromStep } from '@/utils/onboardingTour';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Button } from '@/components/UI/button';
import { HelpCircle } from 'lucide-react';

interface OnboardingTourWrapperProps {
  children: React.ReactNode;
}

export function OnboardingTourWrapper({ children }: OnboardingTourWrapperProps) {
  const { user, token } = useAuth();
  const [tourStarted, setTourStarted] = useState(false);

  useEffect(() => {
    if (!user || !token || tourStarted) return;

    // Check if user needs to see the tour
    const checkAndStartTour = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/tour/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { tour_completed, current_step } = response.data;

        // Only auto-start for brand new users (step 0 and not completed)
        if (!tour_completed && current_step === 0) {
          // Wait 1.5 seconds for dashboard to fully render
          setTimeout(() => {
            startTourWithTracking();
          }, 1500);
        }
      } catch (error) {
        console.error('Error checking tour status:', error);
      }
    };

    checkAndStartTour();
  }, [user, token, tourStarted]);

  const startTourWithTracking = async () => {
    if (!token) return;

    setTourStarted(true);

    const tour = startOnboardingTour();

    // Track progress on each step
    tour.onNextClick = async (element, step) => {
      const stepIndex = step.index || 0;
      
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/tour/step`,
          { step: stepIndex },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error saving tour step:', error);
      }
    };

    // Mark as completed when tour finishes
    tour.onDestroyStarted = async () => {
      const config = tour.getConfig();
      const steps = config.steps || [];
      const currentIndex = tour.getActiveIndex() || 0;
      
      // If user reached the last step, mark as completed
      if (currentIndex === steps.length - 1) {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/v1/tour/complete`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error('Error completing tour:', error);
        }
      }
    };

    // User clicked "Skip Tour"
    tour.onCloseClick = async () => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/tour/skip`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error skipping tour:', error);
      }
    };
  };

  const handleRestartTour = async () => {
    if (!token) return;

    try {
      // Reset tour on backend
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/tour/reset`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Start tour
      setTourStarted(false);
      setTimeout(() => {
        startTourWithTracking();
      }, 300);
    } catch (error) {
      console.error('Error restarting tour:', error);
    }
  };

  return (
    <>
      {children}
      
      {/* Floating help button to restart tour */}
      {user && (
        <Button
          onClick={handleRestartTour}
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Reiniciar Tour Interativo"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
