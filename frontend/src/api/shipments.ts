import { apiClient, capitalizeStatus } from './client';
import { Shipment, Milestone } from '../types';

interface RawShipment {
  id: string;
  booking_id: string;
  booking_number: string;
  current_status: string;
  progress_pct: number;
  eta: string | null;
  vessel_name: string | null;
  voyage_number: string | null;
  container_number: string | null;
  origin_lat: string | null;
  origin_lng: string | null;
  dest_lat: string | null;
  dest_lng: string | null;
  current_lat: string | null;
  current_lng: string | null;
}

interface RawMilestone {
  id: string;
  sequence_no: number;
  title: string;
  location: string | null;
  completed: boolean;
  completed_at: string | null;
  is_current: boolean;
}

function toFrontendMilestone(m: RawMilestone): Milestone {
  return {
    id: m.id,
    title: m.title,
    location: m.location || '',
    timestamp: m.completed_at ? new Date(m.completed_at).toLocaleString() : 'Pending',
    completed: m.completed,
    isCurrent: m.is_current,
  };
}

function toFrontendShipment(s: RawShipment, milestones: RawMilestone[] = []): Shipment {
  return {
    id: s.id,
    bookingNumber: s.booking_number,
    rfqNumber: '', // not joined at this level; the booking detail call can add it if a screen needs it
    importerName: '',
    forwarderName: '',
    origin: '',
    originCoords: [Number(s.origin_lat) || 0, Number(s.origin_lng) || 0],
    destination: '',
    destCoords: [Number(s.dest_lat) || 0, Number(s.dest_lng) || 0],
    currentStatus: capitalizeStatus(s.current_status) as Shipment['currentStatus'],
    progressPct: s.progress_pct,
    eta: s.eta?.split('T')[0] || '',
    vesselName: s.vessel_name || '',
    voyageNumber: s.voyage_number || '',
    containerNumber: s.container_number || '',
    freightAmountUsd: 0, // comes from the booking, fetched alongside where needed
    milestones: milestones.map(toFrontendMilestone),
    routeCoords: [],
    currentCoords: [Number(s.current_lat) || 0, Number(s.current_lng) || 0],
  };
}

export const shipmentApi = {
  async list(): Promise<Shipment[]> {
    const { shipments } = await apiClient.get<{ shipments: RawShipment[] }>('/shipments');
    return shipments.map((s) => toFrontendShipment(s));
  },

  async get(id: string): Promise<Shipment> {
    const { shipment, milestones } = await apiClient.get<{ shipment: RawShipment; milestones: RawMilestone[] }>(
      `/shipments/${id}`
    );
    return toFrontendShipment(shipment, milestones);
  },

  async updateMilestone(shipmentId: string, milestoneId: string, completed: boolean) {
    return apiClient.patch(`/shipments/${shipmentId}/milestone/${milestoneId}`, { completed });
  },
};

export const bookingApi = {
  /** Accepts a quotation -> creates booking + shipment atomically server-side. */
  async acceptQuote(quotationId: string): Promise<{ bookingId: string; shipmentId: string }> {
    const result = await apiClient.post<{ booking: { id: string }; shipment: { id: string } }>(
      `/bookings/accept-quote/${quotationId}`
    );
    return { bookingId: result.booking.id, shipmentId: result.shipment.id };
  },
};
