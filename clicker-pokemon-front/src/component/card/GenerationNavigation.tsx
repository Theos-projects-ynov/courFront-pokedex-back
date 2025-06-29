import React from "react";

interface GenerationNavigationProps {
  generation: number;
  onPrevious: () => void;
  onNext: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const GenerationNavigation: React.FC<GenerationNavigationProps> = ({
  generation,
  onPrevious,
  onNext,
  onChange,
  disabled,
}) => {
  return (
    <div className="button-container">
      {generation > 1 && (
        <button
          className="load-button"
          onClick={onPrevious}
          disabled={disabled}
          aria-label={`Charger la génération ${generation - 1}`}
        >
          ⬅️ Charger Génération {generation - 1}
        </button>
      )}

      <input
        type="number"
        value={generation}
        className="generation-input"
        onChange={onChange}
        min={1}
        max={9}
        disabled={disabled}
        aria-label="Numéro de génération"
      />

      {generation < 9 && (
        <button
          className="load-button"
          onClick={onNext}
          disabled={disabled}
          aria-label={`Charger la génération ${generation + 1}`}
        >
          ➡️ Charger Génération {generation + 1}
        </button>
      )}
    </div>
  );
};

export default GenerationNavigation;
