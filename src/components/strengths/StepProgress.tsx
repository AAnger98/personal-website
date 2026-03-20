// src/components/strengths/StepProgress.tsx
interface Props {
  current: number; // 1-based
  total: number;
  onRestart: () => void;
}

const STEP_LABELS = ['Select', 'Reflect', 'Pitch', 'Download', 'Feedback'];

export default function StepProgress({ current, total, onRestart }: Props) {
  return (
    <div className="sp-root">
      <div className="sp-steps">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isCurrent = stepNum === current;
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
        <span className="sp-meta__count">{current} of {total}</span>
        <button className="sp-restart" onClick={onRestart} type="button">
          START OVER
        </button>
      </div>
    </div>
  );
}
