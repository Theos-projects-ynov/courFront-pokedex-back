import axios from 'axios';
import { IPokemonAdversaire, IPokemonMove, IPokemonStats } from '../models/IPokemonAdversaire';

// Roster des Pokémon disponibles pour les donjons
const POKEMON_ROSTER = [
  1, 4, 7, 25, 39, 52, 54, 58, 60, 63, 66, 69, 72, 74, 81, 84, 86, 90, 92, 95,
  100, 102, 104, 109, 111, 116, 118, 120, 129, 133, 138, 140, 147, 152, 155, 158
];

export class DungeonPokemonService {

  /**
   * Génère 3 Pokémon adversaires pour un donjon
   */
  async generateEnemyPokemons(spawnLevels: number[]): Promise<IPokemonAdversaire[]> {
    const enemies: IPokemonAdversaire[] = [];

    for (let i = 0; i < 3; i++) {
      const randomPokedexId = POKEMON_ROSTER[Math.floor(Math.random() * POKEMON_ROSTER.length)];
      const level = spawnLevels[i];
      
      const enemy = await this.generatePokemonAdversaire(randomPokedexId, level);
      enemies.push(enemy);
    }

    return enemies;
  }

  /**
   * Génère les informations du boss comme un adversaire complet
   */
  async generateBossPokemon(pokedexId: number, level: number): Promise<IPokemonAdversaire> {
    const pokemonData = await this.fetchPokemonData(pokedexId);
    const stats = this.calculateStats(pokemonData.stats, level);
    const bossMoves = this.generateBossMoves(pokedexId);

    return {
      id: `boss_${pokedexId}_${level}_${Date.now()}_${Math.random()}`,
      pokedexId,
      name: pokemonData.name?.fr || pokemonData.name?.en || 'Boss inconnu',
      level,
      hp: stats.hp,
      maxHp: stats.hp,
      stats,
      moves: bossMoves,
      sprite: pokemonData.sprites?.regular || '',
      types: pokemonData.types?.map((t: any) => t.name) || [],
      genre: Math.random() > 0.5 ? 'male' : 'female',
      isShiny: Math.random() < 0.1 // 10% de chance d'être shiny pour un boss
    };
  }

  /**
   * Génère un Pokémon adversaire complet
   */
  private async generatePokemonAdversaire(pokedexId: number, level: number): Promise<IPokemonAdversaire> {
    const pokemonData = await this.fetchPokemonData(pokedexId);
    const stats = this.calculateStats(pokemonData.stats, level);
    const moves = await this.generateMoves(pokedexId, level);

    return {
      id: `enemy_${pokedexId}_${level}_${Date.now()}_${Math.random()}`,
      pokedexId,
      name: pokemonData.name?.fr || pokemonData.name?.en || 'Pokémon inconnu',
      level,
      hp: stats.hp,
      maxHp: stats.hp,
      stats,
      moves,
      sprite: pokemonData.sprites?.regular || '',
      types: pokemonData.types?.map((t: any) => t.name) || [],
      genre: Math.random() > 0.5 ? 'male' : 'female',
      isShiny: Math.random() < 0.05 // 5% de chance d'être shiny
    };
  }

  /**
   * Récupère les données d'un Pokémon depuis l'API
   */
  private async fetchPokemonData(pokedexId: number): Promise<any> {
    try {
      const response = await axios.get(`https://tyradex.app/api/v1/pokemon/${pokedexId}`);
      return response.data;
    } catch (error) {
      // Données par défaut si l'API échoue
      return {
        name: { fr: `Pokémon ${pokedexId}` },
        stats: { hp: 45, atk: 49, def: 49, spe: 45, atk_spe: 65, def_spe: 65 },
        types: [{ name: 'Normal' }],
        sprites: { regular: '' }
      };
    }
  }

  /**
   * Calcule les stats d'un Pokémon à un niveau donné
   */
  private calculateStats(baseStats: any, level: number): IPokemonStats {
    if (!baseStats) {
      // Stats par défaut
      return {
        hp: Math.floor((45 * 2 * level) / 100 + level + 10),
        attack: Math.floor((49 * 2 * level) / 100 + 5),
        defense: Math.floor((49 * 2 * level) / 100 + 5),
        speed: Math.floor((45 * 2 * level) / 100 + 5),
        specialAttack: Math.floor((65 * 2 * level) / 100 + 5),
        specialDefense: Math.floor((65 * 2 * level) / 100 + 5)
      };
    }

    return {
      hp: Math.floor((baseStats.hp * 2 * level) / 100 + level + 10),
      attack: Math.floor((baseStats.atk * 2 * level) / 100 + 5),
      defense: Math.floor((baseStats.def * 2 * level) / 100 + 5),
      speed: Math.floor((baseStats.spe * 2 * level) / 100 + 5),
      specialAttack: Math.floor((baseStats.atk_spe * 2 * level) / 100 + 5),
      specialDefense: Math.floor((baseStats.def_spe * 2 * level) / 100 + 5)
    };
  }

  /**
   * Génère des attaques pour un Pokémon
   */
  private async generateMoves(pokedexId: number, level: number): Promise<IPokemonMove[]> {
    // Pour l'instant, génération basique - à améliorer avec la vraie logique d'attaques
    const basicMoves: IPokemonMove[] = [
      {
        id: 1,
        name: 'Charge',
        type: 'Normal',
        power: 40,
        accuracy: 100,
        pp: 35,
        maxPp: 35,
        priority: 0,
        damageClass: 'physical'
      },
      {
        id: 2,
        name: 'Rugissement',
        type: 'Normal',
        power: null,
        accuracy: 100,
        pp: 40,
        maxPp: 40,
        priority: 0,
        damageClass: 'status'
      }
    ];

    return basicMoves.slice(0, Math.min(4, Math.floor(level / 10) + 2));
  }

  /**
   * Génère les attaques spéciales du boss
   */
  private generateBossMoves(pokedexId: number): IPokemonMove[] {
    // Pour Mew (151) - Attaques équilibrées mais puissantes
    if (pokedexId === 151) {
      return [
        {
          id: 1,
          name: 'Psyko',
          type: 'Psy',
          power: 70,
          accuracy: 100,
          pp: 20,
          maxPp: 20,
          priority: 0,
          damageClass: 'special'
        },
        {
          id: 2,
          name: 'Ombre Portée',
          type: 'Spectre',
          power: 60,
          accuracy: 100,
          pp: 15,
          maxPp: 15,
          priority: 0,
          damageClass: 'special'
        },
        {
          id: 3,
          name: 'Lance-Flammes',
          type: 'Feu',
          power: 65,
          accuracy: 95,
          pp: 15,
          maxPp: 15,
          priority: 0,
          damageClass: 'special'
        },
        {
          id: 4,
          name: 'Tonnerre',
          type: 'Électrik',
          power: 65,
          accuracy: 95,
          pp: 15,
          maxPp: 15,
          priority: 0,
          damageClass: 'special'
        }
      ];
    }
    
    // Attaques de boss par défaut pour les autres boss
    return [
      {
        id: 1,
        name: 'Charge Puissante',
        type: 'Normal',
        power: 80,
        accuracy: 100,
        pp: 15,
        maxPp: 15,
        priority: 0,
        damageClass: 'physical'
      },
      {
        id: 2,
        name: 'Attaque Ultime',
        type: 'Normal',
        power: 100,
        accuracy: 85,
        pp: 10,
        maxPp: 10,
        priority: 0,
        damageClass: 'physical'
      }
    ];
  }
}

export const dungeonPokemonService = new DungeonPokemonService(); 