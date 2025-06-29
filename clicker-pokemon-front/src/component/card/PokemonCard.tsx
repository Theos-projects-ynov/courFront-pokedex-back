import React from "react";
import { IPokemon } from "../../types/Pokemon";

interface PokemonCardProps {
  pokemon: IPokemon;
  onClick: () => void;
}

const PokemonCard: React.FC<PokemonCardProps> = React.memo(
  ({ pokemon, onClick }) => {
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    };

    return (
      <div className="pokemon-card">
        <div
          className="card"
          onClick={onClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`Voir les détails de ${pokemon.name.fr}, Pokémon #${pokemon.pokedex_id}`}
        >
          <div className="card-image-container">
            <img
              src={pokemon.sprites.regular}
              alt={pokemon.name.fr}
              className="card-image"
              loading="lazy"
            />
          </div>
          <div className="card-content">
            <h3 className="card-title">{pokemon.name.fr}</h3>
            <p className="card-subtitle">
              #{pokemon.pokedex_id} - {pokemon.category}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

PokemonCard.displayName = "PokemonCard";

export default PokemonCard;
