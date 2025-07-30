# Frontend Architecture - Vertical Slices

## 🎯 Philosophy: PRAGMATIC OVER PERFECT
- **Speed over purity** - Ship features fast, refactor later
- **Simple patterns** - Avoid over-engineering 
- **Consistency** - Follow established patterns for AI predictability

## 📁 Structure
```
src/
├── features/          # Self-contained feature slices
├── shared/           # Reusable components/hooks
├── api/              # 🤖 ORVAL GENERATED (DO NOT EDIT)
└── app/              # Next.js App Router
```

## 🏗️ Feature Slice Pattern
```
features/feature-name/
├── index.ts          # Exports (import { X } from '@/features/auth')
├── components/       # Feature components
├── hooks/           # Wraps api/hooks with business logic
├── pages/           # Feature pages (if needed)
├── types.ts         # Feature-specific types
└── [name]-context.tsx # Feature state (if needed)
```

## 🤖 Orval Integration - CRITICAL
- **Generated**: `api/hooks/` (React Query) + `api/models/` (DTOs)
- **Regenerate**: `npm run api:generate` after backend changes
- **Pattern**: Features wrap generated hooks, add business logic
- **🚨 NEVER EDIT**: Generated files will be overwritten

## 🔧 Tech Stack
- **Next.js 15** + **React 19** + **TypeScript 5**
- **React Query** + **shadcn/ui** + **Tailwind CSS**
- **Axios** (JWT auth) + **SignalR** (real-time)

## 📋 Patterns

### Imports
```typescript
// External first
import { useState } from 'react';
// Internal with aliases
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth';
import { useUsers } from '@/features/users'; // ✅ Cross-feature OK
```

### Components
```typescript
export function Component({ prop }: Props) {
  // Hooks first
  const { data, isLoading } = useHook();
  
  // Event handlers
  const handleClick = () => {};
  
  // Render
  return <div>{content}</div>;
}
```

### API Hook Wrapping
```typescript
// features/users/hooks/use-users.ts
import { useGetUsers } from '@/api/hooks'; // Generated

export function useUsers() {
  const query = useGetUsers();
  
  // Add business logic here
  return {
    ...query,
    displayUsers: query.data?.map(u => ({
      ...u,
      fullName: `${u.firstName} ${u.lastName}`
    }))
  };
}
```

### Feature Context Pattern
```typescript
// features/auth/auth-context.tsx
interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Implementation
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Page Structure
```typescript
// app/feature/page.tsx
import { FeaturePage } from '@/features/feature';

export default function Page() {
  return <FeaturePage />;
}

// features/feature/pages/FeaturePage.tsx
'use client';

export function FeaturePage() {
  const { data, isLoading } = useFeatureData();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="container mx-auto p-6">
      {/* Feature content */}
    </div>
  );
}
```

## 🔐 Authentication Pattern

### JWT Storage & Axios Setup
```typescript
// shared/lib/auth.ts
export const authStorage = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
};

// Axios interceptor (in api/client.ts - generated but configured)
axios.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### SignalR with JWT
```typescript
// features/chat/hooks/use-signalr.ts
export function useSignalR() {
  useEffect(() => {
    const token = authStorage.getToken();
    const connection = new HubConnectionBuilder()
      .withUrl('/chatHub', {
        accessTokenFactory: () => token || ''
      })
      .build();
    
    connection.start();
    
    return () => {
      connection.stop();
    };
  }, []);
}
```

## 🎨 UI Patterns

### Component Structure
```typescript
interface Props {
  title: string;
  onAction?: () => void;
  variant?: 'default' | 'primary';
}

export function FeatureComponent({ title, onAction, variant = 'default' }: Props) {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
      {onAction && (
        <CardFooter>
          <Button onClick={onAction} variant={variant}>
            Action
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

### Loading States
```typescript
export function FeatureList() {
  const { data, isLoading, error } = useFeatureData();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load data</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      {data?.map(item => (
        <FeatureItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## 🛠️ Common Commands

### Development
```bash
# Run dev server
npm run dev

# Regenerate API types (after backend changes)
npm run api:generate

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm test
```

### API Generation
```bash
# After backend changes, regenerate types
npm run api:generate

# This updates:
# - api/hooks/ (React Query hooks)
# - api/models/ (TypeScript types)
# - api/client.ts (Axios client)
```

## 🎯 Key Rules
- ✅ Never edit `api/hooks/` or `api/models/`
- ✅ Features CAN import from other features (be pragmatic)
- ✅ Use Server Components by default, 'use client' when needed
- ✅ JWT from localStorage, axios interceptors for auth
- ✅ Wrap generated hooks in feature-specific hooks
- ✅ Keep it simple - avoid over-engineering
- ✅ Consistency over cleverness
- ✅ Keep design clean, don't overuse emojis, make it feel real

## 🚨 Critical Gotchas
- **Orval regeneration** wipes `api/` folder - never edit directly
- **'use client'** needed for hooks, state, event handlers
- **SignalR connections** need cleanup in useEffect
- **JWT expiry** - handle 401s gracefully
- **Loading states** - always handle isLoading/error from React Query
- **Hydration** - be careful with localStorage on SSR

## 📱 Responsive Design

### Mobile-First Approach
```typescript
// Use Tailwind responsive prefixes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-responsive grid */}
</div>

// Conditional rendering for mobile
const isMobile = useMediaQuery('(max-width: 768px)');
```

### Common Breakpoints
```css
/* Tailwind breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

## 🔄 State Management

### React Query for Server State
```typescript
// features/users/hooks/use-users.ts
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Context for Client State
```typescript
// Only for complex shared state
// Simple state = useState
// Server state = React Query
// Global client state = Context
```

## 🎨 Styling Guidelines

### Tailwind Patterns
```typescript
// Common patterns
const cardStyles = "bg-white dark:bg-gray-800 rounded-lg border shadow-sm";
const buttonStyles = "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700";
const inputStyles = "w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600";
```

### Dark Mode Support
```typescript
// Always include dark mode variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```