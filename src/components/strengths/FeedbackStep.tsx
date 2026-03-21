import { useState } from 'react';
import { logEvent } from '../../lib/telemetry';

interface Props {
  onComplete: () => void;
}

export default function FeedbackStep({ onComplete }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    logEvent('strengths_feedback_submitted', {
      rating: rating ?? 0,
      has_comment: comment.trim().length > 0,
    });
    setSubmitted(true);
  };

  const handleSkip = () => {
    logEvent('strengths_feedback_skipped');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="sw-root">
        <div className="sfb-complete">
          <p className="sfb-complete__title">You&apos;re done.</p>
          <p className="sfb-complete__sub">
            Your strengths PDF is ready to practice from. Revisit this exercise in 6 months — your answers will change.
          </p>
          <button className="sw-btn" onClick={onComplete} type="button">
            START OVER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">STEP 5 OF 5</span>
          <h1 className="sw-title">One Last Thing</h1>
          <p className="sw-desc">Optional — takes 10 seconds. Helps improve this tool.</p>
        </div>
      </div>

      <div className="sfb-questions">
        <div className="sfb-question">
          <p id="sfb-rating-label" className="sfb-question-label">Did this exercise help clarify your strengths?</p>
          <div className="sfb-rating" role="group" aria-labelledby="sfb-rating-label">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`sfb-rating-btn${rating === n ? ' sfb-rating-btn--selected' : ''}`}
                onClick={() => setRating(n)}
                type="button"
                aria-pressed={rating === n}
              >
                {n}
              </button>
            ))}
            <span className="sfb-rating-labels">
              <span>Not really</span>
              <span>Very much</span>
            </span>
          </div>
        </div>

        <div className="sfb-question">
          <label className="sfb-question-label" htmlFor="sfb-comment">
            What was most useful? <span className="sfb-optional">(optional)</span>
          </label>
          <textarea
            id="sfb-comment"
            className="sfb-textarea"
            value={comment}
            rows={3}
            placeholder="The part that helped me most was..."
            onChange={e => setComment(e.target.value)}
          />
        </div>
      </div>

      <div className="sw-footer sw-footer--with-back">
        <button className="sw-btn sw-btn--ghost" onClick={handleSkip} type="button">
          SKIP
        </button>
        <button className="sw-btn" onClick={handleSubmit} type="button">
          SUBMIT
        </button>
      </div>
    </div>
  );
}
