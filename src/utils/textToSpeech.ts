
class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private isSpeaking: boolean = false;
  private onStartCallback: (() => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    // Try to set a default voice (preferably a female voice in English)
    this.setVoice();
  }

  private setVoice(): void {
    // Wait for voices to be loaded
    if (this.synth.getVoices().length === 0) {
      setTimeout(() => this.setVoice(), 100);
      return;
    }

    const voices = this.synth.getVoices();
    
    // Try to find a female English voice
    let preferredVoice = voices.find(
      voice => voice.name.includes('Female') && voice.lang.includes('en')
    );
    
    // If no female English voice is found, use any English voice
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => voice.lang.includes('en'));
    }
    
    // If no English voice is found, use the first available voice
    this.voice = preferredVoice || voices[0];
  }

  public speak(text: string, onStart?: () => void, onEnd?: () => void): void {
    if (!text) return;
    
    // Cancel any ongoing speech
    this.stop();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    // Configure utterance
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Set callbacks
    this.onStartCallback = onStart || null;
    this.onEndCallback = onEnd || null;
    
    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStartCallback) this.onStartCallback();
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onEndCallback) this.onEndCallback();
    };
    
    // Start speaking
    this.synth.speak(utterance);
  }

  public stop(): void {
    this.synth.cancel();
    this.isSpeaking = false;
    
    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  public isAvailable(): boolean {
    return 'speechSynthesis' in window;
  }
  
  public isSpeakingNow(): boolean {
    return this.isSpeaking;
  }
}

// Create a singleton instance
const textToSpeech = new TextToSpeechService();
export default textToSpeech;
