// src/components/strengths/PitchStep.tsx
import { useState, useRef } from 'react';
import { logEvent } from '../../lib/telemetry';

interface Props {
  topWord: string;
  onComplete: (pitch: string) => void;
  onBack: () => void;
}

export default function PitchStep({ topWord, onComplete, onBack }: Props) {
  const [pitch, setPitch] = useState('');
  const startedAt = useRef(Date.now());

  const handleContinue = () => {
    logEvent('strengths_pitch_complete', {
      time_s: Math.round((Date.now() - startedAt.current) / 1000),
      char_count: pitch.length,
      skipped: pitch.trim().length === 0,
    });
    onComplete(pitch);
  };

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">STEP 3 OF 5</span>
          <h1 className="sw-title">Your Elevator Pitch</h1>
          <p className="sw-desc">
            Using your top strength as the foundation, describe who you are professionally in 3–5 sentences.
          </p>
        </div>
      </div>

      <div className="spi-anchor">
        <span className="spi-anchor-label">YOUR #1 STRENGTH</span>
        <span className="spi-anchor-word">{topWord}</span>
      </div>

      <div className="spi-field">
        <label className="spi-label" htmlFor="pitch-input">
          Using <em>{topWord}</em> as your foundation, describe who you are professionally in 3–5 sentences.
        </label>
        <textarea
          id="pitch-input"
          className="spi-textarea"
          value={pitch}
          rows={6}
          placeholder="I am someone who..."
          onChange={e => setPitch(e.target.value)}
        />
        <p className="spi-char-count">{pitch.length} characters</p>
      </div>

      <div className="sw-footer sw-footer--with-back">
        <button className="sw-btn sw-btn--ghost" onClick={onBack} type="button">
          ← BACK
        </button>
        <button className="sw-btn" onClick={handleContinue} type="button">
          CONTINUE →
        </button>
      </div>
    </div>
  );
}
