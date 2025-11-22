import { supabase } from '@/clients/supabase';
import {
  fetchWarrantyClaims,
  submitWarrantyClaim,
  fetchEligibleAccounts,
  fetchWarrantyStats,
  fetchClaimById,
  type SubmitClaimData,
  type WarrantyClaimDB,
  type EligibleAccount,
} from '@/features/member-area/services/warranty.service';

// Mock Supabase client
jest.mock('@/clients/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock error handler
jest.mock('@/utils/supabaseErrorHandler', () => ({
  handleSupabaseOperation: jest.fn(async (fn) => {
    const result = await fn();
    if (result.error) throw result.error;
    return result.data;
  }),
  handleSupabaseMutation: jest.fn(async (fn) => {
    const result = await fn();
    if (result.error) throw result.error;
    return result.data;
  }),
}));

describe('Warranty Service', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockClaim: WarrantyClaimDB = {
    id: 'claim-123',
    user_id: 'user-123',
    purchase_id: 'purchase-123',
    claim_type: 'warranty',
    reason: 'account_suspended',
    evidence_urls: ['https://example.com/screenshot.png'],
    status: 'pending',
    admin_notes: null,
    resolution_details: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    resolved_at: null,
    purchase: {
      id: 'purchase-123',
      product_id: 'product-123',
      product_name: 'Test Product',
      product_type: 'BM Account',
      category: 'business',
      account_details: { username: 'test' },
      warranty_expires_at: '2025-01-01T00:00:00Z',
      status: 'active',
      product: {
        id: 'product-123',
        product_name: 'Test Product',
        product_type: 'BM Account',
        category: 'business',
      },
    },
  };

  const mockPurchase = {
    id: 'purchase-123',
    user_id: 'user-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    product_type: 'BM Account',
    category: 'business',
    transaction_id: 'txn-123',
    status: 'active',
    account_details: { username: 'test' },
    warranty_expires_at: '2025-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    product: {
      id: 'product-123',
      product_name: 'Test Product',
      product_type: 'BM Account',
      category: 'business',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchWarrantyClaims', () => {
    it('should fetch warranty claims successfully', async () => {
      // Mock auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock query chain
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [mockClaim],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await fetchWarrantyClaims();

      expect(result).toEqual({
        claims: [mockClaim],
        total: 1,
      });
      expect(supabase.from).toHaveBeenCalledWith('warranty_claims');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    it('should throw error when not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(fetchWarrantyClaims()).rejects.toThrow('Not authenticated');
    });

    it('should handle empty claims list', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await fetchWarrantyClaims();

      expect(result).toEqual({
        claims: [],
        total: 0,
      });
    });
  });

  describe('submitWarrantyClaim', () => {
    const claimData: SubmitClaimData = {
      accountId: 'purchase-123',
      reason: 'account_suspended',
      description: 'Account was suspended',
      screenshotUrls: ['https://example.com/screenshot.png'],
    };

    it('should submit warranty claim successfully', async () => {
      // Mock auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock purchase validation query
      const mockPurchaseSelect = jest.fn().mockReturnThis();
      const mockPurchaseEq1 = jest.fn().mockReturnThis();
      const mockPurchaseEq2 = jest.fn().mockReturnThis();
      const mockPurchaseSingle = jest.fn().mockResolvedValue({
        data: mockPurchase,
        error: null,
      });

      // Mock existing claim check
      const mockClaimSelect = jest.fn().mockReturnThis();
      const mockClaimEq = jest.fn().mockReturnThis();
      const mockClaimIn = jest.fn().mockReturnThis();
      const mockClaimMaybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock insert query
      const mockInsert = jest.fn().mockReturnThis();
      const mockInsertSelect = jest.fn().mockReturnThis();
      const mockInsertSingle = jest.fn().mockResolvedValue({
        data: mockClaim,
        error: null,
      });

      // Setup from mock to return different chains based on table
      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1) {
          // First call: purchase validation
          return {
            select: mockPurchaseSelect,
          };
        } else if (callCount === 2) {
          // Second call: existing claim check
          return {
            select: mockClaimSelect,
          };
        } else {
          // Third call: insert
          return {
            insert: mockInsert,
          };
        }
      });

      mockPurchaseSelect.mockReturnValue({
        eq: mockPurchaseEq1,
      });
      mockPurchaseEq1.mockReturnValue({
        eq: mockPurchaseEq2,
      });
      mockPurchaseEq2.mockReturnValue({
        single: mockPurchaseSingle,
      });

      // Ensure mockPurchase has warranty_expires_at
      const purchaseWithWarranty = {
        ...mockPurchase,
        warranty_expires_at: '2025-12-31T23:59:59Z', // Future date
      };
      mockPurchaseSingle.mockResolvedValue({
        data: purchaseWithWarranty,
        error: null,
      });

      mockClaimSelect.mockReturnValue({
        eq: mockClaimEq,
      });
      mockClaimEq.mockReturnValue({
        in: mockClaimIn,
      });
      mockClaimIn.mockReturnValue({
        maybeSingle: mockClaimMaybeSingle,
      });

      mockInsert.mockReturnValue({
        select: mockInsertSelect,
      });
      mockInsertSelect.mockReturnValue({
        single: mockInsertSingle,
      });

      const result = await submitWarrantyClaim(claimData);

      expect(result).toEqual(mockClaim);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        purchase_id: claimData.accountId,
        claim_type: 'warranty',
        reason: claimData.reason,
        evidence_urls: claimData.screenshotUrls,
        status: 'pending',
      });
    });

    it('should throw error when warranty has expired', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const expiredPurchase = {
        ...mockPurchase,
        warranty_expires_at: '2020-01-01T00:00:00Z', // Expired
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq1 = jest.fn().mockReturnThis();
      const mockEq2 = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: expiredPurchase,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq1,
      });
      mockEq1.mockReturnValue({
        eq: mockEq2,
      });
      mockEq2.mockReturnValue({
        single: mockSingle,
      });

      await expect(submitWarrantyClaim(claimData)).rejects.toThrow(
        'Warranty has expired for this purchase'
      );
    });

    it('should throw error when purchase has no warranty', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const noWarrantyPurchase = {
        ...mockPurchase,
        warranty_expires_at: null,
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq1 = jest.fn().mockReturnThis();
      const mockEq2 = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: noWarrantyPurchase,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq1,
      });
      mockEq1.mockReturnValue({
        eq: mockEq2,
      });
      mockEq2.mockReturnValue({
        single: mockSingle,
      });

      await expect(submitWarrantyClaim(claimData)).rejects.toThrow(
        'This purchase does not have warranty coverage'
      );
    });

    it('should throw error when claim already exists', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock purchase validation with future warranty date
      const purchaseWithFutureWarranty = {
        ...mockPurchase,
        warranty_expires_at: '2025-12-31T23:59:59Z',
      };

      const mockPurchaseSelect = jest.fn().mockReturnThis();
      const mockPurchaseEq1 = jest.fn().mockReturnThis();
      const mockPurchaseEq2 = jest.fn().mockReturnThis();
      const mockPurchaseSingle = jest.fn().mockResolvedValue({
        data: purchaseWithFutureWarranty,
        error: null,
      });

      // Mock existing claim check - claim exists
      const mockClaimSelect = jest.fn().mockReturnThis();
      const mockClaimEq = jest.fn().mockReturnThis();
      const mockClaimIn = jest.fn().mockReturnThis();
      const mockClaimMaybeSingle = jest.fn().mockResolvedValue({
        data: { id: 'existing-claim', status: 'pending' },
        error: null,
      });

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1) {
          return { select: mockPurchaseSelect };
        } else {
          return { select: mockClaimSelect };
        }
      });

      mockPurchaseSelect.mockReturnValue({ eq: mockPurchaseEq1 });
      mockPurchaseEq1.mockReturnValue({ eq: mockPurchaseEq2 });
      mockPurchaseEq2.mockReturnValue({ single: mockPurchaseSingle });

      mockClaimSelect.mockReturnValue({ eq: mockClaimEq });
      mockClaimEq.mockReturnValue({ in: mockClaimIn });
      mockClaimIn.mockReturnValue({ maybeSingle: mockClaimMaybeSingle });

      await expect(submitWarrantyClaim(claimData)).rejects.toThrow(
        'A warranty claim is already pending or approved for this purchase'
      );
    });
  });

  describe('fetchEligibleAccounts', () => {
    it('should fetch eligible accounts successfully', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq1 = jest.fn().mockReturnThis();
      const mockEq2 = jest.fn().mockReturnThis();
      const mockNot = jest.fn().mockReturnThis();
      const mockGt = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [mockPurchase],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq1 });
      mockEq1.mockReturnValue({ eq: mockEq2 });
      mockEq2.mockReturnValue({ not: mockNot });
      mockNot.mockReturnValue({ gt: mockGt });
      mockGt.mockReturnValue({ order: mockOrder });

      const result = await fetchEligibleAccounts();

      expect(result.accounts).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.accounts[0].product_name).toBe('Test Product');
    });

    it('should handle no eligible accounts', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq1 = jest.fn().mockReturnThis();
      const mockEq2 = jest.fn().mockReturnThis();
      const mockNot = jest.fn().mockReturnThis();
      const mockGt = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq1 });
      mockEq1.mockReturnValue({ eq: mockEq2 });
      mockEq2.mockReturnValue({ not: mockNot });
      mockNot.mockReturnValue({ gt: mockGt });
      mockGt.mockReturnValue({ order: mockOrder });

      const result = await fetchEligibleAccounts();

      expect(result.accounts).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('fetchWarrantyStats', () => {
    it('should calculate warranty statistics correctly', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockClaims = [
        { status: 'pending' },
        { status: 'pending' },
        { status: 'reviewing' },
        { status: 'approved' },
        { status: 'rejected' },
        { status: 'completed' },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({
        data: mockClaims,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      const result = await fetchWarrantyStats();

      expect(result).toEqual({
        total: 6,
        pending: 2,
        reviewing: 1,
        approved: 1,
        rejected: 1,
        completed: 1,
      });
    });

    it('should handle no claims', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      const result = await fetchWarrantyStats();

      expect(result).toEqual({
        total: 0,
        pending: 0,
        reviewing: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
      });
    });
  });

  describe('error handling', () => {
    it('should handle authentication errors', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Auth failed'),
      });

      await expect(fetchWarrantyClaims()).rejects.toThrow('Not authenticated');
      await expect(fetchEligibleAccounts()).rejects.toThrow('Not authenticated');
      await expect(fetchWarrantyStats()).rejects.toThrow('Not authenticated');
    });
  });
});
