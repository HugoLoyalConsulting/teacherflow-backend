import { driver, DriveStep, Config } from "driver.js";
import "driver.js/dist/driver.css";

export interface TourStep extends DriveStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: "left" | "right" | "top" | "bottom";
    align?: "start" | "center" | "end";
  };
}

/**
 * Interactive Onboarding Tour Configuration
 * 
 * Simplified flow: Start by creating a student, then explore features
 * Total: 8 steps with concise descriptions
 */

export const onboardingSteps: TourStep[] = [
  // Step 1: Welcome
  {
    element: "body",
    popover: {
      title: "🎉 Bem-vindo!",
      description: "Tour rápido em 8 passos. Vamos começar!",
      side: "bottom",
      align: "center",
    },
  },
  
  // Step 2: Create Student Button
  {
    element: "#nav-students",
    popover: {
      title: "👥 Alunos",
      description: "Clique aqui para gerenciar seus alunos.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 3: Locations
  {
    element: "#nav-locations",
    popover: {
      title: "📍 Locais",
      description: "Cadastre onde você dá aula.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 4: Groups
  {
    element: "#nav-groups",
    popover: {
      title: "👨‍🎓 Turmas",
      description: "Organize turmas e defina preços.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 5: Calendar
  {
    element: "#nav-calendar",
    popover: {
      title: "📅 Agenda",
      description: "Agende e gerencie suas aulas.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 6: Payments
  {
    element: "#nav-payments",
    popover: {
      title: "💰 Pagamentos",
      description: "Controle recebimentos e inadimplência.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 7: Dashboard Home
  {
    element: "#nav-menu",
    popover: {
      title: "📊 Dashboard",
      description: "Visão geral de tudo em um só lugar.",
      side: "right",
      align: "start",
    },
  },
  
  // Step 8: Finish
  {
    element: "body",
    popover: {
      title: "✅ Pronto!",
      description: "Comece cadastrando seus alunos. Boa aula! 🎓",
      side: "bottom",
      align: "center",
    },
  },
];

/**
 * Driver.js Configuration
 */
export const driverConfig: Config = {
  showProgress: true,
  showButtons: ["next", "previous", "close"],
  nextBtnText: "Próximo →",
  prevBtnText: "← Anterior",
  doneBtnText: "Concluir ✓",
  // closeBtnText: "Pular Tour", // TODO: Fix driver.js API - not available in current version
  progressText: "{{current}} de {{total}}",
  
  // Styling
  popoverClass: "teacherflow-tour-popover",
  
  // Behavior
  animate: true,
  overlayOpacity: 0.75,
  smoothScroll: true,
  disableActiveInteraction: false, // Allow interaction with highlighted elements
  
  // Callbacks
  onDestroyStarted: () => {
    // Save tour progress when user closes or completes
    console.log("Tour finished or closed");
  },
  
  onPopoverRender: (popover, { config, state }) => {
    // Add subtle shadow and light styling
    const popoverElement = popover.wrapper;
    popoverElement.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)";
    popoverElement.style.borderRadius = "16px";
    popoverElement.style.border = "1px solid rgba(0, 0, 0, 0.08)";
  },
};

/**
 * Create and initialize the tour
 */
export function createOnboardingTour() {
  const driverObj = driver({
    ...driverConfig,
    steps: onboardingSteps,
  });
  
  return driverObj;
}

/**
 * Start the onboarding tour
 */
export function startOnboardingTour() {
  const tour = createOnboardingTour();
  tour.drive();
  return tour;
}

/**
 * Resume tour from a specific step
 */
export function resumeTourFromStep(stepIndex: number) {
  const tour = createOnboardingTour();
  tour.drive(stepIndex);
  return tour;
}

/**
 * Check if user should see the tour
 */
export function shouldShowTour(user: { interactive_tour_completed?: boolean }): boolean {
  return !user.interactive_tour_completed;
}
