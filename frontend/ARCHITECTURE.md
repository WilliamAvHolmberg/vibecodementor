# Frontend Architecture - Vertical Slice Pattern

This frontend follows the **Vertical Slice Architecture** pattern, mirroring our backend structure for consistency.

## 📁 Directory Structure

```
src/
├── app/                     # Next.js App Router (Pages & Layouts)
├── features/               # Vertical Slices (Business Features)
│   ├── chat/              # Chat feature slice
│   │   ├── index.ts       # Feature exports
│   │   ├── chat.tsx       # Main chat component
│   │   ├── chat-provider.tsx # State management
│   │   ├── chat-message.tsx  # Message component
│   │   ├── hooks.ts       # Feature-specific hooks
│   │   └── types.ts       # Feature types
│   ├── auth/              # Authentication slice
│   ├── users/             # User management slice
│   └── dashboard/         # Dashboard slice
├── shared/                # Shared across features
│   ├── components/        # Reusable UI components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Common hooks
│   ├── lib/              # Utilities & API client
│   └── types/            # Shared TypeScript types
└── styles/               # Global styles
```

## 🎯 Vertical Slice Benefits

### ✅ **Feature Isolation**
- Each feature contains its own components, hooks, types
- Changes to one feature don't affect others
- Easy to delete/modify entire features

### ✅ **Consistent with Backend**
- Mirrors backend vertical slice architecture
- Same mental model across full stack
- Easier team collaboration

### ✅ **Scalable**
- New features go in their own slice
- No monolithic component folders
- Clear ownership and boundaries

## 🏗️ Feature Slice Structure

Each feature slice should contain:

```
features/feature-name/
├── index.ts              # Main exports
├── components/           # Feature components
├── hooks/               # Feature hooks
├── types.ts             # Feature types
├── api.ts               # Feature API calls
└── providers/           # Feature state management
```

## 📦 Shared Resources

### `shared/components/ui/`
- shadcn/ui components
- Reusable across all features
- Design system components

### `shared/lib/`
- API client utilities
- Common helper functions
- Configuration

### `shared/types/`
- Application-wide types
- API response types
- Common interfaces

## 🔄 Feature Integration

Features communicate through:
- **Shared types** for data contracts
- **API client** for backend communication  
- **Context providers** for state sharing
- **Event system** for loose coupling

## 🎨 Example: Chat Feature

```typescript
// Import the entire feature
import { Chat, ChatProvider } from '@/features/chat';

// Or import specific components
import { ChatMessage } from '@/features/chat';
```

This architecture keeps the codebase organized, maintainable, and mirrors our backend structure perfectly! 🚀 