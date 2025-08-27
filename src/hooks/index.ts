import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WaitlistFormData, WaitlistEntry, Opportunity, ApiResponse, PaginatedResponse, DashboardStats, User, WebhookEvent } from '@/types';
import { useApp } from '@/context/app-context';
import axios from 'axios';

// API base URL
const API_BASE = '/api';

// Axios instance
const api = axios.create({
  baseURL: API_BASE,
});

// Query keys
export const queryKeys = {
  waitlist: ['waitlist'],
  opportunities: ['opportunities'],
  dashboard: ['dashboard'],
  newsletter: ['newsletter'],
  user: ['user'],
} as const;

// Waitlist hooks
export const useWaitlistSignup = () => {
  const { actions } = useApp();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<WaitlistEntry>, Error, WaitlistFormData>({
    mutationFn: async (data: WaitlistFormData) => {
      const response = await api.post<ApiResponse<WaitlistEntry>>('/waitlist', data);
      return response.data;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        actions.setWaitlistEntry(response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.waitlist });
      }
    },
    onError: (error) => {
      console.error('Waitlist signup failed:', error);
      actions.setError(error.message || 'Failed to join waitlist');
    },
  });
};

export const useWaitlistStats = () => {
  return useQuery<ApiResponse<{ total: number; position?: number }>>({
    queryKey: queryKeys.waitlist,
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ total: number; position?: number }>>('/waitlist/stats');
      return response.data;
    },
  });
};

// Opportunity hooks
export const useOpportunities = (filters?: {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  search?: string;
}) => {
  return useQuery<ApiResponse<PaginatedResponse<Opportunity>>>({
    queryKey: [...queryKeys.opportunities, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.category) params.append('category', filters.category);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get<ApiResponse<PaginatedResponse<Opportunity>>>(`/opportunities?${params}`);
      return response.data;
    },
  });
};

export const useOpportunity = (id: string) => {
  return useQuery<ApiResponse<Opportunity>>({
    queryKey: [...queryKeys.opportunities, id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Opportunity>>(`/opportunities/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateOpportunity = () => {
  const { actions } = useApp();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Opportunity>, Error, Partial<Opportunity>>({
    mutationFn: async (data: Partial<Opportunity>) => {
      const response = await api.post<ApiResponse<Opportunity>>('/opportunities', data);
      return response.data;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        actions.addOpportunity(response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      }
    },
    onError: (error) => {
      console.error('Create opportunity failed:', error);
      actions.setError(error.message || 'Failed to create opportunity');
    },
  });
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery<ApiResponse<DashboardStats>>({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data;
    },
  });
};

export const useRecentOpportunities = (limit: number = 5) => {
  return useQuery<ApiResponse<Opportunity[]>>({
    queryKey: [...queryKeys.opportunities, 'recent', limit],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Opportunity[]>>(`/opportunities/recent?limit=${limit}`);
      return response.data;
    },
  });
};

// Newsletter hooks
export const useNewsletterSignup = () => {
  const { actions } = useApp();

  return useMutation<ApiResponse<{ success: boolean }>, Error, { email: string; name?: string }>({
    mutationFn: async (data) => {
      const response = await api.post<ApiResponse<{ success: boolean }>>('/newsletter/subscribe', data);
      return response.data;
    },
    onError: (error) => {
      console.error('Newsletter signup failed:', error);
      actions.setError(error.message || 'Failed to subscribe to newsletter');
    },
  });
};

// User hooks
export const useUser = () => {
  const { state } = useApp();
  
  return useQuery<ApiResponse<User>>({
    queryKey: queryKeys.user,
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>('/user/profile');
      return response.data;
    },
    enabled: state.isAuthenticated,
  });
};

export const useUpdateUser = () => {
  const { actions } = useApp();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<User>, Error, Partial<User>>({
    mutationFn: async (data) => {
      const response = await api.patch<ApiResponse<User>>('/user/profile', data);
      return response.data;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        actions.setUser(response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.user });
      }
    },
    onError: (error) => {
      console.error('Update user failed:', error);
      actions.setError(error.message || 'Failed to update profile');
    },
  });
};

// Webhook hooks for automations
export const useTriggerWebhook = () => {
  interface TriggerWebhookPayload {
    type: string;
    payload: Record<string, any>;
  }

  return useMutation<ApiResponse<WebhookEvent>, Error, TriggerWebhookPayload>({
    mutationFn: async (data: TriggerWebhookPayload) => {
      const response = await api.post<ApiResponse<WebhookEvent>>('/webhooks/trigger', data);
      return response.data;
    },
  });
};

// Custom hooks for local state management
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// Debounced search hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Media query hook
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
};

// Import React for hooks
import React from 'react';
