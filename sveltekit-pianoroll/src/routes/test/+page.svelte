<script lang="ts">
	import { PianoRollCore } from '../../lib/core/PianoRollCore.js';
	import { theme } from '../../lib/stores/theme.js';

	let core: PianoRollCore | null = null;
	let message = 'Loading...';

	try {
		core = new PianoRollCore();
		message = 'SvelteKit Piano Roll application successfully initialized!';
	} catch (error) {
		message = `Error: ${error}`;
	}
</script>

<div style="padding: 2rem; font-family: system-ui;">
	<h1 style="color: #2563eb; margin-bottom: 1rem;">Piano Roll - SvelteKit Test</h1>
	<p style="margin-bottom: 1rem;">{message}</p>
	
	{#if core}
		<div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
			<h3>Core Status:</h3>
			<ul>
				<li>Tuning System: {core.options.tuningSystem}</li>
				<li>Synth Type: {core.options.synthType}</li>
				<li>Synth Enabled: {core.options.useSynth}</li>
				<li>Notes Loaded: {core.notes.length}</li>
			</ul>
		</div>
		
		<div style="background: #ecfccb; padding: 1rem; border-radius: 0.5rem;">
			<h3>Available Tuning Systems:</h3>
			<ul>
				{#each Object.keys(core.tuningTables) as system}
					<li>{system} ({Object.keys(core.tuningTables[system]).length} notes)</li>
				{/each}
			</ul>
		</div>
	{/if}
	
	<div style="margin-top: 2rem; padding: 1rem; background: #dbeafe; border-radius: 0.5rem;">
		<h3>Theme System:</h3>
		<p>Current theme: {$theme}</p>
	</div>
	
	<div style="margin-top: 2rem;">
		<a href="/" style="color: #2563eb; text-decoration: underline;">Back to Main App</a>
	</div>
</div>
