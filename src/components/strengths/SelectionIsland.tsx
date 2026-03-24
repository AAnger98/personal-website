interface SelectionIslandProps {
  selectedWords: Array<{ word: string; definition: string }>;
  maxSelections: number;
  onDeselect: (word: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function SelectionIsland({
  selectedWords,
  maxSelections,
  onDeselect,
  onReorder,
}: SelectionIslandProps) {
  const count = selectedWords.length;
  const isFull = count >= maxSelections;
  const progressPct = (count / maxSelections) * 100;

  const progressText =
    count === 0
      ? `Select ${maxSelections} words that resonate with you`
      : isFull
        ? `${count} of ${maxSelections} selected \u2014 deselect one to choose another`
        : `${count} of ${maxSelections} selected`;

  return (
    <div className="sw-island" aria-label="Selected words">
      <div className="sw-island__slots">
        {selectedWords.map(({ word }, index) => (
          <span key={word} className="sw-island__chip">
            <button
              className="sw-island__chip-move-up"
              onClick={() => onReorder(index, index - 1)}
              disabled={index === 0}
              aria-label={`Move ${word} up`}
              type="button"
            >
              {'\u25B2'}
            </button>
            <span className="sw-island__chip-label">{'\u2611'} {word}</span>
            <button
              className="sw-island__chip-move-down"
              onClick={() => onReorder(index, index + 1)}
              disabled={index === selectedWords.length - 1}
              aria-label={`Move ${word} down`}
              type="button"
            >
              {'\u25BC'}
            </button>
            <button
              className="sw-island__chip-close"
              onClick={() => onDeselect(word)}
              aria-label={`Deselect ${word}`}
              type="button"
            >
              {'\u2715'}
            </button>
          </span>
        ))}
        {Array.from({ length: maxSelections - count }, (_, i) => (
          <span key={`empty-${i}`} className="sw-island__empty-slot" aria-hidden="true" />
        ))}
      </div>

      <div className="sw-island__progress">
        <div
          className="sw-island__progress-bar"
          role="progressbar"
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={maxSelections}
          style={{ '--island-progress': `${progressPct}%` } as React.CSSProperties}
        />
        <span className="sw-island__progress-text" aria-live="polite">{progressText}</span>
      </div>
    </div>
  );
}
