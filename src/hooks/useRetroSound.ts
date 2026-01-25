'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useRetroSound() {
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Lazy init audio context
    if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, startTime = 0) => {
    const ctx = audioContext.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  }, []);

  const playCoin = useCallback(() => {
    // Coin sound: Two tones ascending
    playTone(987.77, 'square', 0.1, 0); // B5
    playTone(1318.51, 'square', 0.4, 0.1); // E6
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(150, 'square', 0.05);
  }, [playTone]);

  const playHover = useCallback(() => {
    playTone(400, 'triangle', 0.02);
  }, [playTone]);

  const resumeAudio = useCallback(async () => {
     if (audioContext.current?.state === 'suspended') {
        await audioContext.current.resume();
     }
  }, []);

  return { playCoin, playClick, playHover, resumeAudio };
}
