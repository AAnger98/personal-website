// src/components/strengths/PitchStep.tsx
import { useState, useRef } from 'react';
import { logEvent } from '../../lib/telemetry';

const PITCH_EXAMPLES = [
  {
    label: 'The Connector',
    strengths: 'Empathy, Communication, Collaboration',
    text: "I'm someone who builds bridges between people and ideas. My strength in empathy means I naturally understand what different stakeholders need, and I use that to create alignment where others see conflict. Whether I'm leading a cross-functional team or facilitating a tough conversation, I bring people together to solve problems that matter.",
  },
  {
    label: 'The Strategist',
    strengths: 'Analytical, Visionary, Decisiveness',
    text: "I see patterns where others see noise. My analytical mind lets me cut through complexity to find the signal, and my decisiveness means I don't just analyze \u2014 I act. I'm the person teams turn to when they need a clear path forward through ambiguity, whether that's entering a new market or restructuring a struggling business unit.",
  },
  {
    label: 'The Builder',
    strengths: 'Resilience, Creativity, Leadership',
    text: "I turn ideas into reality, especially when the path isn't obvious. My resilience means setbacks are just data points, and my creativity helps me find solutions others miss. I've built teams, products, and processes from scratch \u2014 and what drives me is seeing something go from 'impossible' to 'inevitable.'",
  },
];

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

      <details className="spi-examples" open>
        <summary className="spi-examples__toggle">
          See example pitches for inspiration
        </summary>
        <div className="spi-examples__list">
          {PITCH_EXAMPLES.map(ex => (
            <div key={ex.label} className="spi-example">
              <div className="spi-example__header">
                <span className="spi-example__label">{ex.label}</span>
                <span className="spi-example__strengths">{ex.strengths}</span>
              </div>
              <p className="spi-example__text">{ex.text}</p>
            </div>
          ))}
        </div>
      </details>

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
