---
inclusion: always
---

---
inclusion: always
---

# Supabase Integration Standards

## Architecture

Frontend-only application using Supabase as backend. **Never create or suggest a separate backend server.**

## Mandatory Data Flow

**Database → Supabase Client → React Query Hook → Component**

## Implementation Pattern

### 1. Database First - Verify Before Coding

Use MCP tools to verify schema before writing data operations:

```typescript
// Use: mcp_supabase_execute_sql
SELECT * FROM information_schema.columns WHERE table_name = 'your_table';
```

- Schema changes: Use `mcp_supabase_apply_migration`
- Verify RLS policies, constraints, and foreign keys exist
- Check existing data structure matches expectations

### 2. Data Layer - Supabase Client

**Location:** `src/hooks/` (inline in hook functions)

```typescript
import { supabase } from '@/config/supabase';

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('id', id);

if (error) throw error;
return data;
```

**Requirements:**
- Import from `@/config/supabase` only
- Always destructure `{ data, error }`
- Throw errors in `queryFn` for React Query error boundaries
- Use TypeScript types from `src/types/`

### 3. Hook Layer - React Query

**Location:** `src/hooks/`

```typescript
export const useTableData = (id: string) => {
  return useQuery({
    queryKey: ['table_name', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('id', id);
      
      if (error) throw error;
      return data;
    }
  });
};
```

**Requirements:**
- All data fetching uses `useQuery` or `useMutation`
- Proper `queryKey` array (include all dependencies)
- Throw errors in `queryFn` (not return null/undefined)

### 4. Component Layer - State Handling

**Location:** `src/features/` or `src/components/`

```typescript
const { data, isLoading, error } = useTableData(id);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <div>{/* render data */}</div>;
```

**Requirements:**
- Handle all three states: `isLoading`, `error`, success
- No mock/hardcoded data in production code
- Use proper loading and error UI components

## Critical Rules

**Never:**
- Create a separate backend server or API layer
- Use `fetch()` directly - always use Supabase client + React Query
- Skip database verification before implementing features
- Use mock data in production code
- Omit error or loading state handling in components

**Always:**
- Verify database schema with MCP tools first
- Use React Query for all data operations
- Handle all component states (loading, error, success)
- Import Supabase client from `@/config/supabase`

## File Structure

```
src/
├── config/supabase.ts    # Supabase client config
├── types/                # TypeScript type definitions
├── hooks/                # React Query hooks
├── features/             # Feature components
└── components/           # Shared components
```

## MCP Tools Reference

- `mcp_supabase_execute_sql` - Query/verify database
- `mcp_supabase_apply_migration` - Apply schema changes
- `mcp_supabase_list_tables` - List database tables
- `mcp_supabase_get_advisors` - Check security/performance issues
