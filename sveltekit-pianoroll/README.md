# Piano Roll - SvelteKit Edition

*A modern MIDI file parser with custom tuning systems built with SvelteKit, TypeScript, and Tailwind CSS*

## Features

- 📁 **MIDI File Upload**: Drop or select .mid/.midi files for parsing
- 🎵 **Custom Tuning Systems**: 
  - Equal Temperament (12-TET)
  - Just Intonation (Natural)
  - Pythagorean Tuning
  - Pentatonic Scale
- 🎹 **Multiple Synthesizers**:
  - Triangle Wave Synth
  - FM Synthesis
  - AM Synthesis 
  - Membrane Synth
- 🎨 **Modern UI**: Dark/Light/System theme support
- ⚡ **Real-time Playback**: Audio synthesis with Tone.js
- 📊 **JSON Export**: View and download parsed MIDI data
- 🎯 **TypeScript**: Full type safety and better DX
- 📱 **Responsive**: Works on desktop and mobile

## Technology Stack

- **Frontend**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS 4 with custom theming
- **Audio**: Tone.js for synthesis and playback
- **Music Theory**: Tonal.js for note calculations
- **MIDI**: @tonejs/midi for file parsing
- **Build**: Vite with PostCSS

## Getting Started

### Prerequisites

- Node.js 18+ (currently tested with 18.19.1)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sveltekit-pianoroll

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Upload a MIDI file**: Drag and drop or click to select a .mid/.midi file
2. **Choose tuning system**: Select from equal, natural, pythagorean, or pentatonic
3. **Configure synthesizer**: Enable audio and select synth type
4. **Play and listen**: Use playback controls to hear the differences between tuning systems
5. **Export data**: Copy or download the parsed JSON output

## Musical Tuning Systems

### Equal Temperament (12-TET)
The modern standard tuning system where each semitone is exactly 2^(1/12) ≈ 1.059463 times the frequency of the previous note.

### Just Intonation (Natural)
Based on simple integer ratios that create pure harmonic intervals:
- Perfect fifth: 3:2
- Major third: 5:4  
- Natural seventh: 7:4

### Pythagorean Tuning
Based on perfect fifths (3:2 ratio) stacked on top of each other. Creates very pure fifths but slightly sharp major thirds.

### Pentatonic Scale
A five-note scale using natural ratios commonly found in folk music worldwide:
- C: 1:1
- D: 9:8
- E: 5:4
- G: 3:2
- A: 5:3

## Architecture

### Core Components

- **PianoRollCore**: TypeScript class handling MIDI parsing, tuning calculations, and audio synthesis
- **Theme Store**: Svelte store for managing light/dark/system theme preferences
- **UI Components**: Modular Svelte components for file upload, controls, and display

### Key Files

```
src/
├── lib/
│   ├── core/
│   │   └── PianoRollCore.ts     # Main logic class
│   ├── stores/
│   │   └── theme.ts             # Theme management
│   ├── components/
│   │   ├── MidiUpload.svelte    # File upload component
│   │   ├── TuningSelector.svelte # Tuning system selector
│   │   ├── SynthControls.svelte  # Synthesizer controls
│   │   ├── PlaybackControls.svelte # Play/pause controls
│   │   └── JsonDisplay.svelte    # JSON output display
│   └── types/
│       └── index.ts             # TypeScript definitions
├── routes/
│   ├── +layout.svelte           # App layout with theme switching
│   └── +page.svelte             # Main application page
└── app.css                      # Global styles with theme variables
```

## Performance

Based on testing with the original JavaScript version:
- **Load Time**: ~16ms for 1000 notes
- **Tuning Change**: ~15ms to recalculate frequencies
- **Memory Usage**: Efficient with automatic cleanup
- **File Size**: Supports files up to 10MB

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

Requires Web Audio API support for audio playback.

## Development Status

✅ **Completed Features:**
- Core MIDI parsing and tuning system implementation
- Complete TypeScript migration from original JavaScript
- All UI components (upload, controls, display)
- Theme system with dark/light/system modes
- Real-time audio playback with multiple synthesizers
- JSON export functionality

🚧 **In Progress:**
- Tailwind CSS configuration refinement
- Component styling optimization

📋 **Planned:**
- Test suite migration and expansion
- Performance optimizations
- Additional synthesizer types
- MIDI visualization features

## Comparison to Original Version

### Improvements
- **Modern Stack**: SvelteKit vs vanilla HTML/JS
- **Type Safety**: Full TypeScript implementation
- **Component Architecture**: Reusable, maintainable components
- **Better UX**: Improved file handling, error states, and feedback
- **Theme System**: Built-in dark/light mode support
- **Responsive Design**: Works well on all screen sizes

### Maintained Features
- All 4 tuning systems with identical calculations
- Same synthesizer types and audio quality
- Identical MIDI parsing capabilities
- JSON export format compatibility
- Performance characteristics

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines

1. **TypeScript First**: Maintain strict typing throughout
2. **Component Isolation**: Keep components focused and reusable
3. **Accessibility**: Follow WCAG guidelines for UI components
4. **Performance**: Profile changes that affect audio or large file handling
5. **Testing**: Add tests for new features (test suite coming soon)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Tone.js** - Web Audio framework for synthesis
- **Tonal.js** - Music theory library
- **@tonejs/midi** - MIDI file parsing
- **SvelteKit** - The web framework that makes this possible
- **Tailwind CSS** - Utility-first CSS framework

---

*Built with ❤️ using modern web technologies*
