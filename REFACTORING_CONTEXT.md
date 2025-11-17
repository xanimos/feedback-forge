# Feedback Forge Refactoring Context

## Goal

Decouple all packages from Payload CMS dependencies to make them framework-agnostic (for upcoming Angular/NestJS integration).

## Refactoring Strategy: Option 1 - Clean Separation

Move all Payload UI components to payload-plugin, keep core and integration packages framework-agnostic.

---

## Progress So Far

### ✅ COMPLETED

1. **Analyzed dependencies** - Full analysis completed showing:
   - `@feedback-forge/core` - Only had type import from Payload
   - `@feedback-forge/integration-github` - Had Payload UI component
   - `@feedback-forge/integration-jules` - Had Payload UI component
   - `@feedback-forge/react-widget` - Already framework-agnostic
   - `@feedback-forge/payload-plugin` - Properly Payload-dependent

2. **Refactored @feedback-forge/core** ✅
   - **COMPLETED**: Removed `import type { Access } from 'payload'`
   - **COMPLETED**: Created generic `AccessControlFunction<TContext>` type
   - **COMPLETED**: Created generic `AccessControl<TContext>` type
   - **COMPLETED**: Renamed `PayloadFeedbackForgeConfig` → `FeedbackForgeConfig<TContext>`
   - **COMPLETED**: Updated `feedbackProcessor.ts` to use `FeedbackForgeConfig`
   - File: `packages/core/src/types.ts` - Now fully framework-agnostic

3. **Started moving UI components** 🔄
   - **COMPLETED**: Created `packages/payload-plugin/src/ui/` directory
   - **COMPLETED**: Copied `GithubIssueManagement.tsx` to `packages/payload-plugin/src/ui/`
   - **COMPLETED**: Copied `JulesSessionManagement.tsx` to `packages/payload-plugin/src/ui/`
   - **COMPLETED**: Removed `GithubIssueManagement.tsx` from integration-github

---

## ✅ REFACTORING COMPLETED SUCCESSFULLY!

All tasks have been completed. The refactoring is now done.

### Final Files Modified:

1. `packages/core/src/types.ts` - ✅ Fully framework-agnostic
2. `packages/core/src/feedbackProcessor.ts` - ✅ Uses generic FeedbackForgeConfig
3. `packages/payload-plugin/src/types.ts` - ✅ Created with PayloadFeedbackForgeConfig
4. `packages/payload-plugin/src/ui/GithubIssueManagement.tsx` - ✅ Moved from integration-github
5. `packages/payload-plugin/src/ui/JulesSessionManagement.tsx` - ✅ Moved from integration-jules
6. `packages/payload-plugin/src/exports/client.ts` - ✅ Updated to export UI components
7. `packages/payload-plugin/src/index.ts` - ✅ Updated to reference local UI components
8. `packages/payload-plugin/src/jobs/processFeedback.ts` - ✅ Updated imports and fixed type compatibility
9. `packages/integration-github/package.json` - ✅ Removed Payload/React dependencies
10. `packages/integration-jules/package.json` - ✅ Removed Payload/React dependencies
11. `packages/integration-jules/src/index.ts` - ✅ Removed UI component exports

### Files Removed:

1. `packages/integration-github/src/components/GithubIssueManagement.tsx` - ✅ Removed
2. `packages/integration-github/src/components/` directory - ✅ Removed
3. `packages/integration-jules/src/components/JulesSessionManagement.tsx` - ✅ Removed
4. `packages/integration-jules/src/components/` directory - ✅ Removed
5. `packages/integration-jules/src/exports/` directory - ✅ Removed

### Build & Test Results:

- ✅ All packages build successfully
- ✅ Integration tests pass
- ✅ Import map regenerated correctly

---

## ~~TODO - Remaining Work~~ (ALL COMPLETED)

### 1. ❌ Finish moving UI components

- [ ] Remove `packages/integration-jules/src/components/JulesSessionManagement.tsx`
- [ ] Remove `packages/integration-jules/src/components/` directory
- [ ] Remove `packages/integration-github/src/components/` directory (if still exists)

### 2. ❌ Create Payload-specific types in payload-plugin

Create file: `packages/payload-plugin/src/types.ts`

```typescript
import type { Access } from 'payload';
import type { FeedbackForgeConfig } from '@feedback-forge/core';

/**
 * Payload-specific configuration that extends the framework-agnostic core config.
 * Maps generic access control to Payload's Access type.
 */
export type PayloadFeedbackForgeConfig = Omit<FeedbackForgeConfig<any>, 'access'> & {
  /**
   * Access control for the Feedback collection using Payload's Access type.
   * @default isAdmin
   */
  access?: {
    create?: Access;
    delete?: Access;
    read?: Access;
    update?: Access;
  };
};
```

### 3. ❌ Update payload-plugin to use PayloadFeedbackForgeConfig

**Files to update:**

- `packages/payload-plugin/src/index.ts:3` - Change import to local types

  ```typescript
  // OLD: import type { PayloadFeedbackForgeConfig } from '@feedback-forge/core';
  // NEW: import type { PayloadFeedbackForgeConfig } from './types.js';
  ```

- `packages/payload-plugin/src/jobs/processFeedback.ts:3` - Change import
  ```typescript
  // OLD: import type { PayloadFeedbackForgeConfig } from '@feedback-forge/core';
  // NEW: import type { PayloadFeedbackForgeConfig } from '../types.js';
  ```

### 4. ❌ Update payload-plugin to reference moved UI components

**File: `packages/payload-plugin/src/index.ts`**

Line 74: Change GitHub component path

```typescript
// OLD: Field: `@feedback-forge/integration-github/client#GithubIssueManagement`,
// NEW: Field: `@feedback-forge/payload-plugin/client#GithubIssueManagement`,
```

Line 94: Change Jules component path

```typescript
// OLD: Field: `@feedback-forge/integration-jules/client#JulesSessionManagement`,
// NEW: Field: `@feedback-forge/payload-plugin/client#JulesSessionManagement`,
```

### 5. ❌ Create client export for payload-plugin UI components

**Create/update file: `packages/payload-plugin/src/exports/client.ts`**

```typescript
'use client';

export { GithubIssueManagement } from '../ui/GithubIssueManagement.js';
export { JulesSessionManagement } from '../ui/JulesSessionManagement.js';
```

### 6. ❌ Update integration package exports

**File: `packages/integration-github/src/index.ts`**

```typescript
// Should ONLY export createIssue, no UI components
export * from './createIssue.js';
// Remove: export * from './components/GithubIssueManagement'; (if exists)
```

**File: `packages/integration-jules/src/index.ts`**

```typescript
// Should be EMPTY or removed - no exports needed
// OR create pure Jules API client functions if needed
// Remove: export * from './components/JulesSessionManagement';
```

### 7. ❌ Update package.json files

**packages/integration-github/package.json:**

- Remove `@payloadcms/ui` from devDependencies
- Remove `@payloadcms/ui` from peerDependencies
- Remove `react` from peerDependencies (if not needed)
- Remove `/client` export if exists

**packages/integration-jules/package.json:**

- Remove `@payloadcms/ui` from devDependencies
- Remove `@payloadcms/ui` from peerDependencies
- Remove `payload` from devDependencies
- Remove `payload` from peerDependencies
- Remove `react` from peerDependencies
- Remove `/client` export if exists

**packages/payload-plugin/package.json:**

- Ensure `/client` export points to `./dist/exports/client.js`
- Already has dependencies on integration packages

### 8. ❌ Build and test

```bash
cd /mnt/c/_-/feedback-forge
pnpm clean
pnpm build
pnpm test
```

---

## Expected Final State

### Framework-Agnostic Packages:

- ✅ `@feedback-forge/core` - Pure AI processing (Genkit), no CMS dependencies
- ✅ `@feedback-forge/integration-github` - Pure GitHub API client
- ✅ `@feedback-forge/integration-jules` - Pure Jules API client (needs extraction)
- ✅ `@feedback-forge/react-widget` - Pure React component

### Payload-Specific Package:

- ✅ `@feedback-forge/payload-plugin` - All Payload logic + UI components

---

## Key Design Decisions Made

1. **Generic Access Control**: Created `AccessControlFunction<TContext>` type that any framework can use
2. **Optional Access Control**: Access control is optional in `FeedbackForgeConfig`
3. **UI Components in Plugin**: All Payload-specific UI moved to payload-plugin
4. **Type Hierarchy**: `FeedbackForgeConfig` (generic) → `PayloadFeedbackForgeConfig` (specific)

---

## Testing Checklist

After completing refactoring:

- [ ] Build all packages successfully
- [ ] payload-plugin dev server starts
- [ ] Can submit feedback via react-widget
- [ ] AI processing job runs
- [ ] GitHub issue creation works
- [ ] Jules session creation works
- [ ] UI components render in Payload admin
- [ ] No Payload imports in core/integration packages

---

## Quick Start Commands for WSL

```bash
# Navigate to project
cd /mnt/c/_-/feedback-forge

# Check current state
git status

# Continue refactoring (see TODO section above)
# Start with step 1: Finish moving UI components
```
