<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SynthType } from '../types/index.js';

	const dispatch = createEventDispatcher<{
		typeChange: SynthType;
		enableChange: boolean;
	}>();

	export let synthType: SynthType = 'default';
	export let useSynth = true;
	export let disabled = false;

	interface SynthOption {
		value: SynthType;
		label: string;
		description: string;
		characteristics: string[];
		icon: string;
	}

	const synthOptions: SynthOption[] = [
		{
			value: 'default',
			label: 'Triangle Synth',
			description: 'Basic triangle wave with ADSR envelope',
			characteristics: ['Clean', 'Balanced', 'Musical'],
			icon: '△'
		},
		{
			value: 'fm',
			label: 'FM Synthesis',
			description: 'Frequency modulation for complex timbres',
			characteristics: ['Rich harmonics', 'Metallic', 'Expressive'],
			icon: '⟲'
		},
		{
			value: 'am',
			label: 'AM Synthesis',
			description: 'Amplitude modulation for tremolo effects',
			characteristics: ['Warm', 'Tremolo', 'Vintage'],
			icon: '〰'
		},
		{
			value: 'membrane',
			label: 'Membrane Synth',
			description: 'Percussive membrane simulation',
			characteristics: ['Percussive', 'Decay', 'Drum-like'],
			icon: '○'
		}
	];

	function handleTypeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newType = target.value as SynthType;
		synthType = newType;
		dispatch('typeChange', newType);
	}

	function handleEnableChange() {
		useSynth = !useSynth;
		dispatch('enableChange', useSynth);
	}

	// Get current option for detailed display
	$: currentOption = synthOptions.find(option => option.value === synthType) || synthOptions[0];
</script>

<div class="synth-controls">
	<!-- Enable/Disable Toggle -->
	<div class="synth-toggle">
		<label class="toggle-label">
			<input
				type="checkbox"
				bind:checked={useSynth}
				{disabled}
				on:change={handleEnableChange}
				class="sr-only"
			/>
			<div class="toggle-switch" class:active={useSynth}>
				<div class="toggle-indicator"></div>
			</div>
			<div class="toggle-text">
				<span class="toggle-title">Audio Synthesis</span>
				<span class="toggle-description">
					{useSynth ? 'Enabled - will play audio' : 'Disabled - silent mode'}
				</span>
			</div>
		</label>
	</div>

	<!-- Synthesizer Type Selection -->
	<fieldset class="synth-types" class:disabled={!useSynth || disabled}>
		<legend class="types-legend">Synthesizer Type</legend>
		
		<div class="synth-grid">
			{#each synthOptions as option (option.value)}
				<label class="synth-option" class:selected={synthType === option.value}>
					<input
						type="radio"
						name="synth-type"
						value={option.value}
						bind:group={synthType}
						disabled={!useSynth || disabled}
						on:change={handleTypeChange}
						class="sr-only"
					/>
					
					<div class="option-card">
						<div class="option-header">
							<span class="option-icon" aria-hidden="true">{option.icon}</span>
							<h3 class="option-title">{option.label}</h3>
						</div>
						
						<p class="option-description">{option.description}</p>
						
						<div class="option-characteristics">
							{#each option.characteristics as characteristic}
								<span class="characteristic-tag">{characteristic}</span>
							{/each}
						</div>
					</div>
				</label>
			{/each}
		</div>
	</fieldset>

	<!-- Audio Context Info -->
	{#if useSynth && !disabled}
		<div class="audio-info">
			<svg class="info-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
			</svg>
			<div class="info-text">
				<p class="info-title">Audio Context Required</p>
				<p class="info-description">
					Click the play button to start audio context. Some browsers require user interaction before audio can play.
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.synth-controls {
		@apply space-y-6;
	}

	/* Toggle Switch */
	.synth-toggle {
		@apply border border-surface-200 rounded-lg p-4;
	}

	.toggle-label {
		@apply flex items-center space-x-3 cursor-pointer;
	}

	.toggle-switch {
		@apply relative w-12 h-6 bg-surface-300 rounded-full transition-colors duration-200;
	}

	.toggle-switch.active {
		@apply bg-primary-500;
	}

	.toggle-indicator {
		@apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
			transition-transform duration-200;
	}

	.toggle-switch.active .toggle-indicator {
		@apply transform translate-x-6;
	}

	.toggle-text {
		@apply flex flex-col;
	}

	.toggle-title {
		@apply text-sm font-medium text-surface-900;
	}

	.toggle-description {
		@apply text-xs text-surface-600;
	}

	/* Synthesizer Types */
	.synth-types {
		@apply border-0 m-0 p-0;
	}

	.synth-types.disabled {
		@apply opacity-50;
	}

	.types-legend {
		@apply text-sm font-medium text-surface-900 mb-3;
	}

	.synth-grid {
		@apply grid grid-cols-1 md:grid-cols-2 gap-3;
	}

	.synth-option {
		@apply cursor-pointer;
	}

	.synth-option.selected .option-card {
		@apply border-primary-500 bg-primary-50 ring-2 ring-primary-500;
	}

	.option-card {
		@apply border border-surface-200 rounded-lg p-4 space-y-3
			hover:border-primary-300 hover:bg-primary-25
			transition-all duration-200;
	}

	.option-header {
		@apply flex items-center space-x-2;
	}

	.option-icon {
		@apply text-lg text-primary-600 font-mono;
	}

	.option-title {
		@apply text-sm font-semibold text-surface-900;
	}

	.option-description {
		@apply text-xs text-surface-600 leading-relaxed;
	}

	.option-characteristics {
		@apply flex flex-wrap gap-1;
	}

	.characteristic-tag {
		@apply px-2 py-1 text-xs bg-surface-100 text-surface-700 rounded-full;
	}

	.synth-option.selected .characteristic-tag {
		@apply bg-primary-100 text-primary-700;
	}

	/* Audio Info */
	.audio-info {
		@apply flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg;
	}

	.info-icon {
		@apply w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5;
	}

	.info-text {
		@apply space-y-1;
	}

	.info-title {
		@apply text-sm font-medium text-amber-800;
	}

	.info-description {
		@apply text-xs text-amber-700 leading-relaxed;
	}

	/* Dark mode styles */
	:global(.dark) .synth-toggle {
		@apply border-surface-700;
	}

	:global(.dark) .toggle-title {
		@apply text-surface-100;
	}

	:global(.dark) .toggle-description {
		@apply text-surface-400;
	}

	:global(.dark) .toggle-switch {
		@apply bg-surface-600;
	}

	:global(.dark) .toggle-switch.active {
		@apply bg-primary-500;
	}

	:global(.dark) .types-legend {
		@apply text-surface-100;
	}

	:global(.dark) .option-card {
		@apply border-surface-700 hover:border-primary-400 hover:bg-primary-950;
	}

	:global(.dark) .synth-option.selected .option-card {
		@apply border-primary-400 bg-primary-900 ring-primary-400;
	}

	:global(.dark) .option-icon {
		@apply text-primary-400;
	}

	:global(.dark) .option-title {
		@apply text-surface-100;
	}

	:global(.dark) .option-description {
		@apply text-surface-300;
	}

	:global(.dark) .characteristic-tag {
		@apply bg-surface-800 text-surface-300;
	}

	:global(.dark) .synth-option.selected .characteristic-tag {
		@apply bg-primary-800 text-primary-200;
	}

	:global(.dark) .audio-info {
		@apply bg-amber-950 border-amber-800;
	}

	:global(.dark) .info-icon {
		@apply text-amber-400;
	}

	:global(.dark) .info-title {
		@apply text-amber-200;
	}

	:global(.dark) .info-description {
		@apply text-amber-300;
	}
</style>
