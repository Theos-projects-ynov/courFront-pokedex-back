import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import DungeonPokemonCard from "./DungeonPokemonCard";
import type {
  Enemy,
  Boss,
  CurrentHp,
  MaxHp,
  PokemonNames,
} from "../../types/Dungeon";

interface EnemiesSectionProps {
  enemies: Enemy[];
  boss: Boss;
  defeatedEnemies: number;
  currentHp: CurrentHp;
  maxHp: MaxHp;
  koedPokemon: Set<string>;
  pokemonNames: PokemonNames;
}

const EnemiesSection: React.FC<EnemiesSectionProps> = ({
  enemies,
  boss,
  defeatedEnemies,
  currentHp,
  maxHp,
  koedPokemon,
  pokemonNames,
}) => {
  return (
    <Card className="enemies-section">
      <CardContent>
        <Typography variant="h6" className="enemies-title">
          Adversaires
        </Typography>

        <div className="enemies-grid">
          {/* Les 3 ennemis */}
          {enemies.map((enemy) => {
            const isEnemyKO =
              koedPokemon.has(enemy.id) || currentHp[enemy.id] === 0;
            return (
              <DungeonPokemonCard
                key={enemy.id}
                pokedexId={enemy.pokedexId}
                name={enemy.name}
                level={enemy.level}
                sprite={enemy.sprite}
                currentHp={
                  currentHp[enemy.id] !== undefined
                    ? currentHp[enemy.id]
                    : enemy.hp
                }
                maxHp={maxHp[enemy.id] || enemy.maxHp}
                isKO={isEnemyKO}
                type="Enemy"
                pokemonNames={pokemonNames}
              />
            );
          })}

          {/* Le boss - révélé quand tous les ennemis sont vaincus */}
          {defeatedEnemies >= 3 ? (
            (() => {
              // Trouver l'ID du boss dans currentHp (commence par "boss_")
              const bossRealId = Object.keys(currentHp).find((id) =>
                id.startsWith("boss_")
              );
              const bossCurrentHp = bossRealId
                ? currentHp[bossRealId]
                : boss.stats.hp;
              const bossMaxHp =
                bossRealId && maxHp[bossRealId]
                  ? maxHp[bossRealId]
                  : boss.stats.hp;
              const isBossKO =
                koedPokemon.has(bossRealId || "") || bossCurrentHp === 0;

              return (
                <DungeonPokemonCard
                  key={bossRealId || "boss"}
                  pokedexId={boss.pokedexId}
                  name={pokemonNames[boss.pokedexId] || boss.name}
                  level={boss.level}
                  sprite={boss.sprite}
                  currentHp={bossCurrentHp}
                  maxHp={bossMaxHp}
                  isKO={isBossKO}
                  type="Boss"
                  pokemonNames={pokemonNames}
                />
              );
            })()
          ) : (
            <DungeonPokemonCard
              key="boss-mystery"
              name="Boss Final"
              level={boss.level}
              sprite=""
              currentHp={boss.stats.hp}
              maxHp={boss.stats.hp}
              isKO={false}
              type="Boss"
              showMystery={true}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnemiesSection;
