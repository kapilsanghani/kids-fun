import { _decorator, Component, AudioClip, AudioSource, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property(AudioSource) audioSourceSFX: AudioSource = null;
    @property(AudioSource) audioSourceBGM: AudioSource = null;

    @property({ type: AudioClip }) btnTapClip: AudioClip = null;
    @property({ type: AudioClip }) matchClip: AudioClip = null;
    @property({ type: AudioClip }) mismatchClip: AudioClip = null;
    @property({ type: AudioClip }) winClip: AudioClip = null;
    @property({ type: AudioClip }) bgMusicClip: AudioClip = null;

    static instance: AudioManager;

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    onLoad() {
        AudioManager.instance = this;
    }

    start() {
        this.playBackgroundMusic();
    }
    
    playBackgroundMusic() {
        if (this.audioSourceBGM && this.bgMusicClip) {
            this.audioSourceBGM.clip = this.bgMusicClip;
            this.audioSourceBGM.loop = true;
            this.audioSourceBGM.play();
        }
    }

    playButtonTap() {
        this.play(this.btnTapClip);
    }

    playWin() {
        this.play(this.winClip);
    }

    playMatch() {
        this.play(this.matchClip);
    }

    playMismatch() {
        this.play(this.mismatchClip);
    }

    private play(clip: AudioClip) {
        if (clip && this.audioSourceSFX) {
            this.audioSourceSFX.playOneShot(clip);
        }
    }
}
