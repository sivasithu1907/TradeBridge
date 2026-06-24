import { apiClient, capitalizeStatus } from './client';
import { Quotation } from '../types';

interface RawQuotation {
  id: string;
  quote_number: string;
  rfq_id: string;
  forwarder_company_id: string;
  forwarder_name?: string;
  rating_avg?: string | null;
  forwarder_verified?: boolean;
  price_usd: string;
  transit_time_days: number;
  validity_date: string;
  response_time_hrs: string;
  notes: string | null;
  status: string;
  performance_score: number | null;
  submitted_at: string;
}

function toFrontendQuotation(q: RawQuotation, rfqNumber = ''): Quotation {
  return {
    id: q.id,
    quoteNumber: q.quote_number,
    rfqId: q.rfq_id,
    rfqNumber,
    forwarderId: q.forwarder_company_id,
    forwarderName: q.forwarder_name || '',
    forwarderRating: q.rating_avg ? Number(q.rating_avg) : 0,
    verifiedBadge: !!q.forwarder_verified,
    priceUsd: Number(q.price_usd),
    transitTimeDays: q.transit_time_days,
    validityDate: q.validity_date?.split('T')[0],
    // Not yet a real backend field -- service type was cosmetic detail in
    // the prototype's mock data. Default until forwarders can select a
    // real service tier when submitting a quote.
    serviceType: 'Direct Vessel',
    chargesBreakdown: [],
    responseTimeHrs: Number(q.response_time_hrs),
    performanceScore: q.performance_score ?? 0,
    status: capitalizeStatus(q.status) as Quotation['status'],
    remarks: q.notes || '',
    submittedAt: q.submitted_at,
  };
}

export const quotationApi = {
  async listForRfq(rfqId: string, rfqNumber = ''): Promise<Quotation[]> {
    const { quotations } = await apiClient.get<{ quotations: RawQuotation[] }>(`/quotations/rfq/${rfqId}`);
    return quotations.map((q) => toFrontendQuotation(q, rfqNumber));
  },

  async submit(data: {
    rfqId: string;
    priceUsd: number;
    transitTimeDays: number;
    validityDate: string;
    notes?: string;
  }): Promise<Quotation> {
    const { quotation } = await apiClient.post<{ quotation: RawQuotation }>('/quotations', data);
    return toFrontendQuotation(quotation);
  },

  async withdraw(quoteId: string): Promise<void> {
    await apiClient.post(`/quotations/${quoteId}/withdraw`);
  },
};
