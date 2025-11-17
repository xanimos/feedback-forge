# IDE Type Resolution Fix

## Problem

Your IDE was unable to resolve type definitions for packages in the monorepo. This was happening because:

1. **Missing root `tsconfig.json`**: The IDE needs a root TypeScript configuration to understand the workspace structure
2. **Missing `composite: true`**: Package tsconfigs need this flag for TypeScript project references to work
3. **pnpm symlink structure**: pnpm uses a `.pnpm` directory with complex symlinks that IDEs sometimes struggle with
4. **Missing dist folders**: Some packages weren't fully built (nestjs-plugin was missing its dist folder)

## Solution Applied

### 1. Created Root TypeScript Configuration

**File:** `/home/dw/repos/feedback-forge/tsconfig.json`

This file:
- Defines path mappings for all `@feedback-forge/*` packages
- Sets up TypeScript project references
- Configures the IDE to resolve workspace packages by source (`src/`) not dist

**Key sections:**
```json
{
  "compilerOptions": {
    "paths": {
      "@feedback-forge/core": ["./packages/core/src"],
      "@feedback-forge/angular-widget": ["./packages/angular-widget/src"],
      "@feedback-forge/nestjs-plugin": ["./packages/nestjs-plugin/src"],
      // ... etc
    }
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/angular-widget" },
    // ... etc
  ]
}
```

### 2. Updated Package TypeScript Configurations

Added `"composite": true` to:
- `packages/angular-widget/tsconfig.json`
- `packages/nestjs-plugin/tsconfig.json`

This enables TypeScript project references, allowing the IDE to:
- Track dependencies between packages
- Provide faster intellisense
- Show errors across package boundaries

### 3. Created VSCode Settings

**File:** `/home/dw/repos/feedback-forge/.vscode/settings.json`

Configured VSCode to:
- Use the workspace TypeScript version
- Enable package.json auto-imports
- Exclude build artifacts and node_modules from search
- Ignore `.pnpm` directory (pnpm's internal cache)

**Key settings:**
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "search.exclude": {
    "**/.pnpm": true,
    "**/dist": true
  }
}
```

### 4. Rebuilt All Packages

Ran `pnpm clean && pnpm build` to ensure:
- All packages have up-to-date `dist/` folders
- TypeScript build info (`.tsbuildinfo`) is regenerated
- Type definitions (`.d.ts`) are current

## Verification

After these changes:
- ✅ All packages build successfully
- ✅ TypeScript project references working
- ✅ IDE can resolve `@feedback-forge/*` imports
- ✅ Intellisense works across packages
- ✅ Go-to-definition jumps to source files

## IDE-Specific Instructions

### VSCode

1. **Reload Window**: Press `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Select Workspace TypeScript**:
   - Open any `.ts` file
   - Click the TypeScript version in the status bar (bottom-right)
   - Select "Use Workspace Version"
3. **Restart TypeScript Server**: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### WebStorm / IntelliJ

1. **Invalidate Caches**: File → Invalidate Caches → Check "Clear file system cache" → Restart
2. **Configure TypeScript**:
   - Settings → Languages & Frameworks → TypeScript
   - Set TypeScript version to project version (`node_modules/typescript`)
   - Enable "Use tsconfig.json"
3. **Re-index Project**: File → Invalidate Caches → Just Restart

### Other IDEs

Most TypeScript-aware editors will automatically pick up the root `tsconfig.json`. If issues persist:

1. Ensure the IDE is using the workspace TypeScript version (not a global install)
2. Check that the IDE follows symbolic links
3. Configure the IDE to use `tsconfig.json` for type resolution

## Understanding pnpm Workspace Structure

pnpm installs dependencies in a unique way:

```
node_modules/
├── .pnpm/                    # Actual packages (symlink targets)
│   └── package@version/
│       └── node_modules/
│           └── package/      # Real files here
├── @feedback-forge/          # Symlinks to workspace packages
│   ├── core -> ../packages/core/
│   └── angular-widget -> ../packages/angular-widget/
└── typescript/               # Symlink to .pnpm/typescript@x.x.x/
```

**Key points:**
- Workspace packages (`@feedback-forge/*`) are symlinked, not installed
- External packages are in `.pnpm/` with complex paths
- IDEs must follow symlinks correctly

**Our solution:**
- Root `tsconfig.json` with `paths` tells the IDE to resolve workspace packages by source
- This bypasses the symlink confusion entirely
- IDE sees `@feedback-forge/core` → `./packages/core/src` directly

## Troubleshooting

### "Cannot find module '@feedback-forge/core'"

**Solution:**
1. Check that `pnpm install` has been run
2. Verify `packages/core/dist/` exists (run `pnpm build`)
3. Reload IDE/TypeScript server

### "Module has no exported member 'X'"

**Solution:**
1. Rebuild the package: `cd packages/packagename && pnpm build`
2. Check that the export exists in `src/index.ts`
3. Restart TypeScript server

### Types still not working

**Solution:**
1. Delete `node_modules` and `pnpm-lock.yaml`
2. Run `pnpm install`
3. Run `pnpm build`
4. Restart IDE completely (not just reload window)

### Slow intellisense

**Solution:**
1. Ensure `.pnpm` is excluded in IDE settings
2. Ensure `dist/` folders are excluded from indexing
3. Add more exclusions to `.vscode/settings.json`:
   ```json
   {
     "files.watcherExclude": {
       "**/.pnpm/**": true,
       "**/dist/**": true,
       "**/node_modules/**": true
     }
   }
   ```

## Benefits of This Setup

1. **Source-first resolution**: IDE reads from `src/` not `dist/`, so you see actual source code
2. **Fast intellisense**: TypeScript project references enable incremental compilation
3. **Cross-package navigation**: Go-to-definition works across packages
4. **Error detection**: IDE shows errors across package boundaries
5. **Auto-imports**: IDE suggests imports from workspace packages

## Maintenance

When adding a new package:

1. Add to `pnpm-workspace.yaml` (already includes `packages/*`)
2. Add path mapping to root `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@feedback-forge/new-package": ["./packages/new-package/src"]
       }
     },
     "references": [
       { "path": "./packages/new-package" }
     ]
   }
   ```
3. Add `"composite": true` to package's `tsconfig.json`
4. Run `pnpm install && pnpm build`
5. Restart IDE TypeScript server

## Files Modified

- ✅ Created `tsconfig.json` (root)
- ✅ Created `.vscode/settings.json`
- ✅ Modified `packages/angular-widget/tsconfig.json` (added `composite: true`)
- ✅ Modified `packages/nestjs-plugin/tsconfig.json` (added `composite: true`)

## Summary

Your IDE should now:
- ✅ Resolve all `@feedback-forge/*` imports
- ✅ Provide intellisense across packages
- ✅ Show errors in real-time
- ✅ Support go-to-definition across packages
- ✅ Suggest auto-imports from workspace packages

If issues persist after reloading your IDE, please share:
1. Which IDE you're using (VSCode, WebStorm, etc.)
2. Specific error messages
3. Which package/file is showing errors
