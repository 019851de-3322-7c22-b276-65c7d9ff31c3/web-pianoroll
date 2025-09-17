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
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #fcfcfc;
	}

	/* Header */
	.app-header {
		position: sticky;
		top: 0;
		z-index: 50;
		background-color: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid #dcdcdc;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 1rem;
		height: 4rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.brand-icon {
		width: 2rem;
		height: 2rem;
		color: #2563eb;
		flex-shrink: 0;
	}

	.brand-icon svg {
		width: 100%;
		height: 100%;
	}

	.brand-text {
		gap: 0;
	}

	.brand-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #3d3d3d;
		line-height: 1.2;
		margin: 0;
	}

	.brand-subtitle {
		font-size: 0.75rem;
		color: #656565;
		line-height: 1.2;
		margin: 0;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* Theme selector */
	.theme-selector {
		position: relative;
		display: flex;
		align-items: center;
	}

	.theme-select {
		appearance: none;
		background: transparent;
		border: 0;
		color: #525252;
		font-size: 0.875rem;
		font-weight: 500;
		padding-right: 2rem;
		padding: 0.25rem 2rem 0.25rem 0.5rem;
		cursor: pointer;
		border-radius: 0.25rem;
	}

	.theme-select:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2563eb;
	}

	.theme-icon {
		position: absolute;
		right: 0.25rem;
		top: 50%;
		transform: translateY(-50%);
		width: 1rem;
		height: 1rem;
		color: #7c7c7c;
		pointer-events: none;
	}

	/* Main content */
	.app-main {
		flex: 1;
		max-width: 80rem;
		margin: 0 auto;
		width: 100%;
		padding: 2rem 1rem;
	}

	/* Footer */
	.app-footer {
		margin-top: auto;
		border-top: 1px solid #dcdcdc;
		background-color: #f9f9f9;
	}

	.footer-content {
		max-width: 80rem;
		margin: 0 auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	@media (min-width: 640px) {
		.header-content {
			padding: 0 1.5rem;
		}
		.app-main {
			padding: 2rem 1.5rem;
		}
		.footer-content {
			flex-direction: row;
			padding: 1rem 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.header-content {
			padding: 0 2rem;
		}
		.app-main {
			padding: 2rem;
		}
		.footer-content {
			padding: 1rem 2rem;
		}
	}

	.footer-info {
		text-align: center;
	}

	@media (min-width: 640px) {
		.footer-info {
			text-align: left;
		}
	}

	.footer-text {
		font-size: 0.75rem;
		color: #656565;
		margin: 0;
	}

	.footer-links {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.75rem;
	}

	@media (min-width: 640px) {
		.footer-links {
			justify-content: flex-end;
		}
	}

	.footer-link {
		color: #2563eb;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-link:hover {
		color: #1d4ed8;
	}

	.link-separator {
		color: #989898;
	}

	/* Dark mode styles */
	:global(.dark) .app-layout {
		background-color: #2a2a2a;
	}

	:global(.dark) .app-header {
		background-color: rgba(61, 61, 61, 0.8);
		border-bottom-color: #525252;
	}

	:global(.dark) .brand-icon {
		color: #60a5fa;
	}

	:global(.dark) .brand-title {
		color: #ffffff;
	}

	:global(.dark) .brand-subtitle {
		color: #989898;
	}

	:global(.dark) .theme-select {
		color: #d1d5db;
	}

	:global(.dark) .theme-icon {
		color: #989898;
	}

	:global(.dark) .app-footer {
		border-top-color: #525252;
		background-color: #3d3d3d;
	}

	:global(.dark) .footer-text {
		color: #989898;
	}

	:global(.dark) .footer-link {
		color: #60a5fa;
	}

	:global(.dark) .footer-link:hover {
		color: #93c5fd;
	}

	:global(.dark) .link-separator {
		color: #656565;
	}
</style>
