// pianoroll-core.js

// Теперь эти импорты будут разрешаться через importmap
import * as Tone from 'tone';
import * as Tonal from '@tonaljs/tonal';
// Tonal.Note и Tonal.Scale уже импортируются через * as Tonal,
// но для явности и tree-shaking можно импортировать конкретные модули
// import { Note } from '@tonaljs/note';
// import { Scale } from '@tonaljs/scale';
// В данном случае, поскольку мы используем Tonal.Note.get и Tonal.Scale.get,
// достаточно импорта * as Tonal.

class PianoRollCore {
  constructor(options = {}) {
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
    
    this.synth = null;
    if (this.options.useSynth) {
      this._initSynth();
    }
    
    this.notes = [];
    this.noteSubscribers = [];
    this.isPlaying = false;
    this.scheduledEvents = [];
  }
  
  /**
   * Инициализация таблиц строев с соотношениями частот
   * для разных музыкальных систем
   */
  _initTuningTables() {
    const baseNote = 'C4';
    const baseFreq = Tone.Frequency(baseNote).toFrequency();
    
    const naturalRatios = {
      'C': 1,       'C#': 16/15,  'D': 9/8,     'D#': 6/5,    'E': 5/4,     'F': 4/3,     'F#': 45/32,  'G': 3/2,     'G#': 8/5,    'A': 5/3,     'A#': 9/5,    'B': 15/8
    };
    
    const pythagoreanRatios = {
      'C': 1,         'C#': 256/243,  'D': 9/8,       'D#': 32/27,    'E': 81/64,     'F': 4/3,       'F#': 729/512,  'G': 3/2,       'G#': 128/81,   'A': 27/16,     'A#': 16/9,     'B': 243/128
    };
    
    const pentatonicRatios = {
      'C': 1,     'D': 9/8,   'E': 5/4,   'G': 3/2,   'A': 5/3
    };
    
    for (let octave = 0; octave < 9; octave++) {
      const baseForOctave = baseFreq * Math.pow(2, octave - 4); // C4 = 261.63 Hz
      
      Object.keys(naturalRatios).forEach(noteName => {
        const noteId = `${noteName}${octave}`;
        
        this.tuningTables.equal[noteId] = Tone.Frequency(noteId).toFrequency();
        this.tuningTables.natural[noteId] = baseForOctave * naturalRatios[noteName];
        this.tuningTables.pythagorean[noteId] = baseForOctave * pythagoreanRatios[noteName];
        
        if (noteName in pentatonicRatios) {
          this.tuningTables.pentatonic[noteId] = baseForOctave * pentatonicRatios[noteName];
        }
      });
    }
  }
  
  /**
   * Инициализация синтезатора в зависимости от опций
   */
  _initSynth() {
    if (this.synth) {
      this.synth.dispose();
    }
    
    const synthOptions = {
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.5
      }
    };
    
    switch (this.options.synthType) {
      case 'fm':
        this.synth = new Tone.PolySynth(Tone.FMSynth, synthOptions).toDestination();
        break;
      case 'am':
        this.synth = new Tone.PolySynth(Tone.AMSynth, synthOptions).toDestination();
        break;
      case 'membrane':
        this.synth = new Tone.PolySynth(Tone.MembraneSynth, synthOptions).toDestination();
        break;
      case 'default':
      default:
        this.synth = new Tone.PolySynth(Tone.Synth, synthOptions).toDestination();
        break;
    }
  }
  
  /**
   * Преобразует ноту (строку) в частоту согласно выбранному строю
   * @param {string} note - Имя ноты (например, "C4")
   * @return {number} Частота в Гц
   */
  noteToFrequency(note) {
    const system = this.options.tuningSystem;
    
    // Если нота присутствует в таблице текущего строя
    if (system in this.tuningTables && note in this.tuningTables[system]) {
      return this.tuningTables[system][note];
    }
    
    // Для равномерно темперированного строя используем встроенный конвертер Tone.js
    if (system === 'equal') {
      return Tone.Frequency(note).toFrequency();
    }
    
    // Для пентатоники, если запрошена нота не из пентатоники,
    // находим ближайшую ноту в пентатонике (или возвращаем равномерно темперированную)
    if (system === 'pentatonic') {
      const noteName = Tonal.Note.pc(note); // Pitch class (C, D, E, etc.)
      const octave = Tonal.Note.octave(note);

      const pentatonicNotes = ['C', 'D', 'E', 'G', 'A'];
      
      if (pentatonicNotes.includes(noteName)) {
        const pentatonicNote = `${noteName}${octave}`;
        if (pentatonicNote in this.tuningTables.pentatonic) {
          return this.tuningTables.pentatonic[pentatonicNote];
        }
      }
      
      // Если нота не в пентатонике, возвращаем равномерно темперированную частоту
      // или можно реализовать логику "ближайшей" ноты
      return Tone.Frequency(note).toFrequency();
    }
    
    // Если ничего не сработало, возвращаем равномерно темперированную частоту
    return Tone.Frequency(note).toFrequency();
  }
  
  /**
   * Загружает MIDI-JSON объект и преобразует его в формат нот для пианоролла
   * @param {Object} midiJson - MIDI в формате JSON (от @tonejs/midi)
   */
  loadMidiJson(midiJson) {
    this.notes = [];
    
    midiJson.tracks.forEach((track, trackIndex) => {
      track.notes.forEach(note => {
        this.notes.push({
          name: note.name,             
          midi: note.midi,             
          time: note.time,             
          duration: note.duration,     
          velocity: note.velocity,     
          frequency: this.noteToFrequency(note.name), 
          trackIndex: trackIndex       
        });
      });
    });
    
    this.notes.sort((a, b) => a.time - b.time);
    
    return this.notes;
  }
  
  /**
   * Запускает воспроизведение загруженных нот
   */
  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    if (!this.notes.length) {
      console.warn("No notes loaded to play.");
      this.isPlaying = false;
      return;
    }
    
    // Сбрасываем все предыдущие запланированные события
    this.scheduledEvents.forEach(id => Tone.Transport.clear(id));
    this.scheduledEvents = [];

    const now = Tone.now() + 0.1; // Небольшая задержка
    
    this.notes.forEach(note => {
      const scheduledTime = note.time + now;

      // Планируем событие noteOn
      const noteOnEventId = Tone.Transport.schedule((time) => {
          // Если используем встроенный синтезатор
          if (this.options.useSynth && this.synth) {
            this.synth.triggerAttack(note.frequency, time, note.velocity);
          }
          // Уведомляем всех подписчиков о ноте
          this._notifySubscribers({
            type: 'noteOn',
            note: note.name,
            frequency: note.frequency,
            time: time,
            duration: note.duration,
            velocity: note.velocity
          });
      }, scheduledTime);
      this.scheduledEvents.push(noteOnEventId);
      
      // Планируем событие noteOff
      const noteOffTime = scheduledTime + note.duration;
      const noteOffEventId = Tone.Transport.schedule((time) => {
          if (this.options.useSynth && this.synth) {
            this.synth.triggerRelease(note.frequency, time);
          }
          this._notifySubscribers({
            type: 'noteOff',
            note: note.name,
            frequency: note.frequency,
            time: time,
            velocity: note.velocity
          });
      }, noteOffTime);
      this.scheduledEvents.push(noteOffEventId);
    });

    // Запускаем транспорт Tone.js, если он еще не запущен
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }
  }
  
  /**
   * Останавливает воспроизведение и отменяет все запланированные события
   */
  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    
    this.scheduledEvents.forEach(id => {
      Tone.Transport.clear(id);
    });
    this.scheduledEvents = [];
    
    if (this.options.useSynth && this.synth) {
      this.synth.releaseAll();
    }
    
    this._notifySubscribers({ type: 'stop' });
    
    // Можно также остановить транспорт, если больше нет активных событий
    // Tone.Transport.stop(); // Осторожно: это остановит все другие запланированные события
  }
  
  /**
   * Подписывает внешний обработчик на события нот
   * @param {Function} callback - Функция, вызываемая при событиях нот
   */
  subscribe(callback) {
    if (typeof callback === 'function' && !this.noteSubscribers.includes(callback)) {
      this.noteSubscribers.push(callback);
    }
    return this; 
  }
  
  /**
   * Отписывает обработчик от событий нот
   * @param {Function} callback - Функция, которую нужно отписать
   */
  unsubscribe(callback) {
    this.noteSubscribers = this.noteSubscribers.filter(cb => cb !== callback);
    return this;
  }
  
  /**
   * Уведомляет всех подписчиков о событии
   * @param {Object} event - Информация о событии
   */
  _notifySubscribers(event) {
    this.noteSubscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in note subscriber:', error);
      }
    });
  }
  
  /**
   * Изменяет строй и перерасчитывает частоты для всех нот
   * @param {string} tuningSystem - Строй ('equal', 'natural', 'pythagorean', 'pentatonic')
   */
  setTuningSystem(tuningSystem) {
    if (!(tuningSystem in this.tuningTables)) {
      console.warn(`Unknown tuning system: ${tuningSystem}. Using 'equal' instead.`);
      tuningSystem = 'equal';
    }
    
    this.options.tuningSystem = tuningSystem;
    
    this.notes.forEach(note => {
      note.frequency = this.noteToFrequency(note.name);
    });
    
    // Если воспроизведение активно, перезапустить с новыми частотами
    if (this.isPlaying) {
        this.stop();
        this.play();
    }

    return this;
  }
  
  /**
   * Включает или выключает встроенный синтезатор
   * @param {boolean} useSynth - Использовать ли встроенный синтезатор
   */
  toggleSynth(useSynth) {
    this.options.useSynth = !!useSynth;
    
    if (this.options.useSynth && !this.synth) {
      this._initSynth();
    } else if (!this.options.useSynth && this.synth) {
        this.synth.dispose();
        this.synth = null;
    }
    
    return this;
  }
  
  /**
   * Изменяет тип встроенного синтезатора
   * @param {string} synthType - Тип синтезатора
   */
  setSynthType(synthType) {
    this.options.synthType = synthType;
    
    if (this.options.useSynth) {
      this._initSynth();
    }
    
    return this;
  }
  
  /**
   * Возвращает информацию о всех нотах в простом формате
   * для использования во внешних синтезаторах
   * @return {Array} Массив объектов нот
   */
  getNotes() {
    return this.notes.map(note => ({
      name: note.name,
      frequency: note.frequency,
      time: note.time,
      duration: note.duration,
      velocity: note.velocity
    }));
  }
  
  /**
   * Очищает все ноты
   */
  clear() {
    this.stop();
    this.notes = [];
    return this;
  }
  
  /**
   * Освобождает ресурсы (синтезаторы и т.д.)
   */
  dispose() {
    this.stop();
    
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    
    this.notes = [];
    this.noteSubscribers = [];
    
    // Очищаем транспорт, если это последний компонент, использующий его
    // Tone.Transport.clear(); // Осторожно: это может повлиять на другие части приложения
    
    return this;
  }
}

export default PianoRollCore;
