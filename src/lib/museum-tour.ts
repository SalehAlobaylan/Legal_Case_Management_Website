import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  FileSearch,
  GitCompare,
  History,
  Languages,
  Link2,
  LucideIcon,
  MessageSquareText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useChatStore } from "@/lib/store/chat-store";

export type MuseumTourCategory = "core" | "ai" | "admin" | "workflow";

export interface MuseumTourRouteContext {
  /**
   * ID of the first regulation returned by the regulations list API, if
   * the query has resolved. Used by inner-page tour steps that need to
   * navigate to a specific regulation detail page.
   */
  firstRegulationId?: number;
  /**
   * ID of the first case returned by the cases list API, if the query
   * has resolved. Used by inner-page tour steps that need to navigate
   * to a specific case detail page (or the dedicated linking studio).
   */
  firstCaseId?: number;
}

export interface MuseumTourItem {
  id: string;
  category: MuseumTourCategory;
  route: string;
  anchorId: string;
  titleKey: string;
  bodyKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  fallbackAnchorId?: string;
  /**
   * Optional resolver that returns the actual route to navigate to. Lets a
   * step point at an inner page (e.g. a specific regulation's detail) when
   * the needed data is available, while keeping `route` as a safe fallback.
   */
  resolveRoute?: (ctx: MuseumTourRouteContext) => string;
  /**
   * Optional side effect that runs after the tour navigates to the item.
   * Used for steps that need to open overlays, switch tabs, or otherwise
   * prepare the page before the anchor can be found. The tour does not
   * wait on the promise — it's fire-and-forget — but returning a promise
   * is supported so callers can `await` an async setup if they want.
   */
  onActivate?: () => void | Promise<void>;
}

export const MUSEUM_TOUR_STORAGE_KEY = "silah-museum-tour-v1";

export const museumTourItems: MuseumTourItem[] = [
  {
    id: "dashboard-command-center",
    category: "core",
    route: "/dashboard",
    anchorId: "dashboard-command-center",
    titleKey: "museumTour.items.dashboard.title",
    bodyKey: "museumTour.items.dashboard.body",
    icon: BarChart3,
  },
  {
    id: "dashboard-overview",
    category: "core",
    route: "/dashboard",
    anchorId: "dashboard-overview",
    fallbackAnchorId: "dashboard-command-center",
    titleKey: "museumTour.items.dashboardOverview.title",
    bodyKey: "museumTour.items.dashboardOverview.body",
    icon: BarChart3,
  },
  {
    id: "header-search-ai",
    category: "ai",
    route: "/dashboard",
    anchorId: "header-search-ai",
    titleKey: "museumTour.items.searchAi.title",
    bodyKey: "museumTour.items.searchAi.body",
    icon: Search,
  },
  {
    id: "header-ask-ai",
    category: "ai",
    route: "/dashboard",
    anchorId: "header-ask-ai",
    fallbackAnchorId: "header-search-ai",
    titleKey: "museumTour.items.askAi.title",
    bodyKey: "museumTour.items.askAi.body",
    icon: Sparkles,
    onActivate: () => {
      // Open the AI chat panel as soon as the tour reaches this step so
      // the following inner-component steps (chat-panel-header, …) have
      // their anchors in the DOM.
      useChatStore.getState().openChat();
    },
  },
  {
    id: "cases-workspace",
    category: "core",
    route: "/cases",
    anchorId: "cases-workspace",
    titleKey: "museumTour.items.cases.title",
    bodyKey: "museumTour.items.cases.body",
    icon: Briefcase,
  },
  {
    id: "case-linking",
    category: "ai",
    route: "/cases",
    anchorId: "case-linking",
    fallbackAnchorId: "cases-workspace",
    titleKey: "museumTour.items.caseLinking.title",
    bodyKey: "museumTour.items.caseLinking.body",
    icon: Link2,
    resolveRoute: ({ firstCaseId }) =>
      firstCaseId ? `/cases/${firstCaseId}?tab=linking` : "/cases",
  },
  {
    id: "case-linking-studio",
    category: "ai",
    route: "/cases",
    anchorId: "case-linking-studio",
    fallbackAnchorId: "cases-workspace",
    titleKey: "museumTour.items.linkingStudio.title",
    bodyKey: "museumTour.items.linkingStudio.body",
    icon: FileSearch,
    resolveRoute: ({ firstCaseId }) =>
      firstCaseId ? `/cases/${firstCaseId}/linking` : "/cases",
  },
  {
    id: "case-ai-analysis",
    category: "ai",
    route: "/cases",
    anchorId: "case-ai-analysis",
    fallbackAnchorId: "cases-workspace",
    titleKey: "museumTour.items.caseAnalysis.title",
    bodyKey: "museumTour.items.caseAnalysis.body",
    icon: Sparkles,
    resolveRoute: ({ firstCaseId }) =>
      firstCaseId ? `/cases/${firstCaseId}?tab=details` : "/cases",
  },
  {
    id: "find-related",
    category: "ai",
    route: "/cases",
    anchorId: "find-related",
    fallbackAnchorId: "cases-workspace",
    titleKey: "museumTour.items.findRelated.title",
    bodyKey: "museumTour.items.findRelated.body",
    icon: ShieldCheck,
    resolveRoute: ({ firstCaseId }) =>
      firstCaseId ? `/cases/${firstCaseId}?tab=linking` : "/cases",
  },
  {
    id: "regulation-ai-analysis",
    category: "ai",
    route: "/regulations",
    anchorId: "regulation-ai-analysis",
    fallbackAnchorId: "regulations-library",
    titleKey: "museumTour.items.regulationAi.title",
    bodyKey: "museumTour.items.regulationAi.body",
    icon: Bot,
    resolveRoute: ({ firstRegulationId }) =>
      firstRegulationId
        ? `/regulations/${firstRegulationId}?tab=insights`
        : "/regulations",
  },
  {
    id: "regulation-versions",
    category: "ai",
    route: "/regulations",
    anchorId: "regulation-versions",
    fallbackAnchorId: "regulations-library",
    titleKey: "museumTour.items.regVersions.title",
    bodyKey: "museumTour.items.regVersions.body",
    icon: GitCompare,
    resolveRoute: ({ firstRegulationId }) =>
      firstRegulationId
        ? `/regulations/${firstRegulationId}?tab=versions`
        : "/regulations",
  },
  {
    id: "regulation-compare",
    category: "ai",
    route: "/regulations",
    anchorId: "regulation-compare",
    fallbackAnchorId: "regulations-library",
    titleKey: "museumTour.items.regCompare.title",
    bodyKey: "museumTour.items.regCompare.body",
    icon: GitCompare,
    resolveRoute: ({ firstRegulationId }) =>
      firstRegulationId
        ? `/regulations/${firstRegulationId}?tab=compare`
        : "/regulations",
  },
  {
    id: "regulations-library",
    category: "core",
    route: "/regulations",
    anchorId: "regulations-library",
    titleKey: "museumTour.items.regulations.title",
    bodyKey: "museumTour.items.regulations.body",
    icon: BookOpen,
  },
  {
    id: "clients-workflow",
    category: "workflow",
    route: "/clients",
    anchorId: "clients-workflow",
    titleKey: "museumTour.items.clients.title",
    bodyKey: "museumTour.items.clients.body",
    icon: Users,
  },
  {
    id: "alerts-realtime",
    category: "workflow",
    route: "/alerts",
    anchorId: "alerts-realtime",
    titleKey: "museumTour.items.alerts.title",
    bodyKey: "museumTour.items.alerts.body",
    icon: Bell,
  },
  {
    id: "admin-ai-intelligence",
    category: "admin",
    route: "/admin/dashboard?tab=ai-intelligence",
    anchorId: "admin-ai-intelligence",
    fallbackAnchorId: "admin-command-center",
    titleKey: "museumTour.items.adminAi.title",
    bodyKey: "museumTour.items.adminAi.body",
    icon: Bot,
    adminOnly: true,
  },
  {
    id: "admin-operations",
    category: "admin",
    route: "/admin/dashboard",
    anchorId: "admin-command-center",
    titleKey: "museumTour.items.adminOps.title",
    bodyKey: "museumTour.items.adminOps.body",
    icon: ShieldCheck,
    adminOnly: true,
  },
  {
    id: "bilingual",
    category: "workflow",
    route: "/dashboard",
    anchorId: "language-toggle",
    fallbackAnchorId: "dashboard-command-center",
    titleKey: "museumTour.items.bilingual.title",
    bodyKey: "museumTour.items.bilingual.body",
    icon: Languages,
  },
  {
    id: "chat-panel-header",
    category: "ai",
    route: "/dashboard",
    anchorId: "chat-panel-header",
    titleKey: "museumTour.items.chatPanelHeader.title",
    bodyKey: "museumTour.items.chatPanelHeader.body",
    icon: MessageSquareText,
    onActivate: () => {
      // Idempotent: re-opens the panel if the user dismissed it
      // mid-tour. Always lands on the chat view by default.
      useChatStore.getState().openChat();
    },
  },
  {
    id: "chat-panel-input",
    category: "ai",
    route: "/dashboard",
    anchorId: "chat-panel-input",
    titleKey: "museumTour.items.chatPanelInput.title",
    bodyKey: "museumTour.items.chatPanelInput.body",
    icon: Send,
    onActivate: () => {
      useChatStore.getState().openChat(undefined, undefined, "chat");
    },
  },
  {
    id: "chat-panel-history",
    category: "ai",
    route: "/dashboard",
    anchorId: "chat-panel-history",
    titleKey: "museumTour.items.chatPanelHistory.title",
    bodyKey: "museumTour.items.chatPanelHistory.body",
    icon: History,
    onActivate: () => {
      // Switch to the history list before the tour highlights it.
      useChatStore.getState().openChat(undefined, undefined, "history");
    },
  },
];

export const museumGuidedTourIds = [
  "dashboard-command-center",
  "header-search-ai",
  "cases-workspace",
  "case-linking",
  "case-ai-analysis",
  "find-related",
  "regulations-library",
  "regulation-ai-analysis",
  "regulation-versions",
  "admin-ai-intelligence",
  "clients-workflow",
  "header-ask-ai",
  "chat-panel-header",
  "chat-panel-input",
  "chat-panel-history",
];
