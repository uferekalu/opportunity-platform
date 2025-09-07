'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, WaitlistEntry, Opportunity } from '@/types';
import { storage } from '@/utils';
import axios from 'axios';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  waitlistEntry: WaitlistEntry | null;
  recentOpportunities: Opportunity[];
  theme: 'light' | 'dark' | 'system';
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_WAITLIST_ENTRY'; payload: WaitlistEntry | null }
  | { type: 'SET_RECENT_OPPORTUNITIES'; payload: Opportunity[] }
  | { type: 'ADD_OPPORTUNITY'; payload: Opportunity }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  waitlistEntry: null,
  recentOpportunities: [],
  theme: 'system',
  isLoading: false,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    case 'SET_WAITLIST_ENTRY':
      return {
        ...state,
        waitlistEntry: action.payload,
      };
    case 'SET_RECENT_OPPORTUNITIES':
      return {
        ...state,
        recentOpportunities: action.payload,
      };
    case 'ADD_OPPORTUNITY':
      return {
        ...state,
        recentOpportunities: [action.payload, ...state.recentOpportunities.slice(0, 9)],
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setUser: (user: User | null) => void;
    setAuthenticated: (isAuthenticated: boolean) => void;
    setWaitlistEntry: (entry: WaitlistEntry | null) => void;
    setRecentOpportunities: (opportunities: Opportunity[]) => void;
    addOpportunity: (opportunity: Opportunity) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    resetState: () => void;
    verifyWaitlist: () => Promise<void>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load and verify authentication and waitlist status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await axios.get('/api/auth/verify', { withCredentials: true });
        if (response.data.success && response.data.user) {
          dispatch({ type: 'SET_USER', payload: response.data.user });
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
          storage.set('user', response.data.user);
        } else {
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
          storage.remove('user');
        }
      } catch (error) {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        storage.remove('user');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const verifyWaitlist = async () => {
      try {
        const persistedWaitlistEntry = storage.get<WaitlistEntry>('waitlistEntry');
        if (persistedWaitlistEntry && persistedWaitlistEntry.email) {
          dispatch({ type: 'SET_LOADING', payload: true });
          const response = await axios.get(`/api/waitlist?email=${encodeURIComponent(persistedWaitlistEntry.email)}`, {
            withCredentials: true,
          });
          if (response.data.success && response.data.data.entry) {
            dispatch({ type: 'SET_WAITLIST_ENTRY', payload: response.data.data.entry });
          } else {
            dispatch({ type: 'SET_WAITLIST_ENTRY', payload: null });
            storage.remove('waitlistEntry');
          }
        }
      } catch (error) {
        dispatch({ type: 'SET_WAITLIST_ENTRY', payload: null });
        storage.remove('waitlistEntry');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    verifyAuth();
    verifyWaitlist();

    const persistedTheme = storage.get<'light' | 'dark' | 'system'>('theme', 'system');
    if (persistedTheme) {
      dispatch({ type: 'SET_THEME', payload: persistedTheme });
    }
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (state.user) {
      storage.set('user', state.user);
    } else {
      storage.remove('user');
    }
  }, [state.user]);

  // Persist theme to localStorage
  useEffect(() => {
    storage.set('theme', state.theme);

    // Apply theme to document
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else if (state.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [state.theme]);

  // Persist waitlist entry to localStorage
  useEffect(() => {
    if (state.waitlistEntry) {
      storage.set('waitlistEntry', state.waitlistEntry);
    } else {
      storage.remove('waitlistEntry');
    }
  }, [state.waitlistEntry]);

  const actions = {
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', payload: user }),
    setAuthenticated: (isAuthenticated: boolean) => dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated }),
    setWaitlistEntry: (entry: WaitlistEntry | null) => dispatch({ type: 'SET_WAITLIST_ENTRY', payload: entry }),
    setRecentOpportunities: (opportunities: Opportunity[]) => dispatch({ type: 'SET_RECENT_OPPORTUNITIES', payload: opportunities }),
    addOpportunity: (opportunity: Opportunity) => dispatch({ type: 'ADD_OPPORTUNITY', payload: opportunity }),
    setTheme: (theme: 'light' | 'dark' | 'system') => dispatch({ type: 'SET_THEME', payload: theme }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
    verifyWaitlist: async () => {
      try {
        const persistedWaitlistEntry = storage.get<WaitlistEntry>('waitlistEntry');
        if (persistedWaitlistEntry && persistedWaitlistEntry.email) {
          dispatch({ type: 'SET_LOADING', payload: true });
          const response = await axios.get(`/api/waitlist?email=${encodeURIComponent(persistedWaitlistEntry.email)}`, {
            withCredentials: true,
          });
          if (response.data.success && response.data.data.entry) {
            dispatch({ type: 'SET_WAITLIST_ENTRY', payload: response.data.data.entry });
          } else {
            dispatch({ type: 'SET_WAITLIST_ENTRY', payload: null });
            storage.remove('waitlistEntry');
          }
        }
      } catch (error) {
        dispatch({ type: 'SET_WAITLIST_ENTRY', payload: null });
        storage.remove('waitlistEntry');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}