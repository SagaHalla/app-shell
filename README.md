# @saga/app-shell

Brandable **Svelte 5** + **svelte-clerk** chrome for SagaHalla product apps and
sister products (e.g. Kviser Institute).

| Export | Role |
| --- | --- |
| `SAGAHALLA_BRAND` / `KVISER_BRAND` / `BrandTheme` | Brand tokens (name, home, logo, accent) |
| `createClerkAppearance` / `sagaClerkAppearance` | Clerk look from brand tokens |
| `clerkLocalizationForSite` | Site-name copy for Clerk |
| `AuthGateShell` | Centered login / gate frame |
| `AppChrome` | Signed-in chrome with nav / footer slots |
| `UserMenu` | Sign out + avatar |

SagaHalla-named helpers (`createSagaClerkAppearance`, `sagahallaSiteHome`, …)
remain as thin aliases for existing apps.

## Install

```bash
# pnpm (git dependency — package is source-exported, no build step)
pnpm add github:SagaHalla/app-shell
```

Peer deps: `svelte` ^5.29, `svelte-clerk` ^1.1, `@clerk/themes` ^2.4.

If you use Tailwind v4, scan the package so utility classes in the shell resolve:

```css
@source '../node_modules/@saga/app-shell/src/**/*.svelte';
```

## Usage

```svelte
<script>
  import { ClerkProvider } from 'svelte-clerk/client';
  import {
    AppChrome,
    AuthGateShell,
    SAGAHALLA_BRAND,
    clerkLocalizationForSite,
    createClerkAppearance
  } from '@saga/app-shell';

  const appearance = createClerkAppearance({ brand: SAGAHALLA_BRAND });
  const localization = clerkLocalizationForSite(SAGAHALLA_BRAND.name);
</script>

<ClerkProvider {appearance} {localization} publishableKey={…} initialState={…}>
  <AuthGateShell brandName={SAGAHALLA_BRAND.name} title="Sign in">
    <!-- SignIn -->
  </AuthGateShell>

  <AppChrome appName="Marketing Portal" brandName={SAGAHALLA_BRAND.name}>
    {#snippet nav()}…{/snippet}
    {@render children()}
  </AppChrome>
</ClerkProvider>
```

## Clerk

Each product must use its **own** Clerk application. Do not reuse SagaHalla keys
in Kviser (or the reverse). The shell only styles chrome; keys stay in the app.

Serve the logo from each app’s `static/` (`/sagahalla-logo.png`, `/kviser-mark.svg`, …).

## License

MIT © SagaHalla

## Shared theme

Import `@saga/app-shell/theme/sagahalla.css` independently of app chrome. It
provides semantic CSS variables for SagaHalla colors, typography and common
radii, without Tailwind, Svelte, authentication or global element styles.
Consumers load their licensed font assets and map variables to their own
Tailwind theme; other brands can override variables in their scoped styles.
Keep financial/status colors and layout rules in the relevant application.
The SagaHalla website workspace carries a reproducible copy via
`scripts/sync-theme.py`; do not edit that generated copy independently.
