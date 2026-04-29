// src/components/strengths/IntroStep.tsx
import { logEvent } from '../../lib/telemetry';

interface Props {
  onBegin: () => void;
}

export default function IntroStep({ onBegin }: Props) {
  const handleBegin = () => {
    logEvent('strengths_intro_begin');
    onBegin();
  };

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">BEFORE YOU START</span>
          <h1 className="sw-title">Strengths Identifier</h1>
          <p className="sw-desc">
            A short exercise to surface your core strengths and turn them into language you can use.
            Read through what to expect before you begin — once you start, the first step has a timer.
          </p>
        </div>
      </div>

      <ol className="si-steps">
        <li className="si-step">
          <span className="si-step__num">1</span>
          <div className="si-step__body">
            <h2 className="si-step__title">Select</h2>
            <p className="si-step__desc">
              Pick exactly 5 words that resonate from a list of ~200. <strong>You have 5 minutes</strong>{' '}
              — go with instinct, don&apos;t overthink it.
            </p>
          </div>
        </li>
        <li className="si-step">
          <span className="si-step__num">2</span>
          <div className="si-step__body">
            <h2 className="si-step__title">Reflect</h2>
            <p className="si-step__desc">
              Answer two short prompts for each word, then rank the five so your strongest ability is
              first. No timer.
            </p>
          </div>
        </li>
        <li className="si-step">
          <span className="si-step__num">3</span>
          <div className="si-step__body">
            <h2 className="si-step__title">Pitch</h2>
            <p className="si-step__desc">
              Write a 3–5 sentence elevator pitch grounded in your #1 strength.
            </p>
          </div>
        </li>
        <li className="si-step">
          <span className="si-step__num">4</span>
          <div className="si-step__body">
            <h2 className="si-step__title">Download</h2>
            <p className="si-step__desc">
              Save a personal PDF of your strengths, reflections, and pitch.
            </p>
          </div>
        </li>
      </ol>

      <div className="si-timer-warning" role="note">
        <strong>Heads up:</strong> the 5-minute timer on Step 1 starts as soon as you click Begin. Make
        sure you have a quiet few minutes before you start.
      </div>

      <div className="sw-footer">
        <button className="sw-btn" onClick={handleBegin} type="button">
          BEGIN →
        </button>
      </div>
    </div>
  );
}
