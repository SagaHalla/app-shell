<script>
	/**
	 * Centered auth/gate frame. Brand is passed in.
	 * @type {{
	 *   title?: string;
	 *   subtitle?: string;
	 *   brandName?: string;
	 *   logoSrc?: string;
	 *   logoAlt?: string;
	 *   homeHref?: string;
	 *   accentClass?: string;
	 *   children?: import('svelte').Snippet;
	 *   footer?: import('svelte').Snippet;
	 * }}
	 */
	let {
		title = '',
		subtitle = '',
		brandName = 'SagaHalla',
		logoSrc = '/sagahalla-logo.png',
		logoAlt = 'SagaHalla',
		homeHref = 'https://sagahalla.com',
		accentClass = 'text-[var(--saga-accent,#ce711e)]',
		children,
		footer
	} = $props();
</script>

<div class="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-4 py-8 text-zinc-50">
	<div class="mb-8 flex flex-col items-center gap-3 text-center">
		{#if homeHref}
			<a href={homeHref} class="hover:opacity-90">
				<img src={logoSrc} alt={logoAlt} class="h-14 w-14 opacity-90" />
			</a>
		{:else}
			<img src={logoSrc} alt={logoAlt} class="h-14 w-14 opacity-90" />
		{/if}
		<span class="text-xl font-bold uppercase tracking-widest text-zinc-50">{brandName}</span>
		{#if title}
			<h1 class="mt-2 text-lg font-semibold text-zinc-100">{title}</h1>
		{/if}
		{#if subtitle}
			<p class="max-w-sm text-sm text-zinc-400">{subtitle}</p>
		{/if}
	</div>
	<div class="w-full max-w-sm">
		{#if children}
			{@render children()}
		{/if}
	</div>
	{#if footer}
		<div class="mt-8 max-w-sm text-center text-xs text-zinc-500 {accentClass}">
			{@render footer()}
		</div>
	{/if}
</div>
