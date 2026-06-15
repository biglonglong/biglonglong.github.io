export class SimpleTTS {
    constructor() {
        this.queue = [];
        this.synth = window.speechSynthesis;
        this.isPlaying = false;
    }

    speak(text, force = false) {
        if (!text || !this.synth) return;
        if (force) {
            this.clear();
        }

        this.queue.push(text);
        this._process();
    }

    _process() {
        if (this.isPlaying || this.queue.length === 0) return;

        this.isPlaying = true;
        const text = this.queue.shift();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.6;
        utterance.pitch = 0.8;
        utterance.volume = 0.6;

        utterance.onend = () => {
            this.isPlaying = false;
            this._process();
        };
        utterance.onerror = () => {
            this.isPlaying = false;
            this._process();
        };

        this.synth.speak(utterance);
    }

    clear() {
        this.queue = [];
        this.synth.cancel();
        this.isPlaying = false;
    }
}

