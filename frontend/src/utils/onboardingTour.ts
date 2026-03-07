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
      title: "🎉 Bem-vindo ao TeacherFlow!",
      description: "📚 Tour interativo em 9 passos para você começar. Primeiro, me diga: qual é sua área de atuação? (Música 🎵, Idiomas 🗣️, Matérias Acadêmicas 📚, Esportes ⚽, Artes 🎨, Outro 📋)",
      side: "bottom",
      align: "center",
    },
  },
  
  // Step 2: Students - Take Action
  {
    element: "#nav-students",
    popover: {
      title: "👥 Passo 1/6: Cadastre seus Alunos",
      description: "Clique aqui agora para adicionar seu primeiro aluno! Nome, contato, valor da aula.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 3: Locations - Take Action
  {
    element: "#nav-locations",
    popover: {
      title: "📍 Passo 2/6: Cadastre Locais",
      description: "Onde você dá aula? Sua casa, escola, online? Clique e cadastre!",
      side: "right",
      align: "center",
    },
  },
  
  // Step 4: Groups - Take Action
  {
    element: "#nav-groups",
    popover: {
      title: "👨‍🎓 Passo 3/6: Crie Turmas",
      description: "Aulas em grupo? Crie turmas aqui e defina preços especiais. Clique para começar!",
      side: "right",
      align: "center",
    },
  },
  
  // Step 5: Calendar - Take Action
  {
    element: "#nav-calendar",
    popover: {
      title: "📅 Passo 4/6: Agende Aulas",
      description: "Aqui você marca aulas individuais ou recorrentes. Clique para agendar sua primeira aula!",
      side: "right",
      align: "center",
    },
  },
  
  // Step 6: Payments
  {
    element: "#nav-payments",
    popover: {
      title: "💰 Passo 5/6: Controle Pagamentos",
      description: "Veja quem pagou, quem está devendo, e receba alertas de inadimplência.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 7: Dashboard Home
  {
    element: "#nav-menu",
    popover: {
      title: "📊 Passo 6/6: Seu Dashboard",
      description: "Volte aqui sempre! Visão completa: próximas aulas, recebimentos, alunos ativos.",
      side: "right",
      align: "start",
    },
  },
  
  // Step 8: Settings
  {
    element: "body",
    popover: {
      title: "⚙️ Dica Extra: Configurações",
      description: "No menu do seu perfil (canto superior direito), você pode trocar tema, alterar dados e refazer este tour quando quiser!",
      side: "bottom",
      align: "center",
    },
  },
  
  // Step 9: Finish
  {
    element: "body",
    popover: {
      title: "✅ Tudo Pronto!",
      description: "Agora é com você! Comece cadastrando seus primeiros alunos e agende suas aulas. Boa aula! 🎓📚🎉",
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
  
  // Start the tour
  tour.drive();
  
  // Mark as completed when tour is destroyed (closed/finished)
  // This persists the setting in localStorage so it doesn't show again
  setTimeout(() => {
    const listener = () => {
      console.log('✅ Tour completed! Marking in localStorage');
      localStorage.setItem('teacherflow_tour_completed', 'true');
    };
    
    // Listen for when the tour overlay is removed from DOM
    const observer = new MutationObserver((mutations) => {
      const driverOverlay = document.querySelector('[data-driver-popover]');
      if (!driverOverlay) {
        observer.disconnect();
        listener();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }, 100);
  
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
