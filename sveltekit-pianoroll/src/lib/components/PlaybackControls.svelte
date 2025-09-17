<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		play: void;
		stop: void;
	}>();

	export let isPlaying = false;
	export let disabled = false;
	export let hasNotes = false;
	export let noteCount = 0;
	export let duration = 0;

	function handlePlay() {
		if (!disabled && hasNotes) {
			dispatch('play');
		}
	}

	function handleStop() {
		if (!disabled) {
			dispatch('stop');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === ' ') {
			event.preventDefault();
			if (isPlaying) {
				handleStop();
			} else {
				handlePlay();
			}
		}
	}

	// Format duration in minutes:seconds
	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	$: canPlay = !disabled && hasNotes && !isPlaying;
	$: canStop = !disabled && isPlaying;
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="playback-controls">
	<!-- Main Control Buttons -->
	<div class="control-buttons">
		<button
			class="play-button"
			class:playing={isPlaying}
			disabled={!canPlay}
			on:click={handlePlay}
			aria-label={isPlaying ? 'Playing' : 'Play MIDI'}
			title="Play (Spacebar)"
		>
			{#if isPlaying}
				<!-- Playing animation -->
				<div class="playing-indicator">
					<div class="bar"></div>
					<div class="bar"></div>
					<div class="bar"></div>
				</div>
			{:else}
				<!-- Play icon -->
				<svg class="control-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M8 5v14l11-7z" />
				</svg>
			{/if}
		</button>

		<button
			class="stop-button"
			disabled={!canStop}
			on:click={handleStop}
			aria-label="Stop playback"
			title="Stop"
		>
			<svg class="control-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M6 6h12v12H6z" />
			</svg>
		</button>
	</div>

	<!-- Track Information -->
	<div class="track-info">
		{#if hasNotes}
			<div class="info-item">
				<svg class="info-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
				</svg>
				<span class="info-text">
					{noteCount} note{noteCount !== 1 ? 's' : ''}
				</span>
			</div>

			{#if duration > 0}
				<div class="info-item">
					<svg class="info-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clip-rule="evenodd" />
					</svg>
					<span class="info-text">
						{formatDuration(duration)}
					</span>
				</div>
			{/if}

			<!-- Status indicator -->
			<div class="status-indicator" class:active={isPlaying}>
				<div class="status-dot"></div>
				<span class="status-text">
					{isPlaying ? 'Playing' : 'Ready'}
				</span>
			</div>
		{:else}
			<div class="no-content">
				<svg class="no-content-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026l-.345-.666a.75.75 0 00-1.286.78l1.04 2.015a.75.75 0 001.16.296 5 5 0 10-2.379-6.39z" clip-rule="evenodd" />
				</svg>
				<span class="no-content-text">No MIDI file loaded</span>
			</div>
		{/if}
	</div>

	<!-- Keyboard shortcut hint -->
	<div class="shortcut-hint">
		<kbd class="kbd">Space</kbd>
		<span class="hint-text">to play/stop</span>
	</div>
</div>

<style>
	.playback-controls {
		@apply flex flex-col sm:flex-row items-center justify-between
			gap-4 p-4 bg-surface-50 border border-surface-200 rounded-lg;
	}

	.control-buttons {
		@apply flex items-center space-x-2;
	}

	.play-button, .stop-button {
		@apply flex items-center justify-center w-12 h-12 rounded-full
			transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
	}

	.play-button {
		@apply bg-primary-500 text-white hover:bg-primary-600
			focus:ring-primary-500 shadow-lg hover:shadow-xl
			transform hover:scale-105;
	}

	.play-button:disabled {
		@apply bg-surface-300 text-surface-500 cursor-not-allowed
			hover:bg-surface-300 hover:scale-100 shadow-none;
	}

	.play-button.playing {
		@apply bg-green-500 hover:bg-green-600 focus:ring-green-500;
	}

	.stop-button {
		@apply bg-red-500 text-white hover:bg-red-600
			focus:ring-red-500 shadow-md hover:shadow-lg;
	}

	.stop-button:disabled {
		@apply bg-surface-300 text-surface-500 cursor-not-allowed
			hover:bg-surface-300 shadow-none;
	}

	.control-icon {
		@apply w-6 h-6;
	}

	/* Playing animation */
	.playing-indicator {
		@apply flex items-end space-x-1 h-6;
	}

	.bar {
		@apply w-1 bg-white rounded-full animate-pulse;
		animation: playingBars 1.5s ease-in-out infinite;
	}

	.bar:nth-child(1) {
		animation-delay: 0s;
		height: 12px;
	}

	.bar:nth-child(2) {
		animation-delay: 0.3s;
		height: 16px;
	}

	.bar:nth-child(3) {
		animation-delay: 0.6s;
		height: 10px;
	}

	@keyframes playingBars {
		0%, 100% {
			opacity: 0.3;
			transform: scaleY(0.3);
		}
		50% {
			opacity: 1;
			transform: scaleY(1);
		}
	}

	/* Track info */
	.track-info {
		@apply flex items-center space-x-4 text-sm;
	}

	.info-item {
		@apply flex items-center space-x-1.5 text-surface-600;
	}

	.info-icon {
		@apply w-4 h-4 flex-shrink-0;
	}

	.info-text {
		@apply font-medium;
	}

	.status-indicator {
		@apply flex items-center space-x-1.5;
	}

	.status-dot {
		@apply w-2 h-2 rounded-full bg-surface-400 transition-colors duration-200;
	}

	.status-indicator.active .status-dot {
		@apply bg-green-400 animate-pulse;
	}

	.status-text {
		@apply text-surface-600 font-medium;
	}

	.status-indicator.active .status-text {
		@apply text-green-600;
	}

	.no-content {
		@apply flex items-center space-x-2 text-surface-500;
	}

	.no-content-icon {
		@apply w-4 h-4;
	}

	.no-content-text {
		@apply text-sm;
	}

	/* Keyboard shortcut hint */
	.shortcut-hint {
		@apply flex items-center space-x-2 text-xs text-surface-500;
	}

	.kbd {
		@apply px-2 py-1 bg-surface-200 border border-surface-300 rounded text-xs font-mono;
	}

	.hint-text {
		@apply font-medium;
	}

	/* Dark mode styles */
	:global(.dark) .playback-controls {
		@apply bg-surface-800 border-surface-700;
	}

	:global(.dark) .play-button:disabled {
		@apply bg-surface-700 text-surface-400;
	}

	:global(.dark) .stop-button:disabled {
		@apply bg-surface-700 text-surface-400;
	}

	:global(.dark) .info-item {
		@apply text-surface-300;
	}

	:global(.dark) .status-text {
		@apply text-surface-300;
	}

	:global(.dark) .status-indicator.active .status-text {
		@apply text-green-400;
	}

	:global(.dark) .status-dot {
		@apply bg-surface-500;
	}

	:global(.dark) .no-content {
		@apply text-surface-400;
	}

	:global(.dark) .shortcut-hint {
		@apply text-surface-400;
	}

	:global(.dark) .kbd {
		@apply bg-surface-700 border-surface-600;
	}
</style>
