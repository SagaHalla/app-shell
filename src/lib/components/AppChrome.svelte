<script>
	import UserMenu from './UserMenu.svelte';

	/**
	 * Signed-in chrome. Brand wordmark and accent are props.
	 * @type {{
	 *   appName?: string;
	 *   brandName?: string;
	 *   homeHref?: string;
	 *   logoSrc?: string;
	 *   logoAlt?: string;
	 *   accentClass?: string;
	 *   email?: string;
	 *   afterSignOutUrl?: string;
	 *   signOutHref?: string;
	 *   signOutHint?: string;
	 *   showUserButton?: boolean;
	 *   children?: import('svelte').Snippet;
	 *   nav?: import('svelte').Snippet;
	 *   actions?: import('svelte').Snippet;
	 *   footer?: import('svelte').Snippet;
	 * }}
	 */
	let {
		appName = 'SagaHalla',
		brandName = 'SagaHalla',
		homeHref = 'https://sagahalla.com',
		logoSrc = '/sagahalla-logo.png',
		logoAlt = 'SagaHalla',
		accentClass = 'text-[var(--saga-accent,#ce711e)]',
		email = '',
		afterSignOutUrl = 'https://sagahalla.com',
		signOutHref = '/logout',
		signOutHint = 'Returning to sagahalla.com',
		showUserButton = true,
		children,
		nav,
		actions,
		footer
	} = $props();
</script>

<div class="flex min-h-dvh flex-col bg-zinc-950 text-zinc-50">
	<header class="sticky top-0 z-40 relative border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
		<div class="flex w-full flex-wrap items-center gap-3 px-4 py-3 pr-28 sm:px-6 sm:pr-36">
			<a href={homeHref} class="mr-2 flex shrink-0 items-center gap-2 no-underline hover:opacity-90">
				<img src={logoSrc} alt={logoAlt} class="h-8 w-8" />
				<div class="leading-tight">
					<span class="block text-[10px] font-bold uppercase tracking-[0.28em] {accentClass}"
						>{brandName}</span
					>
					<span class="block text-sm font-semibold text-zinc-50">{appName}</span>
				</div>
			</a>
			{#if nav}
				<nav
					class="order-last flex w-full min-w-0 flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-400 sm:order-none sm:w-auto sm:flex-1"
				>
					{@render nav()}
				</nav>
			{:else}
				<div class="flex-1"></div>
			{/if}
			{#if actions}
				<div class="ml-auto flex shrink-0 items-center gap-3">
					{@render actions()}
				</div>
			{/if}
		</div>
		{#if showUserButton}
			<div class="absolute right-4 top-3 z-50 sm:right-6">
				<UserMenu {email} {afterSignOutUrl} {signOutHref} {signOutHint} />
			</div>
		{/if}
	</header>

	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
		{#if children}
			{@render children()}
		{/if}
	</main>

	{#if footer}
		<footer class="border-t border-white/10 px-4 py-6 text-xs leading-relaxed text-zinc-500 sm:px-6">
			<div class="mx-auto max-w-6xl">
				{@render footer()}
			</div>
		</footer>
	{/if}
</div>
