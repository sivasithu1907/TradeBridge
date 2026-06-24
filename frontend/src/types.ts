export type UserRole = 'public' | 'importer' | 'forwarder' | 'admin';

export type Incoterm = 'FOB' | 'EXW' | 'CIF' | 'DDP' | 'FCA' | 'CPT';

export type FreightType = 'Ocean FCL' | 'Ocean LCL' | 'Air Freight';

export type ContainerType = 
  | '20ft Standard' 
  | '40ft Standard' 
  | '40ft High Cube' 
  | 'Reefer 40ft' 
  | 'LCL (CBM)' 
  | 'Air Cargo (Kg)';

export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: UserRole;
  verified: boolean;
  country: string;
  avatar: string;
  tier?: 'Free' | 'Professional' | 'Enterprise';
  rating?: number;
  responseTimeHrs?: number;
  completedShipments?: number;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  importerId: string;
  importerName: string;
  importerVerified: boolean;
  origin: string;
  originCode: string;
  destination: string;
  destCode: string;
  incoterms: Incoterm;
  freightType: FreightType;
  containerType: ContainerType;
  commodity: string;
  weightKg: number;
  volumeCbm: number;
  cargoReadyDate: string;
  expiryDate: string;
  status: 'Active' | 'Quoted' | 'Awarded' | 'Expired';
  responsesCount: number;
  bestOfferUsd?: number;
  remarks: string;
  documents: string[];
  createdAt: string;
}

export interface ChargeItem {
  name: string;
  amountUsd: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  rfqId: string;
  rfqNumber: string;
  forwarderId: string;
  forwarderName: string;
  forwarderRating: number;
  verifiedBadge: boolean;
  priceUsd: number;
  transitTimeDays: number;
  validityDate: string;
  serviceType: 'Direct Vessel' | '1-Stop Transshipment' | 'Priority Air' | 'Economy Air';
  chargesBreakdown: ChargeItem[];
  responseTimeHrs: number;
  performanceScore: number;
  status: 'Submitted' | 'Accepted' | 'Rejected' | 'Expired';
  remarks: string;
  submittedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  isCurrent?: boolean;
}

export interface Shipment {
  id: string;
  bookingNumber: string;
  rfqNumber: string;
  importerName: string;
  forwarderName: string;
  origin: string;
  originCoords: [number, number];
  destination: string;
  destCoords: [number, number];
  currentStatus: 'Booking Confirmed' | 'Container Picked Up' | 'Loaded on Vessel' | 'In Transit' | 'Customs Clearance' | 'Out for Delivery' | 'Delivered';
  progressPct: number;
  eta: string;
  vesselName: string;
  voyageNumber: string;
  containerNumber: string;
  freightAmountUsd: number;
  milestones: Milestone[];
  routeCoords: [number, number][];
  currentCoords: [number, number];
}

export interface DocumentItem {
  id: string;
  shipmentId: string;
  title: string;
  category: 'Commercial Invoice' | 'Packing List' | 'Bill of Lading' | 'Customs Declaration' | 'Insurance Certificate' | 'Delivery Receipt';
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Verified' | 'Pending Review';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  rfqNumber?: string;
  text: string;
  timestamp: string;
  unread: boolean;
  isPolicyWarning?: boolean;
}

export interface ForwarderCompany {
  id: string;
  companyName: string;
  country: string;
  verifiedBadge: boolean;
  tier: 'Free' | 'Professional' | 'Enterprise';
  rating: number;
  reviewsCount: number;
  responseTimeHrs: number;
  conversionRatePct: number;
  lanes: string[];
  status: 'Active' | 'Pending Review' | 'Suspended';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'rfq' | 'quote' | 'shipment' | 'system';
}

export type ActiveScreen =
  | 'landing'
  | 'login'
  | 'register'
  | 'importer-dash'
  | 'rfq-create'
  | 'rfq-list'
  | 'quote-compare'
  | 'shipment-tracking'
  | 'docs-center'
  | 'messages'
  | 'analytics'
  | 'forwarder-dash'
  | 'forwarder-rfqs'
  | 'forwarder-shipments'
  | 'admin-dash'
  | 'admin-users'
  | 'admin-market'
  | 'subscriptions'
  | 'settings'
  | 'design-system';
