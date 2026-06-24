import { apiClient } from './client';

export interface AdminCompany {
  id: string;
  company_type: 'importer' | 'forwarder';
  name: string;
  country: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
  subscription_tier: string;
  rating_avg: string | null;
  rating_count: number;
  completed_shipments: number;
  created_at: string;
}

export interface AdminStats {
  companiesByType: { company_type: string; count: string }[];
  rfqsByStatus: { status: string; count: string }[];
  bookingsByStatus: { status: string; count: string; total_value: string }[];
  pendingForwarderCount: number;
}

export const adminApi = {
  async listCompanies(filters?: { type?: string; status?: string }): Promise<AdminCompany[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const { companies } = await apiClient.get<{ companies: AdminCompany[] }>(`/admin/companies${qs}`);
    return companies;
  },

  async verifyCompany(companyId: string, status: 'verified' | 'rejected' | 'suspended'): Promise<AdminCompany> {
    const { company } = await apiClient.patch<{ company: AdminCompany }>(`/admin/companies/${companyId}/verify`, { status });
    return company;
  },

  async getStats(): Promise<AdminStats> {
    return apiClient.get<AdminStats>('/admin/stats');
  },
};
