import { dark } from '@clerk/themes';
import { SAGAHALLA_BRAND, type BrandTheme } from './brand';

export type ClerkAppearanceOpts = {
	brand?: Partial<BrandTheme>;
	showOptionalFields?: boolean;
};

/**
 * Clerk appearance from brand tokens. Each product must use its own Clerk
 * application — do not share keys across SagaHalla and Kviser.
 *
 * Element utility classes below match the default SagaHalla accent so Tailwind
 * in consuming apps can see static strings. `variables.colorPrimary` follows
 * `brand.accent` for Clerk's own theming.
 */
export function createClerkAppearance(opts: ClerkAppearanceOpts = {}) {
	const brand: BrandTheme = { ...SAGAHALLA_BRAND, ...opts.brand };
	const showOptionalFields = opts.showOptionalFields ?? true;
	const accent = brand.accent;
	const accentHover = brand.accentHover;

	return {
		baseTheme: dark,
		variables: {
			colorPrimary: accent,
			colorBackground: 'rgba(15, 23, 42, 0.96)',
			colorInputBackground: 'rgba(0, 0, 0, 0.55)',
			colorInputText: '#ffffff',
			colorText: '#ffffff',
			colorTextSecondary: 'rgba(255, 255, 255, 0.72)',
			colorDanger: '#ef4444',
			borderRadius: '12px'
		},
		layout: {
			logoImageUrl: brand.logoSrc,
			logoLinkUrl: brand.siteHome,
			showOptionalFields
		},
		elements: {
			rootBox: 'font-sans',
			card: 'bg-[#0f172a]/95 border border-white/10 shadow-2xl backdrop-blur-xl',
			userButtonPopoverCard: 'border border-white/10 bg-[#0f172a]/98 shadow-2xl backdrop-blur-xl',
			userProfileModalCard: 'border border-white/10 bg-[#0f172a]/98 shadow-2xl backdrop-blur-xl',
			userButtonPopoverActionButton: 'hover:bg-white/5',
			userButtonPopoverActionButtonText: 'text-white font-medium',
			userButtonPopoverActionButtonIcon: 'text-white/60',
			userButtonPopoverFooter: 'border-t border-white/10',
			userPreviewMainIdentifier: 'text-white font-semibold',
			userPreviewSecondaryIdentifier: 'text-white/60',
			// Static SagaHalla accent classes (Tailwind-scannable). Override via brand.accent in variables.
			userProfileSectionPrimaryButton: 'text-[var(--saga-accent,#ce711e)] hover:text-[var(--saga-accent-hover,#e6812e)] font-semibold',
			navbarButton:
				'text-white/60 hover:text-white hover:bg-white/5 data-[active=true]:text-[var(--saga-accent,#ce711e)] data-[active=true]:bg-[#ce711e]/10',
			profileSectionTitle: 'text-white font-semibold',
			profileSectionTitleText: 'text-white font-semibold',
			profileSectionContent: 'text-white/60',
			profileSectionPrimaryButton: 'text-[var(--saga-accent,#ce711e)] hover:text-[var(--saga-accent-hover,#e6812e)] font-semibold',
			badge: 'bg-[#ce711e]/10 text-[var(--saga-accent,#ce711e)] border border-[#ce711e]/25',
			scrollBox: 'bg-transparent',
			pageScrollBox: 'bg-transparent',
			headerTitle: 'text-white font-bold',
			headerSubtitle: 'text-white/60',
			socialButtonsBlockButton: 'border border-white/10 hover:bg-white/5 bg-black/50',
			socialButtonsBlockButtonText: 'text-white font-semibold',
			dividerLine: 'bg-white/10',
			dividerText: 'text-white/50',
			formFieldLabel: 'text-white/80',
			formFieldInput:
				'bg-black/60 border-white/10 text-white placeholder:text-white/40 focus:border-[#ce711e]',
			formButtonPrimary:
				'bg-[#ce711e] text-black font-bold hover:bg-[#e6812e] transition-colors shadow-md',
			footerActionText: 'text-white/60',
			footerActionLink: 'text-[var(--saga-accent,#ce711e)] hover:text-[var(--saga-accent-hover,#e6812e)] font-semibold',
			modalBackdrop: 'bg-black/75 backdrop-blur-sm',
			modalContent: 'border border-white/10 bg-[#0f172a]/98',
			navbar: 'border-r border-white/10 bg-black/40',
			formFieldAction: 'text-[var(--saga-accent,#ce711e)] hover:text-[var(--saga-accent-hover,#e6812e)]',
			identityPreviewEditButton: 'text-[var(--saga-accent,#ce711e)] hover:text-[var(--saga-accent-hover,#e6812e)]',
			menuButton: 'text-white/60 hover:text-white hover:bg-white/5',
			menuList: 'border border-white/10 bg-[#0f172a]/98',
			menuItem: 'hover:bg-white/5',
			menuItemText: 'text-white',
			tableHead: 'text-white/50',
			accordionTriggerButton: 'text-white hover:bg-white/5',
			footer: 'border-t border-white/10',
			alertText: 'text-white/80'
		}
	};
}

/** @deprecated Prefer {@link createClerkAppearance}. */
export function createSagaClerkAppearance(
	opts: { logoImageUrl?: string; showOptionalFields?: boolean } = {}
) {
	return createClerkAppearance({
		brand: {
			logoSrc: opts.logoImageUrl ?? SAGAHALLA_BRAND.logoSrc
		},
		showOptionalFields: opts.showOptionalFields
	});
}

export const sagaClerkAppearance = createClerkAppearance();

/**
 * Substitute the site name wherever Clerk would interpolate
 * `{{applicationName}}` from the Dashboard (not runtime-overridable).
 */
export function clerkLocalizationForSite(siteName: string) {
	const name = String(siteName || '').trim() || 'your account';
	const continueTo = `to continue to ${name}`;
	return {
		signIn: {
			start: {
				title: `Sign in to ${name}`,
				subtitle: continueTo
			},
			password: {
				subtitle: continueTo
			},
			emailCode: {
				subtitle: continueTo
			},
			phoneCode: {
				subtitle: continueTo
			},
			emailLink: {
				subtitle: continueTo
			}
		},
		signUp: {
			start: {
				title: `Create your ${name} account`,
				subtitle: continueTo
			},
			emailCode: {
				subtitle: continueTo
			},
			phoneCode: {
				subtitle: continueTo
			},
			emailLink: {
				subtitle: continueTo
			},
			continue: {
				subtitle: continueTo
			}
		}
	};
}

export const sagaClerkLocalization = clerkLocalizationForSite(SAGAHALLA_BRAND.name);
