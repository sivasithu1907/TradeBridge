import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  User,
  RFQ,
  Quotation,
  Shipment,
  ForwarderCompany,
  NotificationItem,
  ActiveScreen,
  Incoterm,
  FreightType,
  ContainerType,
} from '../types';
import { authApi } from '../api/auth';
import { rfqApi } from '../api/rfqs';
import { quotationApi } from '../api/quotations';
import { shipmentApi, bookingApi } from '../api/shipments';
import { notificationApi } from '../api/notifications';
import { messageApi } from '../api/messages';
import { ApiError } from '../api/client';

interface MarketplaceContextType {
  activeRole: UserRole;
  currentUser: User;
  activeScreen: ActiveScreen;
  rfqs: RFQ[];
  quotations: Quotation[];
  shipments: Shipment[];
  forwarders: ForwarderCompany[];
  notifications: NotificationItem[];
  unreadMessageCount: number;
  searchQuery: string;
  selectedRfqId: string | null;
  selectedShipmentId: string | null;
  isLoading: boolean;
  authError: string | null;

  // Real auth -- replaces the prototype's fake switchRole()
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    companyType: 'importer' | 'forwarder';
    companyName: string;
    country: string;
    fullName: string;
    email: string;
    password: string;
  }) => Promise<{ message: string }>;
  logout: () => Promise<void>;

  /** @deprecated kept only so any not-yet-updated component doesn't crash;
   *  logs a warning and does nothing. Use login()/logout() instead. */
  switchRole: (role: UserRole) => void;

  setActiveScreen: (screen: ActiveScreen) => void;
  setSearchQuery: (query: string) => void;
  setSelectedRfqId: (id: string | null) => void;
  setSelectedShipmentId: (id: string | null) => void;
  refreshRfqs: () => Promise<void>;
  createRfq: (newRfq: {
    origin: string; originCode: string; destination: string; destCode: string;
    incoterms: Incoterm; freightType: FreightType; containerType: ContainerType;
    commodity: string; weightKg: number; volumeCbm?: number;
    cargoReadyDate: string; expiryDate: string; remarks?: string;
  }) => Promise<void>;
  submitQuote: (newQuote: {
    rfqId: string; priceUsd: number; transitTimeDays: number; validityDate: string; notes?: string;
  }) => Promise<void>;
  acceptQuote: (quoteId: string) => Promise<void>;
  verifyForwarder: (forwarderId: string, status: 'Active' | 'Suspended') => void;
  resetAllData: () => void;
  markNotificationsRead: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const GUEST_USER: User = {
  id: 'public', name: 'Guest Visitor', email: '', companyName: 'Visiting Marketplace',
  role: 'public', verified: false, country: 'Global', avatar: '',
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(GUEST_USER);
  const [activeScreen, setActiveScreenState] = useState<ActiveScreen>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  // Forwarder directory isn't wired to a real endpoint yet -- kept as an
  // empty array (not mock data) so empty states render correctly.
  const [forwarders, setForwarders] = useState<ForwarderCompany[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const activeRole = currentUser.role;

  // --- Session check on load: is there already a valid cookie? ---
  useEffect(() => {
    (async () => {
      const user = await authApi.getSession();
      if (user) {
        setCurrentUser(user);
        setActiveScreenState(
          user.role === 'importer' ? 'importer-dash' :
          user.role === 'forwarder' ? 'forwarder-dash' :
          user.role === 'admin' ? 'admin-dash' : 'landing'
        );
      }
      setIsLoading(false);
    })();
  }, []);

  // --- Load RFQs / shipments whenever we have an authenticated user ---
  const refreshRfqs = useCallback(async () => {
    if (activeRole === 'public') return;
    try {
      const data = await rfqApi.list();
      setRfqs(data);
    } catch (err) {
      console.error('Failed to load RFQs', err);
    }
  }, [activeRole]);

  const refreshShipments = useCallback(async () => {
    if (activeRole === 'public') return;
    try {
      const data = await shipmentApi.list();
      setShipments(data);
    } catch (err) {
      console.error('Failed to load shipments', err);
    }
  }, [activeRole]);

  const refreshNotifications = useCallback(async () => {
    if (activeRole === 'public') return;
    try {
      const data = await notificationApi.list();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, [activeRole]);

  const refreshUnreadMessageCount = useCallback(async () => {
    if (activeRole === 'public') return;
    try {
      const threads = await messageApi.listThreads();
      setUnreadMessageCount(threads.reduce((sum, t) => sum + t.unreadCount, 0));
    } catch (err) {
      console.error('Failed to load message threads', err);
    }
  }, [activeRole]);

  useEffect(() => {
    if (activeRole !== 'public') {
      refreshRfqs();
      refreshShipments();
      refreshNotifications();
      refreshUnreadMessageCount();
    }
  }, [activeRole, refreshRfqs, refreshShipments, refreshNotifications, refreshUnreadMessageCount]);

  const setActiveScreen = (screen: ActiveScreen) => {
    setActiveScreenState(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Real auth actions ---
  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const user = await authApi.login(email, password);
      setCurrentUser(user);
      setActiveScreen(
        user.role === 'importer' ? 'importer-dash' :
        user.role === 'forwarder' ? 'forwarder-dash' :
        user.role === 'admin' ? 'admin-dash' : 'landing'
      );
    } catch (err) {
      setAuthError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
      throw err;
    }
  };

  const register: MarketplaceContextType['register'] = async (data) => {
    setAuthError(null);
    try {
      return await authApi.register(data);
    } catch (err) {
      setAuthError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.');
      throw err;
    }
  };

  const logout = async () => {
    await authApi.logout();
    setCurrentUser(GUEST_USER);
    setRfqs([]); setQuotations([]); setShipments([]); setNotifications([]); setUnreadMessageCount(0);
    setActiveScreen('landing');
  };

  /** @deprecated no-op retained for safety; real role changes only happen via login(). */
  const switchRole = (role: UserRole) => {
    console.warn(
      `switchRole('${role}') was called but no longer changes identity -- it did nothing. ` +
      `This was the prototype's fake auth shortcut; use login()/logout() instead.`
    );
  };

  // --- Marketplace actions, now real network calls instead of setState ---

  const createRfq: MarketplaceContextType['createRfq'] = async (data) => {
    const newRfq = await rfqApi.create(data);
    setRfqs((prev) => [newRfq, ...prev]);
    setSelectedRfqId(newRfq.id);
    setActiveScreen('rfq-list');
  };

  const submitQuote: MarketplaceContextType['submitQuote'] = async (data) => {
    await quotationApi.submit(data);
    await refreshRfqs(); // responsesCount / bestOfferUsd changed server-side
    setActiveScreen('forwarder-dash');
  };

  const acceptQuote = async (quoteId: string) => {
    const { shipmentId } = await bookingApi.acceptQuote(quoteId);
    await refreshRfqs();
    await refreshShipments();
    setSelectedShipmentId(shipmentId);
    setActiveScreen('shipment-tracking');
  };

  // --- Not yet wired to real endpoints (see note below) ---
  const verifyForwarder = (forwarderId: string, status: 'Active' | 'Suspended') => {
    console.warn('verifyForwarder: admin UI is not yet wired to the real /api/admin/companies/:id/verify endpoint.');
  };
  const resetAllData = () => {
    console.warn('resetAllData: no longer applicable -- this was a local-storage-only reset for the prototype.');
  };
  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    notificationApi.markAllRead().catch((err) => console.error('Failed to mark notifications read', err));
  };

  return (
    <MarketplaceContext.Provider
      value={{
        activeRole,
        currentUser,
        activeScreen,
        rfqs,
        quotations,
        shipments,
        forwarders,
        notifications,
        unreadMessageCount,
        searchQuery,
        selectedRfqId,
        selectedShipmentId,
        isLoading,
        authError,
        login,
        register,
        logout,
        switchRole,
        setActiveScreen,
        setSearchQuery,
        setSelectedRfqId,
        setSelectedShipmentId,
        refreshRfqs,
        createRfq,
        submitQuote,
        acceptQuote,
        verifyForwarder,
        resetAllData,
        markNotificationsRead,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) throw new Error('useMarketplace must be used within MarketplaceProvider');
  return context;
};

/**
 * WHAT'S WIRED TO THE REAL BACKEND (tested end-to-end over HTTP, not just written):
 *   - Session restore on load, login, register, logout (real auth)
 *   - RFQ list + create
 *   - Quotation submit, live admin-verification gating for forwarders
 *   - Accept-quote -> booking + shipment (atomic, server-side)
 *   - Shipment list + detail + milestone updates
 *   - Notifications: real fetch + mark-all-read
 *   - Messaging: DocumentsCenter and MessagingCenter call their own
 *     dedicated API modules (api/documents.ts, api/messages.ts) directly
 *     rather than going through context -- the context only exposes the
 *     aggregate unreadMessageCount used for the sidebar badge
 *   - Admin company verification (UserManagement.tsx, AdminDashboard.tsx,
 *     MarketplaceManagement.tsx all call adminApi directly)
 *   - Document upload/list/download (DocumentsCenter.tsx calls
 *     api/documents.ts directly)
 *
 * WHAT'S STILL NOT WIRED:
 *   - Subscriptions/billing (intentionally deferred -- no payment
 *     processor integrated yet)
 *   - Forwarder directory (the `forwarders` array) has no backing
 *     endpoint yet
 *   - resetAllData is a no-op (was a localStorage-only reset for the
 *     prototype; no longer meaningful once data lives in a real database)
 */
