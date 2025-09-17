<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { TuningSystem } from '../types/index.js';

	const dispatch = createEventDispatcher<{
		change: TuningSystem;
	}>();

	export let value: TuningSystem = 'equal';
	export let disabled = false;

	interface TuningOption {
		value: TuningSystem;
		label: string;
		description: string;
		mathematical: string;
	}

	const tuningOptions: TuningOption[] = [
		{
			value: 'equal',
			label: 'Equal Temperament',
			description: 'Modern 12-tone equal temperament system',
			mathematical: '12√2 = 1.059463...'
		},
		{
			value: 'natural',
			label: 'Just Intonation',
			description: 'Pure intervals based on simple ratios',
			mathematical: 'C:D:E = 4:5:6'
		},
		{
			value: 'pythagorean',
			label: 'Pythagorean Tuning',
			description: 'Based on perfect fifths (3:2 ratio)',
			mathematical: 'Fifth = 3:2'
		},
		{
			value: 'pentatonic',
			label: 'Pentatonic Scale',
			description: 'Five-note scale with natural ratios',
			mathematical: 'C:D:E:G:A'
		}
	];

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newValue = target.value as TuningSystem;
		value = newValue;
		dispatch('change', newValue);
	}

	// Get current option for detailed display
	$: currentOption = tuningOptions.find(option => option.value === value) || tuningOptions[0];
</script>

<div class="tuning-selector">
	<label for="tuning-select" class="selector-label">
		<span class="label-text">Tuning System</span>
		<span class="label-description">Choose the musical tuning system for playback</span>
	</label>

	<div class="select-wrapper">
		<select
			id="tuning-select"
			{value}
			{disabled}
			on:change={handleChange}
			class="tuning-select"
			aria-describedby="tuning-description"
		>
			{#each tuningOptions as option (option.value)}
				<option value={option.value}>
					{option.label}
				</option>
			{/each}
		</select>
		
		<!-- Custom dropdown arrow -->
		<svg class="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
		</svg>
	</div>

	<!-- Detailed information about current selection -->
	<div id="tuning-description" class="tuning-info">
		<div class="info-header">
			<h4 class="info-title">{currentOption.label}</h4>
			<span class="mathematical-notation">{currentOption.mathematical}</span>
		</div>
		<p class="info-description">{currentOption.description}</p>
	</div>

	<!-- Audio visualization hint -->
	<div class="tuning-hint">
		<svg class="hint-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
		</svg>
		<p class="hint-text">
			Changing tuning systems affects how notes are calculated and played back.
			You'll hear the differences most clearly in chord progressions.
		</p>
	</div>
</div>

<style>
	.tuning-selector {
		@apply space-y-4;
	}

	.selector-label {
		@apply block space-y-1;
	}

	.label-text {
		@apply text-sm font-medium text-surface-900;
	}

	.label-description {
		@apply text-xs text-surface-600;
	}

	.select-wrapper {
		@apply relative;
	}

	.tuning-select {
		@apply w-full appearance-none bg-white border border-surface-300 rounded-lg
			px-3 py-2 pr-10 text-sm text-surface-900
			focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
			transition-colors duration-200 cursor-pointer;
	}

	.tuning-select:disabled {
		@apply bg-surface-100 text-surface-500 cursor-not-allowed opacity-75;
	}

	.dropdown-arrow {
		@apply absolute right-3 top-1/2 transform -translate-y-1/2
			w-4 h-4 text-surface-400 pointer-events-none;
	}

	.tuning-select:disabled + .dropdown-arrow {
		@apply text-surface-300;
	}

	.tuning-info {
		@apply bg-surface-50 border border-surface-200 rounded-lg p-4 space-y-2;
	}

	.info-header {
		@apply flex items-center justify-between;
	}

	.info-title {
		@apply text-sm font-semibold text-surface-900;
	}

	.mathematical-notation {
		@apply text-xs font-mono text-primary-600 bg-primary-100 px-2 py-1 rounded;
	}

	.info-description {
		@apply text-sm text-surface-700 leading-relaxed;
	}

	.tuning-hint {
		@apply flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg;
	}

	.hint-icon {
		@apply w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0;
	}

	.hint-text {
		@apply text-xs text-blue-700 leading-relaxed;
	}

	/* Dark mode styles */
	:global(.dark) .label-text {
		@apply text-surface-100;
	}

	:global(.dark) .label-description {
		@apply text-surface-400;
	}

	:global(.dark) .tuning-select {
		@apply bg-surface-800 border-surface-700 text-surface-100;
	}

	:global(.dark) .tuning-select:focus {
		@apply border-primary-400 ring-primary-400;
	}

	:global(.dark) .tuning-select:disabled {
		@apply bg-surface-900 text-surface-500;
	}

	:global(.dark) .dropdown-arrow {
		@apply text-surface-500;
	}

	:global(.dark) .tuning-select:disabled + .dropdown-arrow {
		@apply text-surface-600;
	}

	:global(.dark) .tuning-info {
		@apply bg-surface-800 border-surface-700;
	}

	:global(.dark) .info-title {
		@apply text-surface-100;
	}

	:global(.dark) .mathematical-notation {
		@apply text-primary-300 bg-primary-900;
	}

	:global(.dark) .info-description {
		@apply text-surface-300;
	}

	:global(.dark) .tuning-hint {
		@apply bg-blue-950 border-blue-800;
	}

	:global(.dark) .hint-icon {
		@apply text-blue-400;
	}

	:global(.dark) .hint-text {
		@apply text-blue-300;
	}
</style>
