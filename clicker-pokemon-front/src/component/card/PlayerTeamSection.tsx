import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import DungeonPokemonCard from "./DungeonPokemonCard";
import type {
  PlayerTeam,
  CurrentHp,
  MaxHp,
  PokemonNames,
} from "../../types/Dungeon";

interface PlayerTeamSectionProps {
  dungeonName: string;
  playerTeam: PlayerTeam[];
  currentHp: CurrentHp;
  maxHp: MaxHp;
  koedPokemon: Set<string>;
  pokemonNames: PokemonNames;
}

const PlayerTeamSection: React.FC<PlayerTeamSectionProps> = ({
  dungeonName,
  playerTeam,
  currentHp,
  maxHp,
  koedPokemon,
  pokemonNames,
}) => {
  return (
    <Card className="player-team-header">
      <CardContent>
        <Typography variant="h5" className="team-title">
          Mon équipe - {dungeonName}
        </Typography>
        <div className="player-team-grid">
          {playerTeam.map((pokemon) => (
            <DungeonPokemonCard
              key={pokemon.id}
              pokedexId={pokemon.pokedexId}
              name={pokemon.name}
              level={pokemon.level}
              sprite={pokemon.sprite}
              currentHp={
                currentHp[pokemon.id] !== undefined
                  ? currentHp[pokemon.id]
                  : pokemon.stats.hp
              }
              maxHp={maxHp[pokemon.id] || pokemon.stats.maxHp}
              isKO={koedPokemon.has(pokemon.id) || currentHp[pokemon.id] === 0}
              type="MyTeam"
              pokemonNames={pokemonNames}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerTeamSection;
