<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { MidiData } from '../types/index.js';

	const dispatch = createEventDispatcher<{
		fileSelected: { file: File; data: MidiData };
		error: { message: string };
	}>();

	let dragActive = false;
	let fileInput: HTMLInputElement;
	let isLoading = false;

	// Accept only MIDI files
	const ACCEPTED_TYPES = '.mid,.midi,audio/midi,audio/x-midi';

	async function handleFiles(files: FileList | null) {
		if (!files || files.length === 0) return;

		const file = files[0];

		// Validate file type
		if (!file.name.toLowerCase().match(/\.(mid|midi)$/)) {
			dispatch('error', { message: 'Please select a MIDI file (.mid or .midi)' });
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			dispatch('error', { message: 'File size too large. Maximum size is 10MB.' });
			return;
		}

		try {
			isLoading = true;

			// Import PianoRollCore dynamically to handle SSR
			const { PianoRollCore } = await import('../core/PianoRollCore.js');
			const core = new PianoRollCore();

			// Parse MIDI file
			const midiData = await core.parseMIDI(file);
			
			dispatch('fileSelected', { file, data: midiData });
			
			// Clean up
			core.dispose();
		} catch (error) {
			console.error('Error parsing MIDI file:', error);
			dispatch('error', { 
				message: `Error parsing MIDI file: ${error instanceof Error ? error.message : 'Unknown error'}` 
			});
		} finally {
			isLoading = false;
			// Reset file input
			if (fileInput) {
				fileInput.value = '';
			}
		}
	}

	function handleFileInput(event: Event) {
		const target = event.target as HTMLInputElement;
		handleFiles(target.files);
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
		handleFiles(event.dataTransfer?.files || null);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		// Only deactivate if leaving the component entirely
		if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
			dragActive = false;
		}
	}

	function openFileDialog() {
		if (!isLoading) {
			fileInput.click();
		}
	}
</script>

<div class="midi-upload">
	<input
		bind:this={fileInput}
		type="file"
		accept={ACCEPTED_TYPES}
		on:change={handleFileInput}
		class="sr-only"
		id="midi-file-input"
		disabled={isLoading}
	/>

	<div
		class="upload-area"
		class:drag-active={dragActive}
		class:loading={isLoading}
		on:drop={handleDrop}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:click={openFileDialog}
		on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
		role="button"
		tabindex="0"
		aria-label="Upload MIDI file"
	>
		{#if isLoading}
			<div class="loading-content">
				<div class="spinner" aria-hidden="true"></div>
				<p>Parsing MIDI file...</p>
			</div>
		{:else}
			<div class="upload-content">
				<svg class="upload-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
					<path d="M12,12L16,16H13V19H11V16H8L12,12Z" />
				</svg>
				<h3>Upload MIDI File</h3>
				<p class="upload-description">
					Drop a MIDI file here or click to select
				</p>
				<p class="file-info">
					Supported formats: .mid, .midi (max 10MB)
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.midi-upload {
		@apply w-full;
	}

	.upload-area {
		@apply relative w-full min-h-48 border-2 border-dashed rounded-xl
			border-surface-300 bg-surface-50 hover:border-primary-400 hover:bg-primary-50
			transition-colors duration-200 cursor-pointer
			flex items-center justify-center p-6
			focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
	}

	.upload-area.drag-active {
		@apply border-primary-500 bg-primary-100 scale-[1.02];
	}

	.upload-area.loading {
		@apply cursor-not-allowed opacity-75;
	}

	.upload-content {
		@apply text-center space-y-4;
	}

	.upload-icon {
		@apply w-16 h-16 mx-auto text-surface-400;
	}

	.upload-area:hover .upload-icon {
		@apply text-primary-500;
	}

	.upload-area h3 {
		@apply text-lg font-semibold text-surface-900;
	}

	.upload-description {
		@apply text-surface-600;
	}

	.file-info {
		@apply text-sm text-surface-500;
	}

	.loading-content {
		@apply text-center space-y-4;
	}

	.spinner {
		@apply w-8 h-8 mx-auto border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin;
	}

	.loading-content p {
		@apply text-surface-600 font-medium;
	}

	/* Dark mode styles */
	:global(.dark) .upload-area {
		@apply border-surface-700 bg-surface-900 hover:border-primary-500 hover:bg-primary-950;
	}

	:global(.dark) .upload-area.drag-active {
		@apply border-primary-400 bg-primary-900;
	}

	:global(.dark) .upload-icon {
		@apply text-surface-500;
	}

	:global(.dark) .upload-area:hover .upload-icon {
		@apply text-primary-400;
	}

	:global(.dark) .upload-area h3 {
		@apply text-surface-100;
	}

	:global(.dark) .upload-description {
		@apply text-surface-300;
	}

	:global(.dark) .file-info {
		@apply text-surface-400;
	}

	:global(.dark) .loading-content p {
		@apply text-surface-300;
	}

	:global(.dark) .spinner {
		@apply border-primary-800 border-t-primary-400;
	}
</style>
