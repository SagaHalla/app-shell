/**
 * Brand tokens for the app shell. Pass these into appearance and chrome so the
 * shell stays product-agnostic. Each product still uses its **own** Clerk
 * application (own publishable + secret keys).
 */
export type BrandTheme = {
	/** Display name in chrome and Clerk localization */
	name: string;
	/** Public site origin, no trailing slash */
	siteHome: string;
	/** Header / gate logo path (served from the consuming app's static/) */
	logoSrc: string;
	logoAlt: string;
	/** Accent used in chrome and Clerk primary */
	accent: string;
	/** Hover / secondary accent */
	accentHover: string;
};

/** Default SagaHalla product brand (app.sagahalla.com, marketing portal). */
export const SAGAHALLA_BRAND: BrandTheme = {
	name: 'SagaHalla',
	siteHome: 'https://sagahalla.com',
	logoSrc: '/sagahalla-logo.png',
	logoAlt: 'SagaHalla',
	accent: 'var(--saga-accent, #ce711e)',
	accentHover: 'var(--saga-accent-hover, #e6812e)'
};

/** Placeholder Kviser Institute brand — visual system not settled. */
export const KVISER_BRAND: BrandTheme = {
	name: 'Kviser Institute',
	siteHome: 'https://kviser.org',
	logoSrc: '/kviser-mark.svg',
	logoAlt: 'Kviser Institute',
	accent: '#2dd4bf',
	accentHover: '#5eead4'
};

export function siteHomeFromEnv(fromEnv?: string | null, fallback = SAGAHALLA_BRAND.siteHome): string {
	return String(fromEnv || fallback).replace(/\/$/, '');
}

/** @deprecated Prefer {@link SAGAHALLA_BRAND}.siteHome or {@link siteHomeFromEnv}. */
export const SAGAHALLA_SITE_HOME = SAGAHALLA_BRAND.siteHome;

/** @deprecated Prefer {@link siteHomeFromEnv}. */
export function sagahallaSiteHome(fromEnv?: string | null): string {
	return siteHomeFromEnv(fromEnv, SAGAHALLA_BRAND.siteHome);
}
