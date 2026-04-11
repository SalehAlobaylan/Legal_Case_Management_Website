/**
 * File: src/components/layout/header.tsx
 * Purpose: Dark navy header with Silah branding, unified search with
 *          auto-suggest dropdown, and integrated AI chat trigger.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  BarChart3,
  Settings,
  Sparkles,
  FileText,
  Users,
  BookOpen,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLogout } from "@/lib/hooks/use-auth";
import { useI18n } from "@/lib/hooks/use-i18n";
import { cn } from "@/lib/utils/cn";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ConnectionStatusIndicator } from "@/components/layout/connection-status";
import { useChatStore } from "@/lib/store/chat-store";
import { searchApi, type UnifiedSearchResponse } from "@/lib/api/search";

// Question word patterns for intent detection
const AR_QUESTION_WORDS = /^(ما|هل|كيف|لماذا|أين|متى|من|ماذا|ماهي|ماهو)/;
const EN_QUESTION_WORDS = /^(what|how|why|when|where|who|is|can|does|should|would|could|do|are|was|were)\b/i;

/* =============================================================================
   HEADER COMPONENT
   ============================================================================= */

interface HeaderProps {
  unreadCount?: number;
  onSearch?: (query: string) => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
}

export function Header({
  unreadCount = 0,
  onSearch,
  onNotificationsClick,
  onSettingsClick,
}: HeaderProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { t, isRTL } = useI18n();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [results, setResults] = React.useState<UnifiedSearchResponse | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedIdx, setSelectedIdx] = React.useState(-1);
  const openChat = useChatStore((s) => s.openChat);
  const isChatOpen = useChatStore((s) => s.isOpen);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  const searchRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect if the query looks like a question
  const isQuestion = React.useMemo(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 5) return false;
    if (q.includes("?")) return true;
    if (AR_QUESTION_WORDS.test(q)) return true;
    if (EN_QUESTION_WORDS.test(q)) return true;
    return false;
  }, [searchQuery]);

  // Total result count for keyboard nav
  const flatResults = React.useMemo(() => {
    if (!results) return [];
    const items: { type: "case" | "client" | "regulation"; data: any }[] = [];
    results.cases.forEach((c) => items.push({ type: "case", data: c }));
    results.clients.forEach((c) => items.push({ type: "client", data: c }));
    results.regulations.forEach((r) => items.push({ type: "regulation", data: r }));
    return items;
  }, [results]);

  const showDropdown = isFocused && searchQuery.trim().length >= 2;
  const hasResults = flatResults.length > 0;

  // User info
  const userInitials = React.useMemo(() => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.fullName]);

  const userName = user?.fullName || "User";
  const userRole = user?.role || "Lawyer";

  // Debounced search
  React.useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchApi.search(q, 4);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIdx(-1);
  }, [results]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const navigateToResult = (item: { type: string; data: any }) => {
    setIsFocused(false);
    setSearchQuery("");
    setResults(null);
    if (item.type === "case") router.push(`/cases/${item.data.id}`);
    else if (item.type === "client") router.push(`/clients/${item.data.id}`);
    else if (item.type === "regulation") router.push(`/regulations/${item.data.id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if (isQuestion) {
      openChat(q);
      setSearchQuery("");
      setResults(null);
      setIsFocused(false);
    } else if (selectedIdx >= 0 && selectedIdx < flatResults.length) {
      navigateToResult(flatResults[selectedIdx]);
    } else {
      // Fallback: navigate to first result if available
      if (flatResults.length > 0) {
        navigateToResult(flatResults[0]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    // Extra item count: AI ask row (if question detected) = +1
    const totalItems = flatResults.length + (isQuestion ? 1 : 0);
    if (totalItems === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      if (selectedIdx >= 0) {
        e.preventDefault();
        if (isQuestion && selectedIdx === flatResults.length) {
          // AI row selected
          openChat(searchQuery.trim());
          setSearchQuery("");
          setResults(null);
          setIsFocused(false);
        } else if (selectedIdx < flatResults.length) {
          navigateToResult(flatResults[selectedIdx]);
        }
      }
      // If nothing selected, let form submit handler run
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  const handleAskAI = () => {
    const q = searchQuery.trim();
    openChat(q || undefined);
    setSearchQuery("");
    setResults(null);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults(null);
    inputRef.current?.focus();
  };

  const handleNotifications = () => {
    onNotificationsClick ? onNotificationsClick() : router.push("/alerts");
  };
  const handleSettings = () => {
    onSettingsClick ? onSettingsClick() : router.push("/profile");
  };
  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  /* =========================================================================
     Status badge helpers
     ========================================================================= */
  const statusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "open" || s === "active" || s === "published") return "bg-emerald-400/20 text-emerald-300";
    if (s === "in_progress" || s === "pending_hearing") return "bg-amber-400/20 text-amber-300";
    if (s === "closed" || s === "archived" || s === "inactive") return "bg-slate-400/20 text-slate-400";
    return "bg-blue-400/20 text-blue-300";
  };

  const caseTypeLabel = (ct: string) => {
    const labels: Record<string, string> = {
      criminal: isRTL ? "جنائي" : "Criminal",
      civil: isRTL ? "مدني" : "Civil",
      commercial: isRTL ? "تجاري" : "Commercial",
      labor: isRTL ? "عمالي" : "Labor",
      family: isRTL ? "أسرة" : "Family",
      administrative: isRTL ? "إداري" : "Admin",
    };
    return labels[ct] || ct;
  };

  return (
    <header
      className={cn(
        "h-20 sticky top-0 z-40",
        "bg-[#0F2942] border-b border-[#1E3A56]",
        "flex items-center justify-between px-4 sm:px-6 lg:px-8",
        "shadow-md"
      )}
    >
      {/* Left: Brand Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] rounded-lg"
      >
        <img
          src="/circle-logo-silah.png"
          alt="صلة - Silah"
          className="h-12 w-auto"
        />
        <div className="hidden sm:block">
          <h1
            className="text-xl font-bold"
            style={{
              fontFamily: isRTL ? "var(--font-arabic), serif" : "inherit",
              color: "#D97706",
            }}
          >
            {isRTL ? "صلة القانوني" : "Silah Legal"}
          </h1>
          <p className="text-[10px] text-[#D97706] font-medium tracking-wider">
            {isRTL ? "منصة للقانونيين" : "platform for lawyers"}
          </p>
        </div>
      </Link>

      {/* Center: Search Bar — visible on all screen sizes */}
      <div ref={searchRef} className="flex-1 mx-3 sm:mx-4 md:flex-none md:mx-0 relative md:w-[460px]">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div
            className={cn(
              "flex items-center relative",
              "bg-[#1E3A56] rounded-2xl px-4 py-2.5",
              "border border-[#2A4D70]",
              "transition-all duration-200 group",
              isFocused && "border-[#D97706] bg-[#152e46] shadow-lg shadow-[#D97706]/10",
              showDropdown && hasResults && "rounded-b-none border-b-transparent"
            )}
          >
            <Search
              className={cn(
                "h-4 w-4 flex-shrink-0",
                isRTL ? "ml-2" : "mr-2",
                isFocused ? "text-[#D97706]" : "text-blue-300",
                "transition-colors"
              )}
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder={t("header.searchPlaceholder")}
              onFocus={() => {
                // On mobile (<md), tap opens the full overlay instead of typing inline
                if (window.innerWidth < 768) {
                  setMobileSearchOpen(true);
                } else {
                  setIsFocused(true);
                }
              }}
              className={cn(
                "bg-transparent border-none outline-none",
                "text-sm w-full text-white",
                "placeholder:text-blue-300/50",
                "md:cursor-text cursor-pointer"
              )}
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-0.5 rounded-full text-blue-300/60 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Divider + AI button — hidden on mobile (AI is in overlay) */}
            <div className={cn("hidden md:flex items-center gap-2 flex-shrink-0", isRTL ? "mr-2" : "ml-2")}>
              <div className="w-px h-5 bg-[#2A4D70]" />
              <button
                type="button"
                onClick={handleAskAI}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-xl",
                  "text-[11px] font-semibold transition-all duration-200",
                  isChatOpen
                    ? "bg-[#D97706] text-white"
                    : "bg-[#D97706]/15 text-[#D97706] hover:bg-[#D97706]/25"
                )}
                title={t("chat.title")}
              >
                <Sparkles className="h-3 w-3" />
                <span className="hidden lg:inline">ASK AI</span>
              </button>
            </div>
          </div>

          {/* Intent hint below search bar */}
          {isFocused && searchQuery.trim().length > 2 && !showDropdown && (
            <span
              className={cn(
                "absolute -bottom-5 text-[10px] whitespace-nowrap",
                isRTL ? "right-4" : "left-4",
                isQuestion ? "text-[#D97706]" : "text-blue-300/50"
              )}
            >
              {isQuestion ? t("chat.askAssistant") : t("chat.searchKeyword")}
            </span>
          )}
        </form>

        {/* Auto-Suggest Dropdown */}
        {showDropdown && (
          <div
            className={cn(
              "absolute top-full left-0 right-0 z-50",
              "bg-[#152e46] border border-[#D97706] border-t-0",
              "rounded-b-2xl shadow-2xl shadow-black/30",
              "max-h-[420px] overflow-y-auto",
              "animate-in fade-in slide-in-from-top-1 duration-150"
            )}
          >
            {/* Loading state */}
            {isSearching && !hasResults && (
              <div className="px-4 py-6 flex justify-center">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* No results */}
            {!isSearching && !hasResults && searchQuery.trim().length >= 2 && (
              <div className="px-4 py-5 text-center text-sm text-blue-300/60">
                {isRTL ? "لا توجد نتائج" : "No results found"}
              </div>
            )}

            {/* Results */}
            {hasResults && (
              <div className="py-1">
                {/* Cases section */}
                {results!.cases.length > 0 && (
                  <div>
                    <div className="px-4 pt-2 pb-1 text-[10px] font-semibold text-blue-300/50 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      {isRTL ? "القضايا" : "Cases"}
                    </div>
                    {results!.cases.map((c, i) => {
                      const globalIdx = i;
                      return (
                        <button
                          key={`case-${c.id}`}
                          type="button"
                          onClick={() => navigateToResult({ type: "case", data: c })}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isRTL && "text-right flex-row-reverse",
                            selectedIdx === globalIdx
                              ? "bg-[#D97706]/10"
                              : "hover:bg-white/5"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium truncate">{c.title}</div>
                            <div className="text-[11px] text-blue-300/60 flex items-center gap-2 mt-0.5">
                              <span>{c.caseNumber}</span>
                              <span className="text-blue-300/30">·</span>
                              <span>{caseTypeLabel(c.caseType)}</span>
                            </div>
                          </div>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", statusColor(c.status))}>
                            {c.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Clients section */}
                {results!.clients.length > 0 && (
                  <div>
                    <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold text-blue-300/50 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      {isRTL ? "العملاء" : "Clients"}
                    </div>
                    {results!.clients.map((c, i) => {
                      const globalIdx = (results!.cases.length) + i;
                      return (
                        <button
                          key={`client-${c.id}`}
                          type="button"
                          onClick={() => navigateToResult({ type: "client", data: c })}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isRTL && "text-right flex-row-reverse",
                            selectedIdx === globalIdx
                              ? "bg-[#D97706]/10"
                              : "hover:bg-white/5"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium truncate">{c.name}</div>
                            <div className="text-[11px] text-blue-300/60 mt-0.5">{c.type}</div>
                          </div>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", statusColor(c.status))}>
                            {c.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Regulations section */}
                {results!.regulations.length > 0 && (
                  <div>
                    <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold text-blue-300/50 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" />
                      {isRTL ? "الأنظمة" : "Regulations"}
                    </div>
                    {results!.regulations.map((r, i) => {
                      const globalIdx = (results!.cases.length) + (results!.clients.length) + i;
                      return (
                        <button
                          key={`reg-${r.id}`}
                          type="button"
                          onClick={() => navigateToResult({ type: "regulation", data: r })}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isRTL && "text-right flex-row-reverse",
                            selectedIdx === globalIdx
                              ? "bg-[#D97706]/10"
                              : "hover:bg-white/5"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#D97706]/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-4 w-4 text-[#D97706]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium truncate">{r.title}</div>
                            <div className="text-[11px] text-blue-300/60 flex items-center gap-2 mt-0.5">
                              <span>{r.regulationNumber}</span>
                              {r.category && (
                                <>
                                  <span className="text-blue-300/30">·</span>
                                  <span>{r.category}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* AI Ask row — always visible when there's input */}
            {searchQuery.trim().length >= 2 && (
              <div className={cn(
                "border-t border-[#2A4D70]",
              )}>
                <button
                  type="button"
                  onClick={handleAskAI}
                  onMouseEnter={() => setSelectedIdx(flatResults.length)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    isRTL && "text-right flex-row-reverse",
                    selectedIdx === flatResults.length
                      ? "bg-[#D97706]/10"
                      : "hover:bg-white/5"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#D97706]/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-[#D97706]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#D97706] font-medium">
                      {isRTL ? "اسأل المساعد الذكي" : "Ask AI Assistant"}
                    </div>
                    <div className="text-[11px] text-blue-300/50 truncate mt-0.5">
                      &ldquo;{searchQuery.trim()}&rdquo;
                    </div>
                  </div>
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-blue-300/40 bg-white/5 border border-white/10">
                    Enter
                  </kbd>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setMobileSearchOpen(false);
              setIsFocused(false);
              setSearchQuery("");
              setResults(null);
            }}
          />
          {/* Search panel */}
          <div ref={searchRef} className="relative bg-gradient-to-b from-[#0F2942] to-[#0d2236] px-4 pt-4 pb-3 shadow-2xl shadow-black/40">
            {/* Search row: input + cancel */}
            <form onSubmit={(e) => { handleSearchSubmit(e); setMobileSearchOpen(false); }} className="relative flex items-center gap-3">
              <div
                className={cn(
                  "flex-1 flex items-center",
                  "bg-[#1E3A56]/80 rounded-xl px-4 py-3",
                  "border border-[#2A4D70]/60",
                  "ring-2 ring-[#D97706]/20",
                  "transition-all duration-200"
                )}
              >
                <Search
                  className={cn(
                    "h-[18px] w-[18px] flex-shrink-0",
                    isRTL ? "ml-3" : "mr-3",
                    "text-[#D97706]/70 transition-colors"
                  )}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsFocused(true)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("header.searchPlaceholder")}
                  autoFocus
                  className={cn(
                    "bg-transparent border-none outline-none",
                    "text-[15px] w-full text-white",
                    "placeholder:text-blue-300/40"
                  )}
                />

                {/* Clear button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-1 rounded-full bg-white/10 text-blue-200/70 hover:text-white hover:bg-white/20 transition-all flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Divider + AI button (same as desktop) */}
                <div className={cn("flex items-center gap-2 flex-shrink-0", isRTL ? "mr-2" : "ml-2")}>
                  <div className="w-px h-5 bg-[#2A4D70]" />
                  <button
                    type="button"
                    onClick={() => { handleAskAI(); setMobileSearchOpen(false); }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-xl",
                      "text-[11px] font-semibold transition-all duration-200",
                      isChatOpen
                        ? "bg-[#D97706] text-white"
                        : "bg-[#D97706]/15 text-[#D97706] hover:bg-[#D97706]/25"
                    )}
                    title={t("chat.title")}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {/* Cancel text button */}
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setIsFocused(false);
                  setSearchQuery("");
                  setResults(null);
                }}
                className="text-[13px] font-semibold text-blue-200/80 hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
            </form>

            {/* Mobile Auto-Suggest Dropdown */}
            {searchQuery.trim().length >= 2 && (
              <div
                className={cn(
                  "mt-1 bg-[#152e46] border border-[#2A4D70] rounded-2xl shadow-2xl shadow-black/30",
                  "max-h-[60vh] overflow-y-auto",
                  "animate-in fade-in slide-in-from-top-1 duration-150"
                )}
              >
                {/* Loading */}
                {isSearching && !hasResults && (
                  <div className="px-4 py-6 flex justify-center">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                {/* No results */}
                {!isSearching && !hasResults && searchQuery.trim().length >= 2 && (
                  <div className="px-4 py-5 text-center text-sm text-blue-300/60">
                    {isRTL ? "لا توجد نتائج" : "No results found"}
                  </div>
                )}

                {/* Results */}
                {hasResults && (
                  <div className="py-1">
                    {results!.cases.length > 0 && (
                      <div>
                        <div className="px-4 pt-2 pb-1 text-[10px] font-semibold text-blue-300/50 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-3 w-3" />
                          {isRTL ? "القضايا" : "Cases"}
                        </div>
                        {results!.cases.map((c, i) => (
                          <button
                            key={`m-case-${c.id}`}
                            type="button"
                            onClick={() => { navigateToResult({ type: "case", data: c }); setMobileSearchOpen(false); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5",
                              isRTL && "text-right flex-row-reverse"
                            )}
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-4 w-4 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white font-medium truncate">{c.title}</div>
                              <div className="text-[11px] text-blue-300/60 flex items-center gap-2 mt-0.5">
                                <span>{c.caseNumber}</span>
                                <span className="text-blue-300/30">·</span>
                                <span>{caseTypeLabel(c.caseType)}</span>
                              </div>
                            </div>
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", statusColor(c.status))}>
                              {c.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {results!.clients.length > 0 && (
                      <div>
                        <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold text-blue-300/50 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="h-3 w-3" />
                          {isRTL ? "العملاء" : "Clients"}
                        </div>
                        {results!.clients.map((c) => (
                          <button
                            key={`m-client-${c.id}`}
                            type="button"
                            onClick={() => { navigateToResult({ type: "client", data: c }); setMobileSearchOpen(false); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5",
                              isRTL && "text-right flex-row-reverse"
                            )}
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                              <Users className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white font-medium truncate">{c.name}</div>
                              <div className="text-[11px] text-blue-300/60 mt-0.5">{c.type}</div>
                            </div>
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", statusColor(c.status))}>
                              {c.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {results!.regulations.length > 0 && (
                      <div>
                        <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold text-blue-300/50 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="h-3 w-3" />
                          {isRTL ? "الأنظمة" : "Regulations"}
                        </div>
                        {results!.regulations.map((r) => (
                          <button
                            key={`m-reg-${r.id}`}
                            type="button"
                            onClick={() => { navigateToResult({ type: "regulation", data: r }); setMobileSearchOpen(false); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5",
                              isRTL && "text-right flex-row-reverse"
                            )}
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#D97706]/10 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-4 w-4 text-[#D97706]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white font-medium truncate">{r.title}</div>
                              <div className="text-[11px] text-blue-300/60 flex items-center gap-2 mt-0.5">
                                <span>{r.regulationNumber}</span>
                                {r.category && (
                                  <>
                                    <span className="text-blue-300/30">·</span>
                                    <span>{r.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Ask row */}
                <div className="border-t border-[#2A4D70]">
                  <button
                    type="button"
                    onClick={() => { handleAskAI(); setMobileSearchOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5",
                      isRTL && "text-right flex-row-reverse"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#D97706]/15 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-[#D97706]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[#D97706] font-medium">
                        {isRTL ? "اسأل المساعد الذكي" : "Ask AI Assistant"}
                      </div>
                      <div className="text-[11px] text-blue-300/50 truncate mt-0.5">
                        &ldquo;{searchQuery.trim()}&rdquo;
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Connection Status */}
          <div className={`hidden md:flex ${isRTL ? "ml-2" : "mr-2"}`}>
            <ConnectionStatusIndicator />
          </div>

          {/* Language Toggle */}
          <LanguageToggle variant="icon" />

          {/* Notifications */}
          <button
            type="button"
            onClick={handleNotifications}
            className={cn(
              "relative p-2 rounded-full",
              "text-blue-200 hover:text-white",
              "hover:bg-[#1E3A56]",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            )}
            aria-label={`${t("header.notifications")}${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            title={t("header.notifications")}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                className={cn(
                  "absolute top-1.5",
                  isRTL ? "left-1.5" : "right-1.5",
                  "w-2.5 h-2.5 bg-[#D97706] rounded-full",
                  "border-2 border-[#0F2942]"
                )}
                aria-hidden="true"
              />
            )}
          </button>

          {/* Analytics / Profile */}
          <button
            type="button"
            onClick={handleSettings}
            className={cn(
              "p-2 rounded-full",
              "text-blue-200 hover:text-white",
              "hover:bg-[#1E3A56]",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            )}
            aria-label={t("nav.profile")}
            title={t("nav.profile")}
          >
            <BarChart3 className="h-5 w-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-8 w-px bg-[#1E3A56]" />

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "flex items-center gap-2 sm:gap-3 cursor-pointer",
              "p-1.5 rounded-full",
              isRTL ? "pl-2 sm:pl-3" : "pr-2 sm:pr-3",
              "border border-transparent",
              "hover:bg-[#1E3A56] hover:border-[#2A4D70]",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            )}
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full",
                "bg-white text-[#0F2942]",
                "flex items-center justify-center",
                "font-bold text-sm",
                "shadow-md ring-2 ring-[#D97706]/20"
              )}
            >
              {userInitials}
            </div>
            <div className={`hidden md:block ${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-sm font-bold text-white leading-none">{userName}</p>
              <p className="text-[10px] text-blue-200 font-medium mt-1">{userRole}</p>
            </div>
            <ChevronDown
              className={cn(
                "hidden sm:block h-4 w-4 text-blue-200",
                "transition-transform duration-200",
                showUserMenu && "rotate-180"
              )}
            />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div
                className={cn(
                  "absolute top-full mt-2 z-50",
                  isRTL ? "left-0" : "right-0",
                  "w-56 py-2",
                  "bg-white rounded-xl shadow-2xl",
                  "border border-slate-200",
                  "animate-in fade-in slide-in-from-top-2 duration-200"
                )}
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-[#0F2942]">{userName}</p>
                  <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0F2942] transition-colors"
                  >
                    <User className="h-4 w-4" />
                    {t("nav.profile")}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0F2942] transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    {t("header.settings")}
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("auth.signOut")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
