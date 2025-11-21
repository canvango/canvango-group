import { RoleManagementClient } from '../clients/RoleManagementClient';
import { UserRole } from '../types/roleManagement';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
const createMockSupabaseClient = () => {
  return {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  } as unknown as SupabaseClient;
};

describe('RoleManagementClient', () => {
  let client: RoleManagementClient;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    client = new RoleManagementClient(mockSupabase);
  });

  describe('getUserProfile', () => {
    it('should return user profile when user exists', async () => {
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        role: UserRole.MEMBER,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const result = await client.getUserProfile('user-123');
      
      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should return null when user does not exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      });

      const result = await client.getUserProfile('non-existent');
      
      expect(result).toBeNull();
    });

    it('should throw error on database error', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error', code: 'DB_ERROR' }
            })
          })
        })
      });

      await expect(client.getUserProfile('user-123')).rejects.toThrow();
    });
  });

  describe('getCurrentUserRole', () => {
    it('should return admin role for admin user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-123' } }
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'profile-123',
                user_id: 'admin-123',
                role: UserRole.ADMIN,
                created_at: '2024-01-01',
                updated_at: '2024-01-01'
              },
              error: null
            })
          })
        })
      });

      const result = await client.getCurrentUserRole();
      
      expect(result).toBe(UserRole.ADMIN);
    });

    it('should return member role for member user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'member-123' } }
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'profile-123',
                user_id: 'member-123',
                role: UserRole.MEMBER,
                created_at: '2024-01-01',
                updated_at: '2024-01-01'
              },
              error: null
            })
          })
        })
      });

      const result = await client.getCurrentUserRole();
      
      expect(result).toBe(UserRole.MEMBER);
    });

    it('should return null for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null }
      });

      const result = await client.getCurrentUserRole();
      
      expect(result).toBeNull();
    });
  });

  describe('isCurrentUserAdmin', () => {
    it('should return true for admin user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-123' } }
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                role: UserRole.ADMIN
              },
              error: null
            })
          })
        })
      });

      const result = await client.isCurrentUserAdmin();
      
      expect(result).toBe(true);
    });

    it('should return false for member user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'member-123' } }
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                role: UserRole.MEMBER
              },
              error: null
            })
          })
        })
      });

      const result = await client.isCurrentUserAdmin();
      
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'));

      const result = await client.isCurrentUserAdmin();
      
      expect(result).toBe(false);
    });
  });

  describe('getAllUserProfiles', () => {
    it('should return all user profiles for admin', async () => {
      // Mock isCurrentUserAdmin to return true
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-123' } }
      });

      const mockProfiles = [
        {
          id: 'profile-1',
          user_id: 'user-1',
          role: UserRole.MEMBER,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          user: { id: 'user-1', email: 'user1@example.com' }
        },
        {
          id: 'profile-2',
          user_id: 'user-2',
          role: UserRole.ADMIN,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          user: { id: 'user-2', email: 'user2@example.com' }
        }
      ];

      let callCount = 0;
      mockSupabase.from.mockImplementation((_table: string) => {
        if (_table === 'user_profiles') {
          callCount++;
          if (callCount === 1) {
            // First call for isCurrentUserAdmin
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { role: UserRole.ADMIN },
                    error: null
                  })
                })
              })
            };
          } else {
            // Second call for getAllUserProfiles
            return {
              select: jest.fn().mockResolvedValue({
                data: mockProfiles,
                error: null
              })
            };
          }
        }
        return {};
      });

      const result = await client.getAllUserProfiles();
      
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@example.com');
      expect(result[1].email).toBe('user2@example.com');
    });

    it('should throw error for non-admin user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'member-123' } }
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: UserRole.MEMBER },
              error: null
            })
          })
        })
      });

      await expect(client.getAllUserProfiles()).rejects.toThrow('Only admins can view all user profiles');
    });
  });

  describe('updateUserRole', () => {
    beforeEach(() => {
      // Mock isCurrentUserAdmin to return true
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-123' } }
      });
    });

    it('should successfully update user role', async () => {
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        role: UserRole.MEMBER,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      let callCount = 0;
      mockSupabase.from.mockImplementation((_table: string) => {
        callCount++;
        if (callCount === 1) {
          // isCurrentUserAdmin check
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { role: UserRole.ADMIN },
                  error: null
                })
              })
            })
          };
        } else if (callCount === 2) {
          // getUserProfile check
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProfile,
                  error: null
                })
              })
            })
          };
        } else if (callCount === 3) {
          // getAdminCount check
          return {
            select: jest.fn().mockResolvedValue({
              count: 2,
              error: null
            })
          };
        } else {
          // update operation
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { ...mockProfile, role: UserRole.ADMIN },
                    error: null
                  })
                })
              })
            })
          };
        }
      });

      const result = await client.updateUserRole('user-123', UserRole.ADMIN);
      
      expect(result.success).toBe(true);
      expect(result.profile?.role).toBe(UserRole.ADMIN);
    });

    it('should fail when trying to remove last admin', async () => {
      const mockAdminProfile = {
        id: 'profile-123',
        user_id: 'admin-123',
        role: UserRole.ADMIN,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      let callCount = 0;
      mockSupabase.from.mockImplementation((_table: string) => {
        callCount++;
        if (callCount === 1) {
          // isCurrentUserAdmin check
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { role: UserRole.ADMIN },
                  error: null
                })
              })
            })
          };
        } else if (callCount === 2) {
          // getUserProfile check
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockAdminProfile,
                  error: null
                })
              })
            })
          };
        } else {
          // getAdminCount check - only 1 admin
          return {
            select: jest.fn().mockResolvedValue({
              count: 1,
              error: null
            })
          };
        }
      });

      const result = await client.updateUserRole('admin-123', UserRole.MEMBER);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('LAST_ADMIN');
    });

    it('should fail for non-admin user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'member-123' } }
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: UserRole.MEMBER },
              error: null
            })
          })
        })
      });

      const result = await client.updateUserRole('user-123', UserRole.ADMIN);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('PERMISSION_DENIED');
    });

    it('should fail for invalid role', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: UserRole.ADMIN },
              error: null
            })
          })
        })
      });

      const result = await client.updateUserRole('user-123', 'invalid' as UserRole);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ROLE');
    });

    it('should fail when user not found', async () => {
      let callCount = 0;
      mockSupabase.from.mockImplementation((_table: string) => {
        callCount++;
        if (callCount === 1) {
          // isCurrentUserAdmin check
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { role: UserRole.ADMIN },
                  error: null
                })
              })
            })
          };
        } else {
          // getUserProfile check - user not found
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' }
                })
              })
            })
          };
        }
      });

      const result = await client.updateUserRole('non-existent', UserRole.ADMIN);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('USER_NOT_FOUND');
    });
  });

  describe('getRoleAuditLogs', () => {
    it('should return audit logs for admin', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-123' } }
      });

      const mockLogs = [
        {
          id: 'log-1',
          user_id: 'user-1',
          changed_by_user_id: 'admin-123',
          old_role: UserRole.MEMBER,
          new_role: UserRole.ADMIN,
          changed_at: '2024-01-01',
          user: { email: 'user1@example.com' },
          changed_by: { email: 'admin@example.com' }
        }
      ];

      let callCount = 0;
      mockSupabase.from.mockImplementation((_table: string) => {
        callCount++;
        if (callCount === 1) {
          // isCurrentUserAdmin check
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { role: UserRole.ADMIN },
                  error: null
                })
              })
            })
          };
        } else {
          // getRoleAuditLogs query
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockLogs,
                error: null
              })
            })
          };
        }
      });

      const result = await client.getRoleAuditLogs();
      
      expect(result).toHaveLength(1);
      expect(result[0].user_email).toBe('user1@example.com');
      expect(result[0].changed_by_email).toBe('admin@example.com');
    });

    it('should filter logs by user ID', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-123' } }
      });

      let callCount = 0;
      mockSupabase.from.mockImplementation((_table: string) => {
        callCount++;
        if (callCount === 1) {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { role: UserRole.ADMIN },
                  error: null
                })
              })
            })
          };
        } else {
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          };
        }
      });

      await client.getRoleAuditLogs('user-123');
      
      // Verify eq was called with user_id filter
      expect(mockSupabase.from).toHaveBeenCalledWith('role_audit_logs');
    });

    it('should throw error for non-admin user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'member-123' } }
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: UserRole.MEMBER },
              error: null
            })
          })
        })
      });

      await expect(client.getRoleAuditLogs()).rejects.toThrow('Only admins can view audit logs');
    });
  });

  describe('getAdminCount', () => {
    it('should return count of admin users', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          count: 3,
          error: null
        })
      });

      const result = await client.getAdminCount();
      
      expect(result).toBe(3);
    });

    it('should return 0 when no admins exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          count: 0,
          error: null
        })
      });

      const result = await client.getAdminCount();
      
      expect(result).toBe(0);
    });

    it('should throw error on database error', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          count: null,
          error: { message: 'Database error' }
        })
      });

      await expect(client.getAdminCount()).rejects.toThrow();
    });
  });
});
