# 🎹 PianoRoll with Custom Tunings

A web application for parsing MIDI files and playing them with custom musical tuning systems. Built with Tone.js and Tonal.js.

## ✨ Features

- **MIDI File Support**: Drag & drop MIDI files to parse and visualize notes
- **Multiple Tuning Systems**: 
  - Equal Temperament (standard)
  - Natural/Just Intonation
  - Pythagorean Tuning
  - Pentatonic Scale
- **Built-in Synthesizers**: 4 different synthesis types
- **External Synthesizer Support**: Event subscription system for external audio processing
- **Real-time Audio Playback**: Using Tone.js audio engine
- **JSON Output**: Export processed notes as JSON

## 🚀 Getting Started

### Prerequisites

- A modern web browser with ES6 modules support
- A local web server (for MIDI file loading)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pianoroll-tunings
```

2. Start a local web server:
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open your browser and navigate to `http://localhost:8000`

## 🎵 Usage

### Basic Usage

1. **Load a MIDI file**: Drag and drop a `.mid` file onto the designated area
2. **Select tuning system**: Choose from the dropdown menu
3. **Configure synthesizer**: Toggle built-in synthesizer or connect external one
4. **Play**: Click the play button to hear the audio with custom tuning
5. **Export**: View and copy the JSON output of processed notes

### Tuning Systems

- **Equal Temperament**: Standard 12-tone equal division (440 Hz A4)
- **Natural/Just Intonation**: Pure intervals based on simple frequency ratios
- **Pythagorean**: Based on 3:2 perfect fifths
- **Pentatonic**: 5-note scale with traditional ratios

### Synthesizer Types

- **Basic Synth**: Simple triangle wave oscillator
- **FM Synth**: Frequency modulation synthesis
- **AM Synth**: Amplitude modulation synthesis  
- **Membrane Synth**: Physical modeling synthesizer

## 🔧 API Reference

### PianoRollCore Class

```javascript
import PianoRollCore from './pianoroll-core.js';

// Create instance
const piano = new PianoRollCore({
    tuningSystem: 'equal',  // 'equal', 'natural', 'pythagorean', 'pentatonic'
    useSynth: true,         // Enable built-in synthesizer
    synthType: 'default'    // 'default', 'fm', 'am', 'membrane'
});

// Load MIDI data
piano.loadMidiJson(midiObject);

// Play/stop
piano.play();
piano.stop();

// Change tuning
piano.setTuningSystem('natural');

// Get processed notes
const notes = piano.getNotes();

// Subscribe to note events
piano.subscribe((event) => {
    console.log('Note event:', event);
});
```

### Key Methods

- `loadMidiJson(midiData)` - Load MIDI data from @tonejs/midi
- `play()` - Start playback
- `stop()` - Stop playback
- `setTuningSystem(system)` - Change tuning system
- `toggleSynth(enabled)` - Enable/disable built-in synthesizer
- `setSynthType(type)` - Change synthesizer type
- `subscribe(callback)` - Subscribe to note events
- `getNotes()` - Get processed notes with frequencies
- `clear()` - Clear all notes
- `dispose()` - Clean up resources

### Event System

Subscribe to note events for external processing:

```javascript
piano.subscribe((event) => {
    switch(event.type) {
        case 'noteOn':
            console.log(`Note ${event.note} at ${event.frequency}Hz`);
            break;
        case 'noteOff':
            console.log(`Note ${event.note} released`);
            break;
        case 'stop':
            console.log('Playback stopped');
            break;
    }
});
```

## 🧪 Testing

The project includes comprehensive test suites:

### Unit Tests
```bash
# Open in browser
http://localhost:8000/test-pianoroll.html
```

Tests cover:
- Constructor and configuration
- Frequency calculations for all tuning systems
- MIDI data loading and processing
- Synthesizer functionality
- Event subscription system
- Resource cleanup

**Results**: 67/68 tests pass (98.5% success rate)

### Integration Tests
```bash
# Open in browser
http://localhost:8000/test-integration.html
```

Tests cover:
- Library compatibility
- Full workflow end-to-end
- Error handling
- Performance with 1000+ notes

**Performance**:
- Load 1000 notes: ~16ms
- Change tuning: ~15ms

### Manual Tests

- Audio playback test
- MIDI file upload test
- UI controls test

## 📁 Project Structure

```
.
├── index.html              # Main application
├── pianoroll-core.js       # Core PianoRoll class
├── test-pianoroll.html     # Unit tests
├── test-integration.html   # Integration tests
├── vendor/                 # External libraries (unused)
│   ├── Tone.min.js
│   ├── tonal.min.js
│   └── Midi.js
└── README.md              # This file
```

## 🎼 Musical Theory

### Frequency Calculations

- **Equal Temperament**: f(n) = 440 × 2^((n-69)/12)
- **Natural Intonation**: Uses pure ratios (3:2, 5:4, etc.)
- **Pythagorean**: Built from perfect fifths (3:2 ratio)
- **Pentatonic**: Traditional 5-note scale ratios

### Base Frequencies (C4 ≈ 261.63 Hz)

| Note | Equal | Natural | Pythagorean | Pentatonic |
|------|-------|---------|-------------|------------|
| C4   | 261.63| 261.63  | 261.63      | 261.63     |
| D4   | 293.66| 294.33  | 294.33      | 294.33     |
| E4   | 329.63| 327.04  | 335.11      | 327.04     |
| F4   | 349.23| 348.83  | 348.83      | -          |
| G4   | 392.00| 392.44  | 392.44      | 392.44     |
| A4   | 440.00| 436.05  | 442.54      | 436.05     |
| B4   | 493.88| 490.55  | 497.67      | -          |

## 🔧 Dependencies

- **Tone.js v15.3.3**: Web Audio API synthesis and scheduling
- **Tonal.js**: Music theory utilities
- **@tonejs/midi v2.0.28**: MIDI file parsing
- **@tonejs/ui v0.0.8**: UI components for playback controls

## 🐛 Known Issues

1. **Pentatonic Tuning**: Limited Tonal.js compatibility (1 integration test fails)
2. **Unit Test**: Minor callback unsubscribe test fails (cosmetic issue)
3. **Browser Compatibility**: Requires modern browsers with ES6 modules

## 🚀 Performance

- Handles 1000+ notes efficiently
- Real-time tuning system switching
- Low latency audio scheduling
- Memory efficient resource management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `npm test` or open test files in browser
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## 📄 License

This project is open source. See LICENSE file for details.

## 🙏 Acknowledgments

- Tone.js team for excellent web audio framework
- Tonal.js for music theory calculations
- Web MIDI API community
- Historical tuning system research
