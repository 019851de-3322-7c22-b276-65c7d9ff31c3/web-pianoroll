import type {
	TuningSystem,
	SynthType,
	Note,
	MidiData,
	PianoRollOptions,
	NoteEvent,
	NoteEventCallback,
	TuningTables
} from '../types/index.js';

// Global references to libraries loaded via script tags
declare global {
	interface Window {
		Tone: any;
		Tonal: any;
		Midi: any;
	}
}

/**
 * Core class for MIDI file processing with custom tuning systems
 * Handles parsing, tuning calculations, and audio synthesis
 */
export class PianoRollCore {
	public options: Required<PianoRollOptions>;
	public tuningTables: TuningTables;
	public synth: any | null = null;
	public notes: Note[] = [];
	public noteSubscribers: NoteEventCallback[] = [];
	public isPlaying: boolean = false;
	public scheduledEvents: any[] = [];

	constructor(options: PianoRollOptions = {}) {
		this.options = {
			tuningSystem: 'equal',
			useSynth: true,
			synthType: 'default',
			...options
		};

		this.tuningTables = {
			equal: {},
			natural: {},
			pythagorean: {},
			pentatonic: {}
		};

		this._initTuningTables();

		if (this.options.useSynth) {
			this._initSynth();
		}
	}

	/**
	 * Initialize tuning tables with frequency ratios for different musical systems
	 */
	private _initTuningTables(): void {
		if (typeof window === 'undefined' || !window.Tone || !window.Tonal) {
			console.warn('Tone.js or Tonal.js not loaded, using equal temperament as fallback');
			return;
		}

		const Tone = window.Tone;
		const baseNote = 'C4';
		const baseFreq = Tone.Frequency(baseNote).toFrequency();

		// Natural (just intonation) ratios
		const naturalRatios: Record<string, number> = {
			'C': 1, 'C#': 16/15, 'D': 9/8, 'D#': 6/5, 'E': 5/4, 'F': 4/3,
			'F#': 45/32, 'G': 3/2, 'G#': 8/5, 'A': 5/3, 'A#': 9/5, 'B': 15/8
		};

		// Pythagorean tuning ratios
		const pythagoreanRatios: Record<string, number> = {
			'C': 1, 'C#': 256/243, 'D': 9/8, 'D#': 32/27, 'E': 81/64, 'F': 4/3,
			'F#': 729/512, 'G': 3/2, 'G#': 128/81, 'A': 27/16, 'A#': 16/9, 'B': 243/128
		};

		// Pentatonic scale ratios (5-note scale)
		const pentatonicRatios: Record<string, number> = {
			'C': 1, 'D': 9/8, 'E': 5/4, 'G': 3/2, 'A': 5/3
		};

		// Generate tuning tables for all octaves (0-8)
		for (let octave = 0; octave <= 8; octave++) {
			// Equal temperament (12-TET)
			for (let semitone = 0; semitone < 12; semitone++) {
				const note = Tone.Frequency(baseFreq, 'hz').transpose(semitone + (octave - 4) * 12);
				const noteName = note.toNote();
				this.tuningTables.equal[noteName] = note.toFrequency();
			}

			// Natural tuning
			Object.entries(naturalRatios).forEach(([noteName, ratio]) => {
				const fullNoteName = `${noteName}${octave}`;
				const octaveMultiplier = Math.pow(2, octave - 4);
				this.tuningTables.natural[fullNoteName] = baseFreq * ratio * octaveMultiplier;
			});

			// Pythagorean tuning
			Object.entries(pythagoreanRatios).forEach(([noteName, ratio]) => {
				const fullNoteName = `${noteName}${octave}`;
				const octaveMultiplier = Math.pow(2, octave - 4);
				this.tuningTables.pythagorean[fullNoteName] = baseFreq * ratio * octaveMultiplier;
			});

			// Pentatonic tuning
			Object.entries(pentatonicRatios).forEach(([noteName, ratio]) => {
				const fullNoteName = `${noteName}${octave}`;
				const octaveMultiplier = Math.pow(2, octave - 4);
				this.tuningTables.pentatonic[fullNoteName] = baseFreq * ratio * octaveMultiplier;
			});
		}
	}

	/**
	 * Initialize synthesizer based on synthType
	 */
	private _initSynth(): void {
		if (typeof window === 'undefined' || !window.Tone) {
			console.warn('Tone.js not loaded, synth disabled');
			return;
		}

		const Tone = window.Tone;

		switch (this.options.synthType) {
			case 'fm':
				this.synth = new Tone.FMSynth({
					harmonicity: 3,
					modulationIndex: 10,
					oscillator: { type: 'sine' },
					envelope: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.5 },
					modulation: { type: 'square' },
					modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
				}).toDestination();
				break;

			case 'am':
				this.synth = new Tone.AMSynth({
					harmonicity: 2,
					oscillator: { type: 'sine' },
					envelope: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.5 },
					modulation: { type: 'square' },
					modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
				}).toDestination();
				break;

			case 'membrane':
				this.synth = new Tone.MembraneSynth({
					pitchDecay: 0.05,
					octaves: 10,
					oscillator: { type: 'sine' },
					envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' }
				}).toDestination();
				break;

			default: // 'default'
				this.synth = new Tone.Synth({
					oscillator: { type: 'triangle' },
					envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
				}).toDestination();
				break;
		}
	}

	/**
	 * Parse MIDI file from File object
	 */
	async parseMIDI(file: File): Promise<MidiData> {
		if (typeof window === 'undefined' || !window.Midi) {
			throw new Error('Midi.js not loaded');
		}

		const Midi = window.Midi;
		const arrayBuffer = await file.arrayBuffer();
		const midi = new Midi(arrayBuffer);

		const midiData: MidiData = {
			name: file.name,
			duration: midi.duration,
			tracks: []
		};

		midi.tracks.forEach((track: any, trackIndex: number) => {
			const notes: Note[] = track.notes.map((note: any) => ({
				name: note.name,
				midi: note.midi,
				time: note.time,
				duration: note.duration,
				velocity: note.velocity,
				frequency: this.getNoteFrequency(note.name),
				trackIndex
			}));

			midiData.tracks.push({
				name: track.name || `Track ${trackIndex + 1}`,
				notes
			});
		});

		// Flatten all notes for easy access
		this.notes = midiData.tracks.flatMap(track => track.notes);

		return midiData;
	}

	/**
	 * Get frequency for a note name using current tuning system
	 */
	getNoteFrequency(noteName: string): number {
		const tuningTable = this.tuningTables[this.options.tuningSystem];
		
		if (tuningTable[noteName] !== undefined) {
			return tuningTable[noteName];
		}

		// Fallback to equal temperament if note not found
		if (this.tuningTables.equal[noteName] !== undefined) {
			return this.tuningTables.equal[noteName];
		}

		// Final fallback: use Tone.js if available
		if (typeof window !== 'undefined' && window.Tone) {
			try {
				return window.Tone.Frequency(noteName).toFrequency();
			} catch {
				console.warn(`Unknown note: ${noteName}, using 440Hz`);
				return 440; // A4 fallback
			}
		}

		return 440; // Final fallback
	}

	/**
	 * Update tuning system and recalculate frequencies
	 */
	updateTuningSystem(tuningSystem: TuningSystem): void {
		this.options.tuningSystem = tuningSystem;
		
		// Recalculate frequencies for existing notes
		this.notes = this.notes.map(note => ({
			...note,
			frequency: this.getNoteFrequency(note.name)
		}));

		// Notify subscribers
		this._notifySubscribers({
			type: 'stop',
			time: Date.now()
		});
	}

	/**
	 * Update synthesizer type
	 */
	updateSynthType(synthType: SynthType): void {
		this.options.synthType = synthType;
		
		if (this.options.useSynth) {
			// Dispose old synth
			if (this.synth?.dispose) {
				this.synth.dispose();
			}
			
			// Create new synth
			this._initSynth();
		}
	}

	/**
	 * Play all notes with timing
	 */
	play(): void {
		if (typeof window === 'undefined' || !window.Tone) {
			console.warn('Tone.js not loaded, cannot play');
			return;
		}

		const Tone = window.Tone;
		
		if (this.isPlaying) {
			this.stop();
		}

		if (!this.options.useSynth || !this.synth) {
			console.warn('Synth not available');
			return;
		}

		this.isPlaying = true;
		const now = Tone.now();

		// Schedule all notes
		this.notes.forEach(note => {
			const startTime = now + note.time;
			const frequency = note.frequency;

			// Schedule note on
			const noteOnEvent = Tone.Transport.schedule((time: number) => {
				if (this.isPlaying) {
					this.synth.triggerAttack(frequency, time, note.velocity);
					this._notifySubscribers({
						type: 'noteOn',
						note: note.name,
						frequency,
						time,
						duration: note.duration,
						velocity: note.velocity
					});
				}
			}, startTime);

			// Schedule note off
			const noteOffEvent = Tone.Transport.schedule((time: number) => {
				if (this.isPlaying) {
					this.synth.triggerRelease(frequency, time);
					this._notifySubscribers({
						type: 'noteOff',
						note: note.name,
						frequency,
						time
					});
				}
			}, startTime + note.duration);

			this.scheduledEvents.push(noteOnEvent, noteOffEvent);
		});

		// Start transport
		Tone.Transport.start();
	}

	/**
	 * Stop playback
	 */
	stop(): void {
		if (typeof window !== 'undefined' && window.Tone) {
			window.Tone.Transport.stop();
			window.Tone.Transport.cancel();
		}

		// Clear scheduled events
		this.scheduledEvents.forEach(event => {
			if (typeof window !== 'undefined' && window.Tone) {
				window.Tone.Transport.clear(event);
			}
		});
		this.scheduledEvents = [];

		this.isPlaying = false;
		
		this._notifySubscribers({
			type: 'stop',
			time: Date.now()
		});
	}

	/**
	 * Subscribe to note events
	 */
	subscribe(callback: NoteEventCallback): () => void {
		this.noteSubscribers.push(callback);
		
		// Return unsubscribe function
		return () => {
			const index = this.noteSubscribers.indexOf(callback);
			if (index > -1) {
				this.noteSubscribers.splice(index, 1);
			}
		};
	}

	/**
	 * Notify all subscribers of note events
	 */
	private _notifySubscribers(event: NoteEvent): void {
		this.noteSubscribers.forEach(callback => {
			try {
				callback(event);
			} catch (error) {
				console.error('Error in note subscriber:', error);
			}
		});
	}

	/**
	 * Get JSON representation of current notes
	 */
	toJSON(): string {
		return JSON.stringify({
			options: this.options,
			notes: this.notes,
			isPlaying: this.isPlaying
		}, null, 2);
	}

	/**
	 * Cleanup resources
	 */
	dispose(): void {
		this.stop();
		
		if (this.synth?.dispose) {
			this.synth.dispose();
			this.synth = null;
		}
		
		this.notes = [];
		this.noteSubscribers = [];
	}
}

// Export for use in Svelte components
export default PianoRollCore;
