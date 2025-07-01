# 🚀 Centralized API Architecture with Orval

## 📁 Directory Structure

```
src/api/
├── client.ts           # Custom axios client (mutator for Orval)
├── query-provider.tsx  # React Query provider
├── index.ts           # Main exports
├── hooks/             # 🤖 GENERATED - React Query hooks
├── models/            # 🤖 GENERATED - TypeScript types/DTOs
└── README.md          # This file
```

## 🎯 How It Works

### 1. **Generate API Client**
```bash
npm run api:generate
```
This runs Orval and generates:
- `hooks/` - All React Query hooks (useGetUsers, useCreateUser, etc.)
- `models/` - All TypeScript interfaces (UserDTO, CreateUserRequestDTO, etc.)

### 2. **Features Import from API**
```typescript
// features/users/hooks/use-users.ts
import { 
  useGetUsers,
  useCreateUser,
  type UserDTO 
} from '@/api/hooks';

// Re-export with feature-specific names
export { useGetUsers as useUsers };
export { useCreateUser };

// Add custom business logic
export function useUserProfile(userId: string) {
  const user = useGetUser(userId);
  return {
    ...user,
    displayName: `${user.data?.firstName} ${user.data?.lastName}`
  };
}
```

### 3. **Components Use Feature Hooks**
```typescript
// features/users/components/user-list.tsx
import { useUsers } from '../hooks/use-users';

export function UserList() {
  const { data: users, isLoading, error } = useUsers();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.email}</li>
      ))}
    </ul>
  );
}
```

## 🔧 Configuration

### Orval Config (`orval.config.ts`)
```typescript
export default defineConfig({
  api: {
    input: {
      target: 'http://localhost:5001/api/swagger/v1/swagger.json',
    },
    output: {
      target: './src/api/hooks',    # Generated hooks go here
      schemas: './src/api/models',  # Generated types go here
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/client.ts',  # Our custom client
          name: 'customApiClient',
        },
      },
    },
  },
});
```

### Custom Client (`client.ts`)
- ✅ **Authentication** - Automatic JWT token handling
- ✅ **Error Handling** - Global error interceptors  
- ✅ **Proxy Integration** - Works with Next.js proxy
- ✅ **TypeScript** - Full type safety

## 🚀 Benefits

### ✅ **Single Source of Truth**
- All API code generated in one place
- Easy to find and manage
- Consistent patterns across features

### ✅ **Type Safety**
- Generated TypeScript interfaces
- End-to-end type safety from backend to frontend
- IntelliSense support

### ✅ **Developer Experience**
- Auto-complete for all API endpoints
- Automatic React Query integration
- Built-in loading/error states

### ✅ **Maintainability**
- Backend API changes auto-update frontend
- No manual API client maintenance
- Clear separation between generated vs custom code

## 📝 Scripts

```json
{
  "api:generate": "orval",           // Generate once
  "api:watch": "orval --watch"       // Watch for changes
}
```

## 🔄 Workflow

1. **Backend changes API** → Update Swagger
2. **Run generation** → `npm run api:generate`
3. **Check changes** → Review generated hooks/types
4. **Update features** → Import new hooks in feature slices
5. **Test** → Everything is type-safe!

## 🎯 Example Generated Files

### Generated Hook (`api/hooks/users.ts`)
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { customApiClient } from '../client';
import type { UserDTO, CreateUserRequestDTO } from '../models';

export const useGetUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: () => customApiClient<UserDTO[]>({ url: '/users' }),
  });

export const useCreateUser = () =>
  useMutation({
    mutationFn: (data: CreateUserRequestDTO) =>
      customApiClient<UserDTO>({ 
        url: '/users', 
        method: 'POST', 
        data 
      }),
  });
```

### Generated Types (`api/models/user.ts`)
```typescript
export interface UserDTO {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequestDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
```

This architecture gives us the best of both worlds:
- **Generated code** for consistency and maintenance
- **Custom features** for business logic and UX
- **Vertical slices** for clear feature boundaries 