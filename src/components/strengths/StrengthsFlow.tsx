// src/components/strengths/StrengthsFlow.tsx
import { useState, useEffect } from 'react';
import { logEvent } from '../../lib/telemetry';
import WordSelectionStep, { type Word } from './WordSelectionStep';
import ReflectionStep from './ReflectionStep';
import PitchStep from './PitchStep';
import PdfDownloadStep from './PdfDownloadStep';
import FeedbackStep from './FeedbackStep';

interface Props {
  words: Word[];
}

export interface Reflection {
  why: string;
  moment: string;
}

export type Step = 'word-selection' | 'reflection' | 'pitch' | 'pdf' | 'feedback';

const STEP_LABELS = ['Select', 'Reflect', 'Pitch', 'Download', 'Feedback'];

const STEP_NUMBER: Record<Step, number> = {
  'word-selection': 1,
  'reflection': 2,
  'pitch': 3,
  'pdf': 4,
  'feedback': 5,
};

export default function StrengthsFlow({ words }: Props) {
  const [step, setStep] = useState<Step>('word-selection');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [reflections, setReflections] = useState<Record<string, Reflection>>({});
  const [pitch, setPitch] = useState('');

  // Fire flow-started telemetry once on mount — enables abandonment-rate-by-step calculation
  useEffect(() => {
    logEvent('strengths_flow_started');
  }, []);

  const handleRestart = () => {
    logEvent('strengths_flow_started'); // re-fires on each restart session
    setStep('word-selection');
    setSelectedWords([]);
    setReflections({});
    setPitch('');
  };

  return (
    <div>
      <div className="sp-root">
        <div className="sp-steps">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const currentNum = STEP_NUMBER[step];
            const isDone = stepNum < currentNum;
            const isCurrent = stepNum === currentNum;
            return (
              <div
                key={label}
                className={`sp-step${isDone ? ' sp-step--done' : ''}${isCurrent ? ' sp-step--current' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="sp-step__num">{isDone ? '✓' : stepNum}</span>
                <span className="sp-step__label">{label}</span>
              </div>
            );
          })}
        </div>
        <div className="sp-meta">
          <span className="sp-meta__count">{STEP_NUMBER[step]} of 5</span>
          <button className="sp-restart" onClick={handleRestart} type="button">
            START OVER
          </button>
        </div>
      </div>

      <div key={step} className="sf-step-transition">
      {step === 'word-selection' && (
        <WordSelectionStep
          words={words}
          initialSelected={selectedWords}
          onComplete={selected => {
            setSelectedWords(selected);
            setStep('reflection');
          }}
        />
      )}

      {step === 'reflection' && (
        <ReflectionStep
          selectedWords={selectedWords}
          onComplete={data => {
            setReflections(data);
            setStep('pitch');
          }}
          onBack={() => setStep('word-selection')}
        />
      )}

      {step === 'pitch' && selectedWords.length > 0 && (
        <PitchStep
          topWord={selectedWords[0]!}
          onComplete={text => {
            setPitch(text);
            setStep('pdf');
          }}
          onBack={() => setStep('reflection')}
        />
      )}

      {step === 'pdf' && (
        <PdfDownloadStep
          selectedWords={selectedWords}
          reflections={reflections}
          pitch={pitch}
          onComplete={() => setStep('feedback')}
          onBack={() => setStep('pitch')}
        />
      )}

      {step === 'feedback' && (
        <FeedbackStep onComplete={handleRestart} />
      )}
      </div>
    </div>
  );
}
