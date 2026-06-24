import { apiClient } from './client';
import { User, UserRole } from '../types';

interface SessionUser {
  id: string;
  companyId: string | null;
  role: UserRole;
  fullName: string;
  email: string;
  companyName: string | null;
  companyVerificationStatus: string | null;
}

function toFrontendUser(u: SessionUser): User {
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    companyName: u.companyName || '',
    role: u.role,
    verified: u.companyVerificationStatus === 'verified',
    country: '', // not in session payload; fetched separately if a screen needs it
    avatar: '',
  };
}

export const authApi = {
  async register(data: {
    companyType: 'importer' | 'forwarder';
    companyName: string;
    country: string;
    fullName: string;
    email: string;
    password: string;
  }) {
    return apiClient.post<{ message: string; company: any; user: any }>('/auth/register', data);
  },

  async login(email: string, password: string): Promise<User> {
    const { user } = await apiClient.post<{ user: SessionUser }>('/auth/login', { email, password });
    return toFrontendUser(user);
  },

  async logout() {
    return apiClient.post('/auth/logout');
  },

  /** Checks for an existing valid session on app load. Returns null if not logged in
   *  (this is expected -- most visitors are anonymous) rather than throwing, so app
   *  startup doesn't treat "not logged in" as an error condition. */
  async getSession(): Promise<User | null> {
    try {
      const { user } = await apiClient.get<{ user: SessionUser }>('/auth/me');
      return toFrontendUser(user);
    } catch {
      return null;
    }
  },
};
