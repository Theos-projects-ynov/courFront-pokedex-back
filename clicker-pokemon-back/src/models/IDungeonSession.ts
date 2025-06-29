import { IPokemonAdversaire } from './IPokemonAdversaire';

export interface IDungeonSession {
  id: string;
  trainerId: string;
  dungeonId: number;
  selectedPokemon: string[]; // IDs des 4 Pokémon sélectionnés
  status: DungeonStatus;
  defeatedEnemies: number;
  enemyPokemons?: IPokemonAdversaire[]; // 3 Pokémon générés + boss
  deadPokemonIds?: string[]; // IDs des Pokémon du joueur qui sont morts
  currentBattleId?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type DungeonStatus = 
  | 'READY'        // Équipe sélectionnée, donjon pas encore commencé
  | 'IN_PROGRESS'  // Donjon en cours, entre les combats
  | 'BATTLE'       // En combat contre un adversaire
  | 'COMPLETED'    // Donjon terminé avec succès
  | 'FAILED';      // Donjon échoué

export interface IDungeonTeamSelection {
  trainerId: string;
  dungeonId: number;
  selectedPokemonIds: string[]; // Exactement 4 Pokémon
} 