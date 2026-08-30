<script>
	import { useClerkContext } from 'svelte-clerk/client';

	/**
	 * Always-visible account control.
	 * @type {{
	 *   email?: string;
	 *   afterSignOutUrl?: string;
	 *   signOutHref?: string;
	 *   signOutHint?: string;
	 * }}
	 */
	let {
		email = '',
		afterSignOutUrl = 'https://sagahalla.com',
		signOutHref = '/logout',
		signOutHint = 'Returning to sagahalla.com'
	} = $props();

	const ctx = useClerkContext();
	let open = $state(false);
	let busy = $state(false);
	let signingOut = $state(false);

	const displayEmail = $derived(
		email ||
			ctx.user?.primaryEmailAddress?.emailAddress ||
			ctx.user?.emailAddresses?.[0]?.emailAddress ||
			''
	);
	const initial = $derived((displayEmail[0] || '?').toUpperCase());
	const imageUrl = $derived(ctx.user?.imageUrl || '');

	function eventInsideMenu(event) {
		const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
		for (const node of path) {
			if (node instanceof Element && node.closest('[data-user-menu]')) return true;
		}
		const node = event.target;
		if (node instanceof Element) return Boolean(node.closest('[data-user-menu]'));
		if (node instanceof Node && node.parentElement) {
			return Boolean(node.parentElement.closest('[data-user-menu]'));
		}
		return false;
	}

	/** @returns {Promise<any>} */
	function waitForClerk(timeoutMs = 8000) {
		if (typeof window === 'undefined') return Promise.resolve(null);
		const existing = ctx.clerk || window.Clerk;
		if (existing && (existing.loaded || existing.signOut || existing.openUserProfile)) {
			return Promise.resolve(existing);
		}
		return new Promise((resolve) => {
			const start = Date.now();
			const poll = setInterval(() => {
				const clerk = ctx.clerk || window.Clerk;
				if (clerk && (clerk.loaded || clerk.signOut || clerk.openUserProfile)) {
					clearInterval(poll);
					resolve(clerk);
				} else if (Date.now() - start >= timeoutMs) {
					clearInterval(poll);
					resolve(clerk || null);
				}
			}, 50);
		});
	}

	function toggle(event) {
		event.stopPropagation();
		open = !open;
	}

	async function manageAccount(event) {
		event?.stopPropagation();
		if (busy) return;
		busy = true;
		try {
			const clerk = await waitForClerk();
			open = false;
			if (typeof clerk?.openUserProfile === 'function') {
				clerk.openUserProfile();
				return;
			}
			console.error('Manage account unavailable — Clerk profile UI did not load');
		} finally {
			busy = false;
		}
	}

	async function signOut(event) {
		event?.stopPropagation();
		if (busy || typeof window === 'undefined') return;
		busy = true;
		signingOut = true;
		open = false;
		window.location.assign(signOutHref || afterSignOutUrl);
	}
</script>

<svelte:window
	onclick={(event) => {
		if (eventInsideMenu(event)) return;
		open = false;
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape') open = false;
	}}
/>

<div class="relative flex items-center gap-3" data-user-menu>
	<button
		type="button"
		class="text-sm font-medium text-zinc-400 no-underline transition-colors hover:text-[#ce711e] disabled:opacity-60"
		disabled={busy}
		onclick={signOut}
	>
		{signingOut ? 'Signing out…' : 'Sign out'}
	</button>
	<button
		type="button"
		class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ce711e]/50 bg-[#ce711e]/15 text-sm font-semibold text-[#ce711e]"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label="Account"
		onclick={toggle}
	>
		{#if imageUrl}
			<img src={imageUrl} alt="" class="h-9 w-9 object-cover" />
		{:else}
			{initial}
		{/if}
	</button>
	{#if open}
		<div
			class="absolute right-0 top-full z-50 mt-2 min-w-44 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-2xl"
			role="menu"
		>
			{#if displayEmail}
				<p class="truncate px-3 py-1.5 text-[11px] text-zinc-500">{displayEmail}</p>
			{/if}
			<button
				type="button"
				class="block w-full px-3 py-2 text-left text-sm text-zinc-100 hover:bg-white/5 disabled:opacity-60"
				role="menuitem"
				disabled={busy}
				onclick={manageAccount}
			>
				Manage account
			</button>
			<button
				type="button"
				class="block w-full px-3 py-2 text-left text-sm text-zinc-100 hover:bg-white/5 disabled:opacity-60"
				role="menuitem"
				disabled={busy}
				onclick={signOut}
			>
				Sign out
			</button>
		</div>
	{/if}
</div>

{#if signingOut}
	<div
		class="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-3 bg-zinc-950/90 backdrop-blur-sm"
		role="status"
		aria-live="assertive"
	>
		<div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#ce711e]"></div>
		<p class="text-sm font-semibold tracking-wide text-zinc-100">Signing out…</p>
		{#if signOutHint}
			<p class="text-xs text-zinc-500">{signOutHint}</p>
		{/if}
	</div>
{/if}
