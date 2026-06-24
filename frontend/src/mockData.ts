import { 
  User, 
  RFQ, 
  Quotation, 
  Shipment, 
  DocumentItem, 
  Message, 
  ForwarderCompany, 
  NotificationItem 
} from './types';

export const INITIAL_USERS: Record<string, User> = {
  importer: {
    id: 'usr_imp_01',
    name: 'Sithushana Fernando',
    email: 'sithushana@ceylonapparel.lk',
    companyName: 'Ceylon Global Exports & Imports Pvt Ltd',
    role: 'importer',
    verified: true,
    country: 'Sri Lanka',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  forwarder: {
    id: 'usr_fwd_01',
    name: 'Ruwan Silva',
    email: 'r.silva@oceanxforwarding.com',
    companyName: 'OceanX Global Forwarding (Colombo)',
    role: 'forwarder',
    verified: true,
    country: 'Sri Lanka',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    tier: 'Enterprise',
    rating: 4.9,
    responseTimeHrs: 1.2,
    completedShipments: 412
  },
  admin: {
    id: 'usr_adm_01',
    name: 'Aiden Vance',
    email: 'admin@thedreamv.com',
    companyName: 'TheDreamV Platform Command',
    role: 'admin',
    verified: true,
    country: 'Singapore',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  }
};

export const INITIAL_RFQS: RFQ[] = [
  {
    id: 'rfq_1001',
    rfqNumber: 'RFQ-2026-9041',
    importerId: 'usr_imp_01',
    importerName: 'Ceylon Global Exports & Imports',
    importerVerified: true,
    origin: 'Colombo Port, Sri Lanka',
    originCode: 'LKCMB',
    destination: 'Port of Rotterdam, Netherlands',
    destCode: 'NLRTM',
    incoterms: 'FOB',
    freightType: 'Ocean FCL',
    containerType: '40ft High Cube',
    commodity: 'Apparel & Readymade Garments (Boxed)',
    weightKg: 18500,
    volumeCbm: 68,
    cargoReadyDate: '2026-07-10',
    expiryDate: '2026-06-28',
    status: 'Active',
    responsesCount: 4,
    bestOfferUsd: 2850,
    remarks: 'Needs direct or fast 1-transshipment service. Temperature monitored not required but clean food-grade or garment containers requested.',
    documents: ['Commercial_Invoice_Draft.pdf', 'Packing_List_Summary.xlsx'],
    createdAt: '2026-06-22'
  },
  {
    id: 'rfq_1002',
    rfqNumber: 'RFQ-2026-9042',
    importerId: 'usr_imp_01',
    importerName: 'Ceylon Global Exports & Imports',
    importerVerified: true,
    origin: 'Colombo Port, Sri Lanka',
    originCode: 'LKCMB',
    destination: 'Port of Los Angeles, CA, USA',
    destCode: 'USLAX',
    incoterms: 'CIF',
    freightType: 'Ocean FCL',
    containerType: '40ft Standard',
    commodity: 'Ceylon Organic Tea & Spices',
    weightKg: 22000,
    volumeCbm: 60,
    cargoReadyDate: '2026-07-15',
    expiryDate: '2026-06-30',
    status: 'Active',
    responsesCount: 3,
    bestOfferUsd: 3420,
    remarks: 'Requires strict moisture protection liners. Customs documentation clearance support at LAX is preferred.',
    documents: ['Phytosanitary_Cert.pdf'],
    createdAt: '2026-06-23'
  },
  {
    id: 'rfq_1003',
    rfqNumber: 'RFQ-2026-8890',
    importerId: 'usr_imp_01',
    importerName: 'Ceylon Global Exports & Imports',
    importerVerified: true,
    origin: 'Katunayake Airport, Sri Lanka',
    originCode: 'CMB',
    destination: 'Frankfurt Airport, Germany',
    destCode: 'FRA',
    incoterms: 'EXW',
    freightType: 'Air Freight',
    containerType: 'Air Cargo (Kg)',
    commodity: 'Urgent Fashion Samples',
    weightKg: 450,
    volumeCbm: 2.8,
    cargoReadyDate: '2026-06-26',
    expiryDate: '2026-06-25',
    status: 'Quoted',
    responsesCount: 5,
    bestOfferUsd: 1950,
    remarks: 'Must arrive before retail buyer showcase on July 1st.',
    documents: [],
    createdAt: '2026-06-20'
  },
  {
    id: 'rfq_1004',
    rfqNumber: 'RFQ-2026-8512',
    importerId: 'usr_imp_01',
    importerName: 'Ceylon Global Exports & Imports',
    importerVerified: true,
    origin: 'Colombo Port, Sri Lanka',
    originCode: 'LKCMB',
    destination: 'Port of Jebel Ali, Dubai, UAE',
    destCode: 'AEDXB',
    incoterms: 'DDP',
    freightType: 'Ocean LCL',
    containerType: 'LCL (CBM)',
    commodity: 'Rubber Floor Tiles & Mats',
    weightKg: 3400,
    volumeCbm: 12,
    cargoReadyDate: '2026-06-15',
    expiryDate: '2026-06-18',
    status: 'Awarded',
    responsesCount: 6,
    bestOfferUsd: 890,
    remarks: 'Awarded to OceanX Forwarding.',
    documents: [],
    createdAt: '2026-06-10'
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'qte_501',
    quoteNumber: 'QTE-OX-991',
    rfqId: 'rfq_1001',
    rfqNumber: 'RFQ-2026-9041',
    forwarderId: 'usr_fwd_01',
    forwarderName: 'OceanX Global Forwarding',
    forwarderRating: 4.9,
    verifiedBadge: true,
    priceUsd: 2850,
    transitTimeDays: 22,
    validityDate: '2026-07-05',
    serviceType: 'Direct Vessel',
    chargesBreakdown: [
      { name: 'Ocean Freight (All-In)', amountUsd: 2350 },
      { name: 'Bunker Adjustment Factor (BAF)', amountUsd: 250 },
      { name: 'Terminal Handling Charge (THC)', amountUsd: 180 },
      { name: 'Export Documentation Fee', amountUsd: 70 }
    ],
    responseTimeHrs: 1.1,
    performanceScore: 98,
    status: 'Submitted',
    remarks: 'Direct sailings via CMA CGM. Guaranteed space allocation for early July departure.',
    submittedAt: '2026-06-22 14:20'
  },
  {
    id: 'qte_502',
    quoteNumber: 'QTE-APX-442',
    rfqId: 'rfq_1001',
    rfqNumber: 'RFQ-2026-9041',
    forwarderId: 'fwd_apex',
    forwarderName: 'Apex Maritime Logistics',
    forwarderRating: 4.7,
    verifiedBadge: true,
    priceUsd: 2980,
    transitTimeDays: 20,
    validityDate: '2026-07-02',
    serviceType: 'Direct Vessel',
    chargesBreakdown: [
      { name: 'Basic Ocean Freight', amountUsd: 2500 },
      { name: 'Origin THC', amountUsd: 200 },
      { name: 'Port Security & Seal Fee', amountUsd: 80 },
      { name: 'Documentation', amountUsd: 200 }
    ],
    responseTimeHrs: 2.4,
    performanceScore: 94,
    status: 'Submitted',
    remarks: 'Fastest transit time on this corridor via Maersk Line.',
    submittedAt: '2026-06-23 09:15'
  },
  {
    id: 'qte_503',
    quoteNumber: 'QTE-DHL-110',
    rfqId: 'rfq_1001',
    rfqNumber: 'RFQ-2026-9041',
    forwarderId: 'fwd_dhl',
    forwarderName: 'EuroAsia Cargo Network',
    forwarderRating: 4.6,
    verifiedBadge: false,
    priceUsd: 2790,
    transitTimeDays: 28,
    validityDate: '2026-06-30',
    serviceType: '1-Stop Transshipment',
    chargesBreakdown: [
      { name: 'Ocean Freight', amountUsd: 2300 },
      { name: 'THC Colombo + Salalah', amountUsd: 340 },
      { name: 'Carrier Docs', amountUsd: 150 }
    ],
    responseTimeHrs: 4.8,
    performanceScore: 89,
    status: 'Submitted',
    remarks: 'Transshipment at Port of Salalah.',
    submittedAt: '2026-06-23 16:40'
  },
  {
    id: 'qte_504',
    quoteNumber: 'QTE-OX-882',
    rfqId: 'rfq_1002',
    rfqNumber: 'RFQ-2026-9042',
    forwarderId: 'usr_fwd_01',
    forwarderName: 'OceanX Global Forwarding',
    forwarderRating: 4.9,
    verifiedBadge: true,
    priceUsd: 3420,
    transitTimeDays: 26,
    validityDate: '2026-07-08',
    serviceType: 'Direct Vessel',
    chargesBreakdown: [
      { name: 'Ocean Freight Transpacific', amountUsd: 2900 },
      { name: 'THC Origin & Dest', amountUsd: 380 },
      { name: 'AMS / ISF Filing', amountUsd: 140 }
    ],
    responseTimeHrs: 0.8,
    performanceScore: 99,
    status: 'Submitted',
    remarks: 'Includes automated ISF customs pre-filing into US LAX.',
    submittedAt: '2026-06-23 11:00'
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'shp_801',
    bookingNumber: 'BKG-DV-99401',
    rfqNumber: 'RFQ-2026-8512',
    importerName: 'Ceylon Global Exports & Imports',
    forwarderName: 'OceanX Global Forwarding',
    origin: 'Colombo Port (LKCMB)',
    originCoords: [6.9419, 79.8433],
    destination: 'Jebel Ali Port, Dubai (AEDXB)',
    destCoords: [25.0112, 55.0611],
    currentStatus: 'In Transit',
    progressPct: 65,
    eta: '2026-06-27 08:00 UTC',
    vesselName: 'EVER GIVEN VOY. 042W',
    voyageNumber: 'EG-042W',
    containerNumber: 'TGHU-882194-2',
    freightAmountUsd: 890,
    milestones: [
      { id: 'm1', title: 'Booking Confirmed & Escrow Secured', location: 'Colombo', timestamp: 'Jun 11, 09:30', completed: true },
      { id: 'm2', title: 'Container Picked Up & Gate-In', location: 'Colombo Port CICT', timestamp: 'Jun 14, 14:15', completed: true },
      { id: 'm3', title: 'Loaded on Vessel EVER GIVEN', location: 'Colombo Berth 4', timestamp: 'Jun 16, 22:00', completed: true },
      { id: 'm4', title: 'Vessel Departed Origin Port', location: 'Indian Ocean', timestamp: 'Jun 17, 04:30', completed: true },
      { id: 'm5', title: 'Approaching Arabian Sea Waypoint', location: 'Arabian Sea (Current)', timestamp: 'Jun 24, 03:00', completed: true, isCurrent: true },
      { id: 'm6', title: 'Arrival at Jebel Ali Terminal', location: 'Dubai Port', timestamp: 'Est. Jun 27', completed: false },
      { id: 'm7', title: 'Customs Cleared & Delivered', location: 'Dubai Buyer Warehousing', timestamp: 'Est. Jun 28', completed: false }
    ],
    routeCoords: [
      [6.9419, 79.8433],
      [8.5, 76.0],
      [12.0, 68.0],
      [18.0, 60.0],
      [22.5, 59.5],
      [25.0112, 55.0611]
    ],
    currentCoords: [18.0, 60.0]
  },
  {
    id: 'shp_802',
    bookingNumber: 'BKG-DV-98110',
    rfqNumber: 'RFQ-2026-8104',
    importerName: 'Ceylon Global Exports & Imports',
    forwarderName: 'Apex Maritime Logistics',
    origin: 'Colombo Port (LKCMB)',
    originCoords: [6.9419, 79.8433],
    destination: 'Port of Hamburg, Germany (DEHAM)',
    destCoords: [53.5511, 9.9937],
    currentStatus: 'Loaded on Vessel',
    progressPct: 25,
    eta: '2026-07-14 16:00 UTC',
    vesselName: 'CMA CGM ANTOINE DE SAINT EXUPERY',
    voyageNumber: 'CMA-991N',
    containerNumber: 'MSKU-410924-0',
    freightAmountUsd: 3150,
    milestones: [
      { id: 'm1', title: 'Marketplace Booking Verified', location: 'Colombo', timestamp: 'Jun 18, 11:00', completed: true },
      { id: 'm2', title: 'Gate-In & Customs Export Clearance', location: 'Colombo SAGT Terminal', timestamp: 'Jun 21, 15:45', completed: true },
      { id: 'm3', title: 'Vessel Departed Colombo', location: 'Colombo Port', timestamp: 'Jun 23, 19:30', completed: true, isCurrent: true },
      { id: 'm4', title: 'Suez Canal Transit', location: 'Port Said', timestamp: 'Est. Jul 02', completed: false },
      { id: 'm5', title: 'Arrival at Port of Hamburg', location: 'Hamburg Container Terminal', timestamp: 'Est. Jul 14', completed: false }
    ],
    routeCoords: [
      [6.9419, 79.8433],
      [12.5, 50.0],
      [27.0, 34.0],
      [31.2, 32.3],
      [37.0, 15.0],
      [48.0, -6.0],
      [53.5511, 9.9937]
    ],
    currentCoords: [12.5, 50.0]
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  { id: 'doc_1', shipmentId: 'shp_801', title: 'Commercial Invoice #CI-99401.pdf', category: 'Commercial Invoice', fileSize: '1.4 MB', uploadedBy: 'Sithushana Fernando (Importer)', uploadedAt: 'Jun 12, 2026', status: 'Verified' },
  { id: 'doc_2', shipmentId: 'shp_801', title: 'Packing List Detailed.xlsx', category: 'Packing List', fileSize: '640 KB', uploadedBy: 'Sithushana Fernando (Importer)', uploadedAt: 'Jun 12, 2026', status: 'Verified' },
  { id: 'doc_3', shipmentId: 'shp_801', title: 'Original Ocean Bill of Lading (OBL).pdf', category: 'Bill of Lading', fileSize: '2.8 MB', uploadedBy: 'Ruwan Silva (Forwarder)', uploadedAt: 'Jun 16, 2026', status: 'Verified' },
  { id: 'doc_4', shipmentId: 'shp_801', title: 'Marine Cargo Insurance Policy #MCI-22.pdf', category: 'Insurance Certificate', fileSize: '1.1 MB', uploadedBy: 'Ruwan Silva (Forwarder)', uploadedAt: 'Jun 13, 2026', status: 'Verified' },
  { id: 'doc_5', shipmentId: 'shp_802', title: 'Export Customs Declaration Form C.pdf', category: 'Customs Declaration', fileSize: '1.9 MB', uploadedBy: 'Apex Logistics Team', uploadedAt: 'Jun 21, 2026', status: 'Pending Review' }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_01',
    senderId: 'usr_fwd_01',
    senderName: 'Ruwan Silva (OceanX Forwarding)',
    senderRole: 'forwarder',
    recipientId: 'usr_imp_01',
    rfqNumber: 'RFQ-2026-9041',
    text: 'Hello Sithushana, we submitted our quotation ($2,850 all-in) for the Colombo-Rotterdam lane. We have confirmed space on the CMA CGM vessel departing July 11th. Let me know if you need temperature recorders added.',
    timestamp: 'Yesterday at 2:35 PM',
    unread: false
  },
  {
    id: 'msg_02',
    senderId: 'usr_imp_01',
    senderName: 'Sithushana Fernando',
    senderRole: 'importer',
    recipientId: 'usr_fwd_01',
    rfqNumber: 'RFQ-2026-9041',
    text: 'Thank you Ruwan. That transit time looks very solid. Can we extend the free demurrage days at Rotterdam from 7 days to 14 days?',
    timestamp: 'Yesterday at 4:10 PM',
    unread: false
  },
  {
    id: 'msg_03',
    senderId: 'usr_fwd_01',
    senderName: 'Ruwan Silva (OceanX Forwarding)',
    senderRole: 'forwarder',
    recipientId: 'usr_imp_01',
    rfqNumber: 'RFQ-2026-9041',
    text: 'Yes, we can confirm 14 days combined detention & demurrage at Rotterdam port included at no extra cost. I have updated the quote validity.',
    timestamp: 'Today at 9:15 AM',
    unread: true
  },
  {
    id: 'msg_warn',
    senderId: 'system',
    senderName: 'Marketplace Compliance Guard',
    senderRole: 'admin',
    recipientId: 'all',
    text: '⚠️ MARKETPLACE POLICY NOTICE: Direct phone numbers, emails, WhatsApp links, or off-platform payment solicitations are automatically redacted by our AI trust filter. All bookings and escrow transactions must remain inside TheDreamV platform for verified cargo guarantee.',
    timestamp: 'System Persistent Notice',
    unread: false,
    isPolicyWarning: true
  }
];

export const INITIAL_FORWARDERS: ForwarderCompany[] = [
  {
    id: 'usr_fwd_01',
    companyName: 'OceanX Global Forwarding',
    country: 'Sri Lanka / UAE',
    verifiedBadge: true,
    tier: 'Enterprise',
    rating: 4.9,
    reviewsCount: 184,
    responseTimeHrs: 1.2,
    conversionRatePct: 42.5,
    lanes: ['Colombo - Rotterdam', 'Colombo - Dubai', 'Colombo - US LAX', 'Asia - Europe'],
    status: 'Active'
  },
  {
    id: 'fwd_apex',
    companyName: 'Apex Maritime Logistics',
    country: 'Singapore',
    verifiedBadge: true,
    tier: 'Professional',
    rating: 4.7,
    reviewsCount: 112,
    responseTimeHrs: 2.1,
    conversionRatePct: 36.0,
    lanes: ['Transpacific Eastbound', 'Colombo - Hamburg', 'Intra-Asia Express'],
    status: 'Active'
  },
  {
    id: 'fwd_kuehne',
    companyName: 'K+N Freight Ceylon Ltd',
    country: 'Switzerland / Sri Lanka',
    verifiedBadge: true,
    tier: 'Enterprise',
    rating: 4.8,
    reviewsCount: 290,
    responseTimeHrs: 1.8,
    conversionRatePct: 45.0,
    lanes: ['Global Ocean FCL', 'Air Cargo Charter', 'Europe Inland'],
    status: 'Active'
  },
  {
    id: 'fwd_dhl',
    companyName: 'EuroAsia Cargo Network',
    country: 'Germany',
    verifiedBadge: false,
    tier: 'Free',
    rating: 4.5,
    reviewsCount: 38,
    responseTimeHrs: 5.4,
    conversionRatePct: 18.2,
    lanes: ['LCL Consolidation Asia-Europe'],
    status: 'Pending Review'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'New Quotation Received ($2,850)',
    description: 'OceanX Forwarding submitted an offer for RFQ-2026-9041 (Colombo to Rotterdam).',
    time: '12 mins ago',
    unread: true,
    type: 'quote'
  },
  {
    id: 'notif_2',
    title: 'Shipment Milestone Reached',
    description: 'BKG-DV-99401 container EVER GIVEN is approaching Arabian Sea Waypoint.',
    time: '3 hours ago',
    unread: true,
    type: 'shipment'
  },
  {
    id: 'notif_3',
    title: 'Escrow Security Guarantee Active',
    description: 'Payment funds for BKG-DV-99401 are securely locked in Standard Chartered Escrow.',
    time: '1 day ago',
    unread: false,
    type: 'system'
  }
];
