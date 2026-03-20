import { useState } from 'react';
import WordSelectionStep, { type Word } from './WordSelectionStep';

interface Props {
  words: Word[];
}

type Step = 'word-selection' | 'reflection';

export default function StrengthsFlow({ words }: Props) {
  const [step, setStep] = useState<Step>('word-selection');
  const [selections, setSelections] = useState<string[]>([]);

  if (step === 'word-selection') {
    return (
      <WordSelectionStep
        words={words}
        onComplete={selected => {
          setSelections(selected);
          setStep('reflection');
        }}
      />
    );
  }

  // Placeholder — Epic 2 (Reflection) replaces this
  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">STEP 2 OF 5</span>
          <h1 className="sw-title">Your Top Strengths</h1>
          <p className="sw-desc">Reflection step coming soon.</p>
        </div>
      </div>
      <ul className="sw-selections-list">
        {selections.map(w => (
          <li key={w} className="sw-chip sw-chip--selected">
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}
