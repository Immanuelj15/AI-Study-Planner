import { useState, useEffect } from 'react';

export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const speak = (text) => {
    if (!supported) return;
    window.speechSynthesis.cancel(); // cancel previous speech
    
    // Strip markdown formatting symbols for smooth speech
    const cleanText = text
      .replace(/#+/g, '')
      .replace(/\*+/g, '')
      .replace(/`+/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return { speak, stop, speaking, supported };
};
