
export type RecognitionStatus = 'inactive' | 'listening' | 'processing';

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onStatusChangeCallback: ((status: RecognitionStatus) => void) | null = null;

  constructor() {
    // Check if browser supports the Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      this.isSupported = true;
      // Use the appropriate implementation
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      
      // Configure recognition
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      // Set up event handlers
      this.recognition.onresult = this.handleResult.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);
      this.recognition.onerror = this.handleError.bind(this);
    } else {
      console.warn("Speech Recognition API is not supported in this browser");
    }
  }
  
  public checkSupport(): boolean {
    return this.isSupported;
  }
  
  public start(onResult: (text: string) => void, onStatusChange: (status: RecognitionStatus) => void): void {
    if (!this.isSupported) {
      onStatusChange('inactive');
      return;
    }
    
    this.onResultCallback = onResult;
    this.onStatusChangeCallback = onStatusChange;
    
    try {
      this.recognition?.start();
      onStatusChange('listening');
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      onStatusChange('inactive');
    }
  }
  
  public stop(): void {
    if (this.recognition) {
      this.recognition.stop();
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('inactive');
      }
    }
  }
  
  private handleResult(event: SpeechRecognitionEvent): void {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback('processing');
    }
    
    const transcript = event.results[0][0].transcript;
    
    if (this.onResultCallback) {
      this.onResultCallback(transcript);
    }
  }
  
  private handleEnd(): void {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback('inactive');
    }
  }
  
  private handleError(event: SpeechRecognitionErrorEvent): void {
    console.error("Speech recognition error:", event.error);
    
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback('inactive');
    }
  }
}

// Create a singleton instance
const speechRecognition = new SpeechRecognitionService();
export default speechRecognition;
