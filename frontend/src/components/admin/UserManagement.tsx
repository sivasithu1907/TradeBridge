import React, { useEffect, useState } from 'react';
import { ShieldCheck, XCircle, CheckCircle2, Search, Building, Loader2, Ban } from 'lucide-react';
import { adminApi, AdminCompany } from '../../api/admin';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const UserManagement: React.FC = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadCompanies = () => {
    setIsLoading(true);
    adminApi
      .listCompanies()
      .then(setCompanies)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load companies'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleVerify = async (companyId: string, status: 'verified' | 'rejected' | 'suspended') => {
    setActioningId(companyId);
    try {
      const updated = await adminApi.verifyCompany(companyId, status);
      setCompanies((prev) => prev.map((c) => (c.id === companyId ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    } finally {
      setActioningId(null);
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusBadgeVariant = (status: AdminCompany['verification_status']) => {
    if (status === 'verified') return 'success';
    if (status === 'pending') return 'warning';
    return 'danger'; // rejected or suspended
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      <div className="pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Company Directory & Verification
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Review and approve registered importer and forwarder companies. Forwarders cannot submit quotes until verified.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6B7280]">
            {companies.length === 0 ? 'No companies have registered yet.' : 'No companies match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F7F8FA] text-[#6B7280] text-[11px] uppercase font-bold border-b border-[#F1F5F9]">
                  <th className="py-3.5 px-6">Company</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Country</th>
                  <th className="py-3.5 px-6">Completed Shipments</th>
                  <th className="py-3.5 px-6">Verification Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#EB5D0B]" />
                        <span className="font-bold text-[#111827] text-xs">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#F7F8FA] border border-[#E5E7EB] capitalize">
                        {c.company_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#374151]">{c.country}</td>
                    <td className="py-4 px-6 text-xs text-[#374151]">{c.completed_shipments}</td>
                    <td className="py-4 px-6">
                      <Badge variant={statusBadgeVariant(c.verification_status)}>
                        {c.verification_status === 'verified' && 'Verified'}
                        {c.verification_status === 'pending' && 'Pending Review'}
                        {c.verification_status === 'rejected' && 'Rejected'}
                        {c.verification_status === 'suspended' && 'Suspended'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {c.company_type === 'forwarder' && c.verification_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={actioningId === c.id}
                            onClick={() => handleVerify(c.id, 'verified')}
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={actioningId === c.id}
                            onClick={() => handleVerify(c.id, 'rejected')}
                            icon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {c.verification_status === 'verified' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={actioningId === c.id}
                          onClick={() => handleVerify(c.id, 'suspended')}
                          icon={<Ban className="w-3.5 h-3.5" />}
                        >
                          Suspend
                        </Button>
                      )}
                      {c.verification_status === 'suspended' && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={actioningId === c.id}
                          onClick={() => handleVerify(c.id, 'verified')}
                          icon={<ShieldCheck className="w-3.5 h-3.5" />}
                        >
                          Reinstate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
