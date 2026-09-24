# Plan 006: TypeScript Migration (Strict Mode)

**Category:** Code Quality  
**Leverage:** HIGH  
**Effort:** L  
**Risk:** MEDIUM  
**Depends On:** —  
**Base Commit:** `192477d`

## Problem

JavaScript lacks type safety. A senior-maintained reference site should use TypeScript strict mode to catch regressions at compile time, enable refactoring confidence, and serve as executable documentation.

## Current State

- 4 ES modules: `utils.js`, `charts.js`, `map.js`, `main.js`
- 1 unit test file: `tests/unit.test.mjs` (custom runner)
- 3 Playwright test files: smoke, a11y, visual (planned)
- No build step (intentional — zero config)
- ESLint flat config with `@eslint/js`
- Prettier for formatting

## Target: TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["assets/js/*"]
    }
  },
  "include": ["assets/js/**/*.ts", "tests/**/*.ts", "playwright.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## Implementation

### 1. Add TypeScript + type dependencies

```json
// package.json
"devDependencies": {
  ...
  "typescript": "^5.6.0",
  "@types/node": "^22.0.0",
  "@types/leaflet": "^1.9.0",
  "chart.js": "^4.4.0"  // already has types
},
"scripts": {
  ...
  "typecheck": "tsc --noEmit",
  "typecheck:watch": "tsc --noEmit --watch"
}
```

### 2. Create `tsconfig.json` at repo root (see above)

### 3. Rename & migrate source files

| From | To | Notes |
|------|-----|-------|
| `assets/js/utils.js` | `assets/js/utils.ts` | Add JSDoc → TS types |
| `assets/js/charts.js` | `assets/js/charts.ts` | Type Chart.js config, data JSON |
| `assets/js/map.js` | `assets/js/map.ts` | Type Leaflet, GeoJSON |
| `assets/js/main.js` | `assets/js/main.ts` | Type DOM APIs |
| `playwright.config.mjs` | `playwright.config.ts` | Type Playwright config |
| `tests/unit.test.mjs` | `tests/unit.test.ts` | Type test utilities |
| `tests/e2e/smoke.spec.mjs` | `tests/e2e/smoke.spec.ts` | Already typed via @playwright/test |
| `tests/e2e/a11y.spec.mjs` | `tests/e2e/a11y.spec.ts` | Already typed |

### 4. Type definitions for data JSON

**`types/data.d.ts`** (new file):
```typescript
export interface ChartFigure {
  id: string;
  type: 'line' | 'bar';
  labels: string[];
  series: number[];
  yMax?: number;
  yCallback?: 'thousands';
  tooltip: 'killed' | 'arrivals' | 'disruption days';
  unit: string;
  colors?: string[]; // logical color keys: 'ink', 'crimson', 'amber', 'green', 'ink-2'
}

export interface ChartsData {
  figures: ChartFigure[];
}

export interface MapPlace {
  c: [number, number]; // [lat, lon]
  cat: 'capital' | 'hotspot' | 'border' | 'node';
  name: string;
  role: string;
  note: string;
  stat: string;
}

export interface MapHighway {
  code: string;
  token: '--crimson' | '--ink';
  points: [number, number][];
}

export interface MapGeo {
  view: { center: [number, number]; zoom: number };
  places: MapPlace[];
  highways: MapHighway[];
}
```

### 5. Update ESLint for TypeScript

```javascript
// eslint.config.js additions
import tseslint from 'typescript-eslint';

// In export default array:
...tseslint.configs.recommended,
{
  files: ['**/*.ts', '**/*.mts'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: './tsconfig.json',
    },
  },
},
```

### 6. Update unit test runner for TypeScript

Option A: Use `tsx` (TypeScript execute) — no build step
```json
"devDependencies": { "tsx": "^4.19.0" },
"scripts": { "test": "tsx tests/unit.test.ts" }
```

Option B: Keep custom runner but add `tsc --noEmit` as pre-check

### 7. Add typecheck to CI

```yaml
# .github/workflows/ci.yml - in check job
- name: TypeScript check
  run: npm run typecheck
```

### 8. Migration steps (execute in order)

```bash
# 1. Install deps
npm i -D typescript @types/node @types/leaflet tsx

# 2. Create tsconfig.json
# 3. Create types/data.d.ts
# 4. Rename files .js → .ts, .mjs → .ts (tests)
# 4. Fix type errors iteratively:
npm run typecheck
# Fix errors → repeat until clean

# 5. Update imports in HTML (none — modules loaded via script type=module)
# 6. Update package.json scripts
# 7. Run full check
npm run check
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `tsconfig.json` | Create (new) |
| `types/data.d.ts` | Create (new) |
| `assets/js/utils.ts` | Rename + migrate from utils.js |
| `assets/js/charts.ts` | Rename + migrate from charts.js |
| `assets/js/map.ts` | Rename + migrate from map.js |
| `assets/js/main.ts` | Rename + migrate from main.js |
| `playwright.config.ts` | Rename + migrate from playwright.config.mjs |
| `tests/unit.test.ts` | Rename + migrate from unit.test.mjs |
| `tests/e2e/smoke.spec.ts` | Rename from smoke.spec.mjs |
| `tests/e2e/a11y.spec.ts` | Rename from a11y.spec.mjs |
| `eslint.config.js` | Add TypeScript support |
| `package.json` | Add deps, scripts |
| `.github/workflows/ci.yml` | Add typecheck step |

## Verification Commands

```bash
# Type check
npm run typecheck
# Must exit 0 with no errors

# Full test suite
npm run check
# All gates pass

# CI: typecheck job passes
```

## Done Criteria

- [ ] `npm run typecheck` passes with 0 errors (strict mode)
- [ ] All source files migrated to `.ts`
- [ ] Test files migrated to `.ts`
- [ ] Type definitions for data JSON created
- [ ] ESLint configured for TypeScript
- [ ] Typecheck added to CI
- [ ] All existing tests pass (`npm run check`)
- [ ] No `any` types (except intentional DOM interop)

## Escape Hatches

- If migration blocks: do incremental — rename one file at a time, fix types, commit
- If Leaflet types incomplete: add `declare module 'leaflet'` augmentations in `types/leaflet.d.ts`
- If Chart.js config typing complex: use `ChartConfiguration` from `chart.js` types
- If unit test runner breaks: switch to `vitest` with `tsx` (but adds deps)

## Maintenance Notes

- Run `npm run typecheck` before every commit (add pre-commit hook later)
- Keep `strict: true` — never disable
- Update `@types/*` when upgrading dependencies
- Use `satisfies` for config objects: `const config = { ... } satisfies ChartConfiguration`