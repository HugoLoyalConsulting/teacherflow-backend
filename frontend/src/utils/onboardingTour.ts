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
 * Hierarchy: Locais → Turmas → Alunos
 * - Locais são criados primeiro (onde as aulas acontecem)
 * - Turmas são vinculadas a locais
 * - Alunos podem ter local primário (opcional) e estar em turmas (opcional)
 */

export const onboardingSteps: TourStep[] = [
  // Step 0: Welcome
  {
    element: "body",
    popover: {
      title: "🎉 Bem-vindo ao TeacherFlow!",
      description: "Vamos fazer um tour rápido para você começar. Isso vai levar apenas 2 minutos. Preparado?",
      side: "bottom",
      align: "center",
    },
  },
  
  // Step 1: Dashboard Overview
  {
    element: "#dashboard-container",
    popover: {
      title: "📊 Seu Dashboard",
      description: "Aqui você vê um resumo de tudo: alunos ativos, turmas, pagamentos pendentes e muito mais. Tudo em um só lugar!",
      side: "bottom",
      align: "start",
    },
  },
  
  // Step 2: Navigation Menu
  {
    element: "#nav-menu",
    popover: {
      title: "🧭 Menu de Navegação",
      description: "Use este menu para navegar entre as diferentes seções: Alunos, Locais, Turmas, Agenda e Pagamentos.",
      side: "right",
      align: "start",
    },
  },
  
  // Step 3: Locations First (Hierarchy)
  {
    element: "#nav-locations",
    popover: {
      title: "📍 1º Passo: Cadastre seus Locais",
      description: "Comece cadastrando os locais onde você dá aula (sua casa, estúdio, escola, online, etc.). Os locais são a base da hierarquia.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 4: Groups Second
  {
    element: "#nav-groups",
    popover: {
      title: "📚 2º Passo: Crie Turmas",
      description: "Depois, organize suas turmas. Cada turma está vinculada a um local e pode ter vários alunos. Defina o valor da hora/aula aqui.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 5: Students Last
  {
    element: "#nav-students",
    popover: {
      title: "👥 3º Passo: Cadastre Alunos",
      description: "Por último, cadastre seus alunos. Você pode: definir um local primário (opcional), vincular a turmas (opcional), ou deixar sem turma (aulas individuais).",
      side: "right",
      align: "center",
    },
  },
  
  // Step 6: Calendar
  {
    element: "#nav-calendar",
    popover: {
      title: "📅 Agenda de Aulas",
      description: "Gerencie horários, agende aulas e veja sua disponibilidade semanal. Conecta alunos, turmas e locais em um só lugar.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 7: Payments
  {
    element: "#nav-payments",
    popover: {
      title: "💰 Controle Financeiro",
      description: "Acompanhe pagamentos, gere cobranças e veja quem está em dia. O sistema marca automaticamente alunos inadimplentes.",
      side: "right",
      align: "center",
    },
  },
  
  // Step 8: Quick Actions
  {
    element: "#quick-actions",
    popover: {
      title: "⚡ Ações Rápidas",
      description: "Use os botões de ação rápida para cadastrar novos alunos, agendar aulas e registrar pagamentos sem sair do dashboard.",
      side: "left",
      align: "start",
    },
  },
  
  // Step 9: Profile & Settings
  {
    element: "#user-menu",
    popover: {
      title: "⚙️ Perfil e Configurações",
      description: "Acesse suas configurações, gerencie sua conta e veja informações sobre LGPD (proteção de dados).",
      side: "bottom",
      align: "end",
    },
  },
  
  // Step 10: Finish
  {
    element: "body",
    popover: {
      title: "✅ Tour Concluído!",
      description: "Ótimo! Agora você já sabe como usar o TeacherFlow. Comece cadastrando seus locais, depois turmas e por último seus alunos. Boa aula! 🎓",
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
  closeBtnText: "Pular Tour",
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
    // Add custom styling or behavior to popovers
    const popoverElement = popover.wrapper;
    popoverElement.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.2)";
    popoverElement.style.borderRadius = "12px";
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
