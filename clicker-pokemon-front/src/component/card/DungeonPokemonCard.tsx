import React from "react";
import { Typography } from "@mui/material";

interface DungeonPokemonCardProps {
  pokedexId?: number;
  name: string;
  level: number;
  sprite: string;
  currentHp: number;
  maxHp: number;
  isKO: boolean;
  type: "MyTeam" | "Enemy" | "Boss";
  pokemonNames?: { [key: number]: string };
  onClick?: () => void;
  isSelected?: boolean;
  showMystery?: boolean; // Pour le boss avant d'être révélé
}

const DungeonPokemonCard: React.FC<DungeonPokemonCardProps> = ({
  pokedexId,
  name,
  level,
  sprite,
  currentHp,
  maxHp,
  isKO,
  type,
  pokemonNames,
  onClick,
  isSelected = false,
  showMystery = false,
}) => {
  const displayName =
    pokedexId && pokemonNames?.[pokedexId] ? pokemonNames[pokedexId] : name;

  const getCardClassName = () => {
    let baseClass = "pokemon-card";
    if (type === "MyTeam") baseClass += " pokemon-card--team";
    if (type === "Enemy") baseClass += " pokemon-card--enemy";
    if (type === "Boss") baseClass += " pokemon-card--boss";
    if (isKO) baseClass += " pokemon-card--ko";
    if (isSelected) baseClass += " pokemon-card--selected";
    if (onClick) baseClass += " pokemon-card--clickable";
    return baseClass;
  };

  const cardStyle: React.CSSProperties = {
    opacity: isKO ? 0.5 : 1,
    cursor: onClick && !isKO ? "pointer" : "default",
    filter: isKO ? "grayscale(100%)" : "none",
  };

  if (showMystery) {
    return (
      <div className={getCardClassName()} style={cardStyle} onClick={onClick}>
        <div className="pokemon-card__mystery">
          <Typography variant="h2" className="pokemon-card__mystery-mark">
            ?
          </Typography>
        </div>
        <Typography variant="body2" className="pokemon-card__name">
          Boss Final
        </Typography>
        <div
          className="pokemon-card__stats"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Typography variant="caption" className="pokemon-card__level">
            Niv. {level}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div
      className={getCardClassName()}
      style={cardStyle}
      onClick={onClick && !isKO ? onClick : undefined}
    >
      <img
        src={sprite}
        alt={displayName}
        className="pokemon-card__sprite"
        style={{ filter: isKO ? "grayscale(100%)" : "none" }}
      />
      <Typography variant="body2" className="pokemon-card__name">
        {displayName} {isKO && "(KO)"}
      </Typography>
      <div
        className="pokemon-card__stats"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Typography variant="caption" className="pokemon-card__level">
          Niv. {level}
        </Typography>
        <Typography variant="caption" className="pokemon-card__hp">
          HP: {currentHp !== undefined ? currentHp : maxHp}/{maxHp}
          {isKO && " (KO)"}
        </Typography>
      </div>
    </div>
  );
};

export default DungeonPokemonCard;
