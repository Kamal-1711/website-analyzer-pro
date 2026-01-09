import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Website, CrawlMessage } from "@/types";

// =============================================================================
// APP STORE TYPES
// =============================================================================

/**
 * Application state shape
 */
interface AppState {
  /** List of all analyzed websites */
  websites: Website[];

  /** Chat messages for crawl interface */
  messages: CrawlMessage[];

  /** Currently active/viewing website */
  activeWebsite: Website | null;

  /** Whether a crawl is currently in progress */
  isCrawling: boolean;

  /** Current crawl progress (0-100) */
  crawlProgress: number;

  /** Dark mode enabled state */
  darkMode: boolean;
}

/**
 * Application actions
 */
interface AppActions {
  // Website actions
  /** Add a new website to the list */
  addWebsite: (website: Website) => void;

  /** Update an existing website by ID */
  updateWebsite: (id: string, updates: Partial<Website>) => void;

  /** Remove a website by ID */
  deleteWebsite: (id: string) => void;

  /** Set all websites (useful for initial load) */
  setWebsites: (websites: Website[]) => void;

  // Message actions
  /** Add a new message to the chat */
  addMessage: (message: CrawlMessage) => void;

  /** Clear all messages */
  clearMessages: () => void;

  /** Set all messages (useful for loading history) */
  setMessages: (messages: CrawlMessage[]) => void;

  /** Update a specific message by ID */
  updateMessage: (id: string, updates: Partial<CrawlMessage>) => void;

  // Crawl actions
  /** Set crawling state */
  setCrawling: (value: boolean) => void;

  /** Set crawl progress percentage (0-100) */
  setProgress: (value: number) => void;

  /** Reset crawl state (progress and crawling flag) */
  resetCrawl: () => void;

  // Active website actions
  /** Set the currently active website */
  setActiveWebsite: (website: Website | null) => void;

  // Theme actions
  /** Toggle between dark and light mode */
  toggleDarkMode: () => void;

  /** Set dark mode explicitly */
  setDarkMode: (value: boolean) => void;
}

/**
 * Complete store type combining state and actions
 */
export type AppStore = AppState & AppActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AppState = {
  websites: [],
  messages: [],
  activeWebsite: null,
  isCrawling: false,
  crawlProgress: 0,
  darkMode: true, // Default to dark mode
};

// =============================================================================
// APP STORE
// =============================================================================

/**
 * Main application store using Zustand
 *
 * Manages all app-wide state including:
 * - Websites list and active website
 * - Chat messages for crawl interface
 * - Crawl progress state
 * - Theme (dark/light mode)
 *
 * State is persisted to localStorage for:
 * - websites (preserves analyzed sites)
 * - darkMode (preserves user preference)
 *
 * @example
 * ```tsx
 * // In a component
 * const { websites, addWebsite, darkMode, toggleDarkMode } = useAppStore();
 *
 * // With selector for performance
 * const websites = useAppStore((state) => state.websites);
 * const addWebsite = useAppStore((state) => state.addWebsite);
 * ```
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // =========================================================================
      // STATE
      // =========================================================================
      ...initialState,

      // =========================================================================
      // WEBSITE ACTIONS
      // =========================================================================

      /**
       * Adds a new website to the list
       * Prevents duplicates by checking if website with same ID exists
       */
      addWebsite: (website) =>
        set((state) => {
          // Prevent duplicate websites
          if (state.websites.some((w) => w.id === website.id)) {
            return state;
          }
          return {
            websites: [...state.websites, website],
          };
        }),

      /**
       * Updates an existing website by ID
       * Merges the updates with existing website data
       * Also updates activeWebsite if it's the one being updated
       */
      updateWebsite: (id, updates) =>
        set((state) => {
          const updatedWebsites = state.websites.map((website) =>
            website.id === id
              ? { ...website, ...updates, updatedAt: new Date() }
              : website
          );

          // Also update activeWebsite if it's the one being updated
          const updatedActiveWebsite =
            state.activeWebsite?.id === id
              ? { ...state.activeWebsite, ...updates, updatedAt: new Date() }
              : state.activeWebsite;

          return {
            websites: updatedWebsites,
            activeWebsite: updatedActiveWebsite,
          };
        }),

      /**
       * Removes a website by ID
       * Also clears activeWebsite if it's the one being deleted
       */
      deleteWebsite: (id) =>
        set((state) => ({
          websites: state.websites.filter((website) => website.id !== id),
          // Clear activeWebsite if it's the one being deleted
          activeWebsite:
            state.activeWebsite?.id === id ? null : state.activeWebsite,
        })),

      /**
       * Sets the entire websites array
       * Useful for initial data loading from API
       */
      setWebsites: (websites) => set({ websites }),

      // =========================================================================
      // MESSAGE ACTIONS
      // =========================================================================

      /**
       * Adds a new message to the chat
       * Messages are appended to the end of the array
       */
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      /**
       * Clears all messages from the chat
       * Useful when starting a new crawl or resetting state
       */
      clearMessages: () => set({ messages: [] }),

      /**
       * Sets all messages at once
       * Useful for loading message history
       */
      setMessages: (messages) => set({ messages }),

      /**
       * Updates a specific message by ID
       * Useful for updating crawl progress without adding new messages
       */
      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        })),

      // =========================================================================
      // CRAWL ACTIONS
      // =========================================================================

      /**
       * Sets the crawling state
       * When set to true, indicates a crawl is in progress
       * When set to false, resets progress to 0
       */
      setCrawling: (value) =>
        set({
          isCrawling: value,
          // Reset progress when crawl starts
          crawlProgress: value ? 0 : get().crawlProgress,
        }),

      /**
       * Sets the crawl progress percentage
       * Value should be between 0 and 100
       */
      setProgress: (value) =>
        set({
          crawlProgress: Math.min(100, Math.max(0, value)),
        }),

      /**
       * Resets all crawl-related state
       * Clears crawling flag and progress
       */
      resetCrawl: () =>
        set({
          isCrawling: false,
          crawlProgress: 0,
        }),

      // =========================================================================
      // ACTIVE WEBSITE ACTIONS
      // =========================================================================

      /**
       * Sets the currently active website
       * Used when navigating to a specific website's dashboard
       */
      setActiveWebsite: (website) => set({ activeWebsite: website }),

      // =========================================================================
      // THEME ACTIONS
      // =========================================================================

      /**
       * Toggles between dark and light mode
       * Also updates the document class for Tailwind dark mode
       */
      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.darkMode;
          // Update document class for Tailwind
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newDarkMode);
          }
          return { darkMode: newDarkMode };
        }),

      /**
       * Explicitly sets dark mode value
       * Also updates the document class for Tailwind
       */
      setDarkMode: (value) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", value);
        }
        set({ darkMode: value });
      },
    }),
    {
      name: "website-analyzer-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist specific state values
      partialize: (state) => ({
        websites: state.websites,
        darkMode: state.darkMode,
      }),
      // Handle rehydration to apply dark mode class on load
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", state.darkMode);
        }
      },
    }
  )
);

// =============================================================================
// SELECTOR HOOKS (for better performance)
// =============================================================================

/**
 * Hook to get only websites from store
 * Use this for better render performance when you only need websites
 */
export const useWebsites = () => useAppStore((state) => state.websites);

/**
 * Hook to get only messages from store
 */
export const useMessages = () => useAppStore((state) => state.messages);

/**
 * Hook to get active website
 */
export const useActiveWebsite = () =>
  useAppStore((state) => state.activeWebsite);

/**
 * Hook to get crawl state
 */
export const useCrawlState = () =>
  useAppStore((state) => ({
    isCrawling: state.isCrawling,
    progress: state.crawlProgress,
  }));

/**
 * Hook to get dark mode state and toggle
 */
export const useDarkMode = () =>
  useAppStore((state) => ({
    darkMode: state.darkMode,
    toggleDarkMode: state.toggleDarkMode,
  }));

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a website by ID from the store
 *
 * @param id - Website ID to find
 * @returns Website if found, undefined otherwise
 */
export const getWebsiteById = (id: string): Website | undefined => {
  return useAppStore.getState().websites.find((w) => w.id === id);
};

/**
 * Check if a website with the given URL already exists
 *
 * @param url - URL to check
 * @returns true if website exists
 */
export const websiteExists = (url: string): boolean => {
  return useAppStore.getState().websites.some((w) => w.url === url);
};
