import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pokemon } from "../../service/api";
import "../../style/page/pokemonPage.scss";
import { useGetPokemonQuery } from "../../api/PokemonAPI";

function PokemonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  const { data, isLoading, isError } = useGetPokemonQuery(id || "");

  useEffect(() => {
    if (data) {
      setPokemon(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="pokemon-page">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pokemon-page">
        <div className="error-container">
          <h2 className="error-message">Pokémon non trouvé</h2>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="pokemon-page">
        <div className="error-container">
          <h2 className="error-message">Pokémon non trouvé</h2>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pokemon-page">
      <div className="header-container-pokemon">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          Retour
        </button>
        <h1 className="pokemon-title">
          {pokemon.name.fr}{" "}
          <span className="pokemon-id">#{pokemon.pokedex_id}</span>
        </h1>
      </div>

      <div className="card">
        <div className="card-image">
          <img src={pokemon.sprites.regular} alt={pokemon.name.fr} />
        </div>
        <div className="card-content">
          <div className="types-container">
            {pokemon.types.map((type) => (
              <span
                key={type.name}
                className="type-tag"
                style={{
                  backgroundImage: `url(${type.image})`,
                  backgroundSize: "cover",
                }}
              >
                <p>{type.name}</p>
              </span>
            ))}
          </div>

          <p className="info-text">
            <strong>Catégorie:</strong> {pokemon.category}
          </p>
          <p className="info-text">
            <strong>Taille:</strong> {pokemon.height}
          </p>
          <p className="info-text">
            <strong>Poids:</strong> {pokemon.weight}
          </p>
        </div>
      </div>

      {pokemon.evolution &&
        pokemon.evolution.next &&
        pokemon.evolution.next.length > 0 && (
          <div className="card">
            <div className="card-content">
              <h3 className="section-title">Évolutions</h3>
              {pokemon.evolution.next.map((evo, index) => (
                <div key={index} className="evolution-row">
                  <p className="evolution-text">
                    → <strong>{evo.name}</strong> ({evo.condition})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

export default PokemonPage;
