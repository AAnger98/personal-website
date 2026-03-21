interface Props {
  selectedWords: string[];
  maxWords: number;
  onDeselect: (word: string) => void;
}

export default function SelectionIsland({
  selectedWords,
  maxWords,
  onDeselect,
}: Props) {
  const count = selectedWords.length;
  const isFull = count >= maxWords;
  const progressPct = (count / maxWords) * 100;

  const counterText =
    count === 0
      ? `Select ${maxWords} words that resonate with you`
      : isFull
        ? `${count} of ${maxWords} selected \u2014 deselect one to choose another`
        : `${count} of ${maxWords} selected`;

  return (
    <div className="sw-island" aria-label="Selected words">
      <div className="sw-island__slots">
        {selectedWords.map(word => (
          <span key={word} className="sw-island__slot--filled">
            <span className="sw-island__chip-label">{'\u2611'} {word}</span>
            <button
              className="sw-island__remove"
              onClick={() => onDeselect(word)}
              aria-label={`Remove ${word}`}
              type="button"
            >
              {'\u2715'}
            </button>
          </span>
        ))}
        {Array.from({ length: maxWords - count }, (_, i) => (
          <span key={`empty-${i}`} className="sw-island__slot--empty" aria-hidden="true" />
        ))}
      </div>

      <div className="sw-island__progress">
        <div
          className="sw-island__bar"
          role="progressbar"
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={maxWords}
          style={{ '--island-progress': `${progressPct}%` } as React.CSSProperties}
        />
        <span className="sw-island__progress-text" aria-live="polite">{counterText}</span>
      </div>
    </div>
  );
}
