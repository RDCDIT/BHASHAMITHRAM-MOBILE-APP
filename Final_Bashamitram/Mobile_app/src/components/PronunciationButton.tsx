/**
 * @file PronunciationButton.tsx
 * @description Drop-in pronunciation button component powered by speechService.
 */

import React from 'react';
import SpeakButton from './SpeakButton';

interface PronunciationButtonProps {
  word: string;
  lang?: 'ml' | 'en';
  size?: number;
}

export default function PronunciationButton({ word, lang, size }: PronunciationButtonProps) {
  return <SpeakButton word={word} lang={lang} size={size} />;
}
