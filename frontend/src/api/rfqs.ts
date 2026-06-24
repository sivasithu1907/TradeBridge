import { apiClient, capitalizeStatus } from './client';
import { RFQ, Incoterm, FreightType, ContainerType } from '../types';

// Raw shape returned by the backend (snake_case, per schema.sql)
interface RawRfq {
  id: string;
  rfq_number: string;
  importer_company_id: string;
  origin: string;
  origin_code: string;
  destination: string;
  dest_code: string;
  incoterms: string;
  freight_type: string;
  container_type: string;
  commodity: string;
  weight_kg: string;
  volume_cbm: string | null;
  cargo_ready_date: string;
  expiry_date: string;
  status: string;
  responses_count: number;
  best_offer_usd: string | null;
  remarks: string | null;
  created_at: string;
}

function toFrontendRfq(r: RawRfq): RFQ {
  return {
    id: r.id,
    rfqNumber: r.rfq_number,
    importerId: r.importer_company_id,
    importerName: '', // company name isn't joined into base RFQ rows; fetched separately where the UI needs it
    importerVerified: true,
    origin: r.origin,
    originCode: r.origin_code,
    destination: r.destination,
    destCode: r.dest_code,
    incoterms: r.incoterms as Incoterm,
    freightType: r.freight_type as FreightType,
    containerType: r.container_type as ContainerType,
    commodity: r.commodity,
    weightKg: Number(r.weight_kg),
    volumeCbm: r.volume_cbm ? Number(r.volume_cbm) : 0,
    cargoReadyDate: r.cargo_ready_date?.split('T')[0],
    expiryDate: r.expiry_date?.split('T')[0],
    // Backend stores lowercase ('active'|'quoted'|'awarded'|'expired'|'cancelled');
    // frontend expects capitalized ('Active'|'Quoted'|'Awarded'|'Expired').
    // 'cancelled' has no frontend equivalent yet -- maps to 'Expired' as the
    // closest existing terminal state until the UI grows a Cancelled badge.
    status: (r.status === 'cancelled' ? 'Expired' : capitalizeStatus(r.status)) as RFQ['status'],
    responsesCount: r.responses_count,
    bestOfferUsd: r.best_offer_usd ? Number(r.best_offer_usd) : undefined,
    remarks: r.remarks || '',
    documents: [],
    createdAt: r.created_at?.split('T')[0],
  };
}

export const rfqApi = {
  async list(): Promise<RFQ[]> {
    const { rfqs } = await apiClient.get<{ rfqs: RawRfq[] }>('/rfqs');
    return rfqs.map(toFrontendRfq);
  },

  async get(id: string): Promise<RFQ> {
    const { rfq } = await apiClient.get<{ rfq: RawRfq }>(`/rfqs/${id}`);
    return toFrontendRfq(rfq);
  },

  async create(data: {
    origin: string;
    originCode: string;
    destination: string;
    destCode: string;
    incoterms: Incoterm;
    freightType: FreightType;
    containerType: ContainerType;
    commodity: string;
    weightKg: number;
    volumeCbm?: number;
    cargoReadyDate: string;
    expiryDate: string;
    remarks?: string;
  }): Promise<RFQ> {
    const { rfq } = await apiClient.post<{ rfq: RawRfq }>('/rfqs', data);
    return toFrontendRfq(rfq);
  },
};
