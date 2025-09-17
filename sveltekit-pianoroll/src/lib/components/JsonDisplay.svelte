<script lang="ts">
	import { onMount } from 'svelte';

	export let jsonData: string = '';
	export let label = 'JSON Output';
	export let maxHeight = '400px';

	let textareaElement: HTMLTextAreaElement;
	let copied = false;
	let copyTimeout: NodeJS.Timeout;

	// Pretty print JSON if it's valid
	$: formattedJson = (() => {
		if (!jsonData) return '';
		try {
			const parsed = JSON.parse(jsonData);
			return JSON.stringify(parsed, null, 2);
		} catch {
			return jsonData;
		}
	})();

	$: noteCount = (() => {
		if (!jsonData) return 0;
		try {
			const parsed = JSON.parse(jsonData);
			return parsed.notes?.length || 0;
		} catch {
			return 0;
		}
	})();

	$: dataSize = new Blob([formattedJson]).size;

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(formattedJson);
			copied = true;
			
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
			// Fallback: select text
			if (textareaElement) {
				textareaElement.select();
				textareaElement.setSelectionRange(0, 99999);
			}
		}
	}

	function downloadJson() {
		if (!formattedJson) return;

		const blob = new Blob([formattedJson], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `pianoroll-output-${new Date().getTime()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function selectAll() {
		if (textareaElement) {
			textareaElement.select();
			textareaElement.setSelectionRange(0, textareaElement.value.length);
		}
	}

	onMount(() => {
		return () => {
			if (copyTimeout) clearTimeout(copyTimeout);
		};
	});
</script>

<div class="json-display">
	<!-- Header with controls -->
	<div class="display-header">
		<div class="header-info">
			<h3 class="display-title">{label}</h3>
			{#if formattedJson}
				<div class="data-stats">
					<span class="stat-item">{noteCount} notes</span>
					<span class="stat-separator">•</span>
					<span class="stat-item">{formatBytes(dataSize)}</span>
				</div>
			{/if}
		</div>

		{#if formattedJson}
			<div class="header-controls">
				<button
					class="control-btn secondary"
					on:click={selectAll}
					title="Select all text"
				>
					<svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h3a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
					</svg>
					<span class="btn-text">Select</span>
				</button>

				<button
					class="control-btn secondary"
					class:success={copied}
					on:click={copyToClipboard}
					title="Copy to clipboard"
				>
					{#if copied}
						<svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
						<span class="btn-text">Copied!</span>
					{:else}
						<svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
							<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
						</svg>
						<span class="btn-text">Copy</span>
					{/if}
				</button>

				<button
					class="control-btn primary"
					on:click={downloadJson}
					title="Download as JSON file"
				>
					<svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
					<span class="btn-text">Download</span>
				</button>
			</div>
		{/if}
	</div>

	<!-- JSON Content -->
	<div class="display-content">
		{#if formattedJson}
			<textarea
				bind:this={textareaElement}
				value={formattedJson}
				readonly
				class="json-textarea"
				style="max-height: {maxHeight}"
				aria-label="JSON output"
				spellcheck="false"
			/>
		{:else}
			<div class="empty-state">
				<svg class="empty-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h3a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
				</svg>
				<div class="empty-text">
					<h4 class="empty-title">No data to display</h4>
					<p class="empty-description">
						Upload and parse a MIDI file to see the JSON output here.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.json-display {
		@apply border border-surface-200 rounded-lg overflow-hidden;
	}

	.display-header {
		@apply flex flex-col sm:flex-row sm:items-center sm:justify-between
			gap-3 p-4 bg-surface-50 border-b border-surface-200;
	}

	.header-info {
		@apply space-y-1;
	}

	.display-title {
		@apply text-sm font-semibold text-surface-900;
	}

	.data-stats {
		@apply flex items-center space-x-2 text-xs text-surface-600;
	}

	.stat-item {
		@apply font-medium;
	}

	.stat-separator {
		@apply text-surface-400;
	}

	.header-controls {
		@apply flex items-center space-x-2;
	}

	.control-btn {
		@apply flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium
			transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
	}

	.control-btn.secondary {
		@apply bg-surface-200 text-surface-700 hover:bg-surface-300 focus:ring-surface-500;
	}

	.control-btn.primary {
		@apply bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500;
	}

	.control-btn.success {
		@apply bg-green-500 text-white hover:bg-green-600 focus:ring-green-500;
	}

	.btn-icon {
		@apply w-4 h-4 flex-shrink-0;
	}

	.btn-text {
		@apply hidden sm:inline;
	}

	.display-content {
		@apply relative;
	}

	.json-textarea {
		@apply w-full min-h-64 p-4 bg-surface-900 text-green-400 font-mono text-xs
			resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500
			leading-relaxed overflow-auto;
	}

	.empty-state {
		@apply flex flex-col items-center justify-center min-h-64 p-8 space-y-4
			text-center text-surface-500;
	}

	.empty-icon {
		@apply w-12 h-12 text-surface-400;
	}

	.empty-text {
		@apply space-y-2;
	}

	.empty-title {
		@apply text-sm font-semibold text-surface-600;
	}

	.empty-description {
		@apply text-xs text-surface-500 max-w-sm;
	}

	/* Dark mode styles */
	:global(.dark) .json-display {
		@apply border-surface-700;
	}

	:global(.dark) .display-header {
		@apply bg-surface-800 border-surface-700;
	}

	:global(.dark) .display-title {
		@apply text-surface-100;
	}

	:global(.dark) .data-stats {
		@apply text-surface-400;
	}

	:global(.dark) .stat-separator {
		@apply text-surface-600;
	}

	:global(.dark) .control-btn.secondary {
		@apply bg-surface-700 text-surface-300 hover:bg-surface-600 focus:ring-surface-400;
	}

	:global(.dark) .json-textarea {
		@apply bg-surface-950 text-green-300;
	}

	:global(.dark) .empty-state {
		@apply text-surface-500;
	}

	:global(.dark) .empty-icon {
		@apply text-surface-600;
	}

	:global(.dark) .empty-title {
		@apply text-surface-400;
	}

	:global(.dark) .empty-description {
		@apply text-surface-500;
	}

	/* Syntax highlighting for JSON in dark terminal style */
	.json-textarea {
		/* This creates a terminal-like appearance */
		border-radius: 0;
	}

	:global(.dark) .json-textarea {
		/* Enhanced dark mode terminal look */
		background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
		border: 1px solid #333;
	}
</style>
