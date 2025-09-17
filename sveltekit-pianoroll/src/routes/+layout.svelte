<script lang="ts">
	import { onMount } from 'svelte';
	import { theme, THEME_OPTIONS } from '../lib/stores/theme.js';
	import '../app.css';

	let themeCleanup: (() => void) | undefined;

	onMount(() => {
		// Initialize theme system
		themeCleanup = theme.initTheme();
		
		return () => {
			themeCleanup?.();
		};
	});

	function handleThemeChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		theme.setTheme(target.value as any);
	}
</script>

<div class="app-layout">
	<!-- Header -->
	<header class="app-header">
		<div class="header-content">
			<div class="header-brand">
				<div class="brand-icon">
					<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
					</svg>
				</div>
				<div class="brand-text">
					<h1 class="brand-title">Piano Roll</h1>
					<p class="brand-subtitle">MIDI Parser & Tuning Systems</p>
				</div>
			</div>

			<div class="header-controls">
				<!-- Theme Selector -->
				<div class="theme-selector">
					<label for="theme-select" class="sr-only">Theme</label>
					<select
						id="theme-select"
						value={$theme}
						on:change={handleThemeChange}
						class="theme-select"
						aria-label="Choose theme"
					>
						{#each THEME_OPTIONS as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
					
					<!-- Theme icon -->
					<div class="theme-icon">
						{#if $theme === 'light'}
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
							</svg>
						{:else if $theme === 'dark'}
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
							</svg>
						{:else}
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="app-main">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="app-footer">
		<div class="footer-content">
			<div class="footer-info">
				<p class="footer-text">
					Built with <span class="text-red-500">♥</span> using SvelteKit, TypeScript & Tailwind CSS
				</p>
			</div>
			<div class="footer-links">
				<a 
					href="https://github.com/tonejs/Tone.js" 
					target="_blank" 
					rel="noopener noreferrer" 
					class="footer-link"
				>
					Tone.js
				</a>
				<span class="link-separator">•</span>
				<a 
					href="https://github.com/tonaljs/tonal" 
					target="_blank" 
					rel="noopener noreferrer" 
					class="footer-link"
				>
					Tonal.js
				</a>
				<span class="link-separator">•</span>
				<a 
					href="https://github.com/Tonejs/Midi" 
					target="_blank" 
					rel="noopener noreferrer" 
					class="footer-link"
				>
					MIDI.js
				</a>
			</div>
		</div>
	</footer>
</div>

<style>
	.app-layout {
		@apply min-h-screen flex flex-col bg-surface-25;
	}

	/* Header */
	.app-header {
		@apply sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-200 shadow-sm;
	}

	.header-content {
		@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between;
	}

	.header-brand {
		@apply flex items-center space-x-3;
	}

	.brand-icon {
		@apply w-8 h-8 text-primary-600 flex-shrink-0;
	}

	.brand-icon svg {
		@apply w-full h-full;
	}

	.brand-text {
		@apply space-y-0;
	}

	.brand-title {
		@apply text-lg font-bold text-surface-900 leading-tight;
	}

	.brand-subtitle {
		@apply text-xs text-surface-600 leading-tight;
	}

	.header-controls {
		@apply flex items-center space-x-4;
	}

	/* Theme selector */
	.theme-selector {
		@apply relative flex items-center;
	}

	.theme-select {
		@apply appearance-none bg-transparent border-0 text-surface-700 text-sm font-medium
			pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1;
	}

	.theme-icon {
		@apply absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none;
	}

	/* Main content */
	.app-main {
		@apply flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8;
	}

	/* Footer */
	.app-footer {
		@apply mt-auto border-t border-surface-200 bg-surface-50;
	}

	.footer-content {
		@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2;
	}

	.footer-info {
		@apply text-center sm:text-left;
	}

	.footer-text {
		@apply text-xs text-surface-600;
	}

	.footer-links {
		@apply flex items-center justify-center sm:justify-end space-x-2 text-xs;
	}

	.footer-link {
		@apply text-primary-600 hover:text-primary-500 transition-colors duration-200;
	}

	.link-separator {
		@apply text-surface-400;
	}

	/* Dark mode styles */
	:global(.dark) .app-layout {
		@apply bg-surface-925;
	}

	:global(.dark) .app-header {
		@apply bg-surface-900/80 border-surface-800;
	}

	:global(.dark) .brand-icon {
		@apply text-primary-400;
	}

	:global(.dark) .brand-title {
		@apply text-surface-100;
	}

	:global(.dark) .brand-subtitle {
		@apply text-surface-400;
	}

	:global(.dark) .theme-select {
		@apply text-surface-300;
	}

	:global(.dark) .theme-icon {
		@apply text-surface-400;
	}

	:global(.dark) .app-footer {
		@apply border-surface-800 bg-surface-900;
	}

	:global(.dark) .footer-text {
		@apply text-surface-400;
	}

	:global(.dark) .footer-link {
		@apply text-primary-400 hover:text-primary-300;
	}

	:global(.dark) .link-separator {
		@apply text-surface-600;
	}
</style>
