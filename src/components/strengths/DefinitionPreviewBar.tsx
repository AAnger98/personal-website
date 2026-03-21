import { useDefinition } from './DefinitionContext';

export default function DefinitionPreviewBar() {
  const { activeDefinition } = useDefinition();

  return (
    <div className="sw-definition-bar" aria-live="polite">
      {activeDefinition ? (
        <div className="sw-definition-bar__content sw-definition-bar__content--active">
          <span className="sw-definition-bar__word">{activeDefinition.word}</span>
          <span className="sw-definition-bar__sep"> — </span>
          <span className="sw-definition-bar__text">{activeDefinition.definition}</span>
        </div>
      ) : (
        <div className="sw-definition-bar__content sw-definition-bar__content--idle">
          <span className="sw-definition-bar__prompt">Hover over a word to see its definition</span>
        </div>
      )}
    </div>
  );
}
