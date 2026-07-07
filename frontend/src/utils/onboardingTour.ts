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
  // Step 1: Welcome + Area Selection
  {
    element: "body",
    popover: {
      title: "Bem-vindo ao TeacherFlow",
      description: "Este tour rapido mostra os pontos principais para voce comecar em poucos minutos.",
      side: "bottom",
      align: "center",
    },
  },
  
  // Step 2: Students - Take Action
  {
    element: "#nav-students",
    popover: {
      title: "Passo 1 de 6: Cadastre seus alunos",
      description: "Comece por aqui para criar o primeiro aluno com nome, contato e valor da aula.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 3: Locations - Take Action
  {
    element: "#nav-locations",
    popover: {
      title: "Passo 2 de 6: Cadastre locais",
      description: "Defina os locais de aula, como presencial, online ou unidades especificas.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 4: Groups - Take Action
  {
    element: "#nav-groups",
    popover: {
      title: "Passo 3 de 6: Crie turmas",
      description: "Organize aulas em grupo e ajuste regras de preco para cada turma.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 5: Calendar - Take Action
  {
    element: "#nav-calendar",
    popover: {
      title: "Passo 4 de 6: Agende aulas",
      description: "Use o calendario para criar aulas avulsas ou recorrentes de forma rapida.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 6: Payments
  {
    element: "#nav-payments",
    popover: {
      title: "Passo 5 de 6: Controle pagamentos",
      description: "Acompanhe quem pagou, pendencias e inadimplencia em um unico lugar.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 7: Dashboard Home
  {
    element: "#nav-menu",
    popover: {
      title: "Passo 6 de 6: Painel principal",
      description: "No painel voce acompanha proximas aulas, receitas e andamento geral da operacao.",
      side: "right",
      align: "start",
    },
  },
  
  // Step 8: Settings
  {
    element: "body",
    popover: {
      title: "Dica extra: Configuracoes",
      description: "No menu de perfil voce altera dados, tema e pode reiniciar o tour quando quiser.",
      side: "bottom",
      align: "center",
    },
  },
  
  // Step 9: Finish
  {
    element: "body",
    popover: {
      title: "Tudo pronto",
      description: "Agora voce pode seguir para o dashboard e comecar o uso real do sistema.",
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
  doneBtnText: "Concluir",
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
  
  onPopoverRender: (popover) => {
    // Add subtle shadow and light styling
    const popoverElement = popover.wrapper;
    popoverElement.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)";
    popoverElement.style.borderRadius = "16px";
    popoverElement.style.border = "1px solid rgba(0, 0, 0, 0.08)";

    // Make close action explicit as "skip"
    const closeButton = popoverElement.querySelector('.driver-popover-close-btn') as HTMLButtonElement | null;
    if (closeButton) {
      closeButton.textContent = 'Pular tour';
      closeButton.setAttribute('aria-label', 'Pular tour');
      closeButton.setAttribute('title', 'Pular tour');
    }
  },
};

/**
 * Start the onboarding tour
 */
export function startOnboardingTour(onComplete?: () => void) {
  const markDone = () => {
    localStorage.setItem('teacherflow_tour_completed', 'true');
    if (onComplete) onComplete();
  };

  const tour = driver({
    ...driverConfig,
    steps: onboardingSteps,
    onDestroyStarted: markDone,
  });

  tour.drive();
  return tour;
}

/**
 * Resume tour from a specific step
 */
export function resumeTourFromStep(stepIndex: number) {
  const tour = driver({ ...driverConfig, steps: onboardingSteps });
  tour.drive(stepIndex);
  return tour;
}

/**
 * Check if user should see the tour
 */
export function shouldShowTour(user: { interactive_tour_completed?: boolean }): boolean {
  return !user.interactive_tour_completed;
}
