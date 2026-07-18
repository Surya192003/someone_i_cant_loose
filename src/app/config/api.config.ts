// src/app/config/api.config.ts

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    auth: {
      login: string;
      register: string;
      logout: string;
      refreshToken: string;
      verifyToken: string;
    };
    users: {
      profile: string;
      update: string;
      delete: string;
    };
    loveMetrics: {
      base: string;
      today: string;
      range: string;
      stats: string;
    };
    timelineEvents: {
      base: string;
      byDate: string;
      types: string;
    };
    moodStatus: {
      base: string;
      update: string;
    };
    messages: {
      base: string;
      unread: string;
      markRead: string;
      markAllRead: string;
    };
    dashboard: {
      stats: string;
      summary: string;
    };
  };
}

// src/app/config/api.config.ts

export const API_CONFIG = {
  baseUrl: 'http://localhost:5000/api',
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refreshToken: '/auth/refresh-token',
      verifyToken: '/auth/verify-token'
    },
    users: {
      profile: '/users/profile',
      update: '/users/profile',
      delete: '/users/profile'
    },
    loveMetrics: {
      base: '/love-metrics',
      today: '/love-metrics/today',
      range: '/love-metrics/range',
      stats: '/love-metrics/stats'
    },
    timelineEvents: {
      base: '/timeline-events',
      byDate: '/timeline-events/by-date',
      types: '/timeline-events/types'
    },
    moodStatus: {
      base: '/mood-status',
      update: '/mood-status/update'
    },
    messages: {
      base: '/messages',
      unread: '/messages/unread',
      markRead: '/messages/mark-read',
      markAllRead: '/messages/mark-all-read'
    },
    dashboard: {
      stats: '/dashboard/stats',
      summary: '/dashboard/summary'
    }
  }
};

// Helper function to build full URL
export function buildUrl(endpoint: string, params?: Record<string, any>): string {
  const baseUrl = API_CONFIG.baseUrl;
  let url = `${baseUrl}${endpoint}`;
  
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
}