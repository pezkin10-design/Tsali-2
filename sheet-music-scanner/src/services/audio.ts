import { Audio } from 'expo-av';
import { AudioPlaybackState } from '@utils/types';

export class AudioService {
  private static sound: Audio.Sound | null = null;
  private static playbackState: AudioPlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    speed: 1,
    volume: 1,
    loop: false,
    metronomeEnabled: false,
  };

  static async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  static async loadAudio(uri: string): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      this.sound = sound;

      // Get duration
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        this.playbackState.duration = status.durationMillis || 0;
      }

      return true;
    } catch (error) {
      console.error('Error loading audio:', error);
      return false;
    }
  }

  static async play(): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        this.playbackState.isPlaying = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error playing audio:', error);
      return false;
    }
  }

  static async pause(): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        this.playbackState.isPlaying = false;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pausing audio:', error);
      return false;
    }
  }

  static async stop(): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.playbackState.isPlaying = false;
        this.playbackState.currentTime = 0;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error stopping audio:', error);
      return false;
    }
  }

  static async setVolume(volume: number): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
        this.playbackState.volume = volume;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting volume:', error);
      return false;
    }
  }

  static async setRate(rate: number): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.setRateAsync(rate, true);
        this.playbackState.speed = rate;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting rate:', error);
      return false;
    }
  }

  static async seek(position: number): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(position);
        this.playbackState.currentTime = position;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error seeking:', error);
      return false;
    }
  }

  static async setLoop(loop: boolean): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.setIsLoopingAsync(loop);
        this.playbackState.loop = loop;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting loop:', error);
      return false;
    }
  }

  static getPlaybackState(): AudioPlaybackState {
    return { ...this.playbackState };
  }

  static async unload(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  }

  static setMetronomeEnabled(enabled: boolean): void {
    this.playbackState.metronomeEnabled = enabled;
  }

  static isMetronomeEnabled(): boolean {
    return this.playbackState.metronomeEnabled;
  }
}

export default AudioService;
