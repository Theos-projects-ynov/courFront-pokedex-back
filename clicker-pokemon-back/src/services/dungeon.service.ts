import prisma from '../config/db';
import { IDungeon, IDungeonInfo, IDynamicRewards } from '../models/IDungeon';
import { IDungeonSession, DungeonStatus } from '../models/IDungeonSession';
import { dungeonPokemonService } from './dungeonPokemon.service';

export class DungeonService {
  
  /**
   * Récupère tous les donjons actifs
   */
  async getActiveDungeons(): Promise<IDungeon[]> {
    const dungeons = await prisma.dungeon.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' }
    });
    return dungeons as IDungeon[];
  }

  /**
   * Récupère un donjon par son ID
   */
  async getDungeonById(dungeonId: number): Promise<IDungeon | null> {
    const dungeon = await prisma.dungeon.findFirst({
      where: { 
        id: dungeonId,
        isActive: true 
      }
    });
    return dungeon as IDungeon | null;
  }

  /**
   * Génère les informations complètes d'un donjon (adversaires + récompenses)
   */
  async generateDungeonInfo(dungeonId: number): Promise<IDungeonInfo | null> {
    const dungeon = await this.getDungeonById(dungeonId);
    if (!dungeon) return null;

    // Générer les 3 Pokémon adversaires
    const enemies = await dungeonPokemonService.generateEnemyPokemons(
      dungeon.spawnLevels as number[]
    );

    // Générer les infos du boss
    const boss = await dungeonPokemonService.generateBossPokemon(
      dungeon.bossPokemonId,
      dungeon.bossLevel
    );

    // Calculer les récompenses dynamiques
    const dynamicRewards = this.calculateDynamicRewards(dungeon);

    return {
      dungeon,
      boss,
      enemies,
      dynamicRewards
    };
  }

  /**
   * Crée ou met à jour une session de donjon
   */
  async createOrUpdateSession(
    trainerId: string,
    dungeonId: number,
    selectedPokemonIds: string[]
  ): Promise<IDungeonSession> {
    // Supprimer une session existante si elle existe
    await prisma.dungeonSession.deleteMany({
      where: { trainerId }
    });

    // Générer les adversaires pour cette session
    const dungeon = await this.getDungeonById(dungeonId);
    if (!dungeon) {
      throw new Error('Donjon introuvable');
    }

    const enemies = await dungeonPokemonService.generateEnemyPokemons(
      dungeon.spawnLevels as number[]
    );
    const boss = await dungeonPokemonService.generateBossPokemon(
      dungeon.bossPokemonId,
      dungeon.bossLevel
    );

    // Ajouter le boss aux ennemis (à la fin)
    const allEnemies = [...enemies, boss];

    console.log(`[DUNGEON SERVICE] Creating session with ${allEnemies.length} enemies for trainer ${trainerId}`);
    console.log(`[DUNGEON SERVICE] Enemies data:`, JSON.stringify(allEnemies, null, 2));

    const session = await prisma.dungeonSession.create({
      data: {
        trainerId,
        dungeonId,
        selectedPokemon: selectedPokemonIds,
        status: 'READY',
        defeatedEnemies: 0,
        enemyPokemons: allEnemies
      }
    });

    // Vérifier que les ennemis ont bien été sauvegardés
    const createdSession = await prisma.dungeonSession.findUnique({
      where: { trainerId }
    });
    
    console.log(`[DUNGEON SERVICE] Session created with enemyPokemons:`, createdSession?.enemyPokemons ? 'YES' : 'NO');
    if (createdSession?.enemyPokemons) {
      const enemyCount = Array.isArray(createdSession.enemyPokemons) ? createdSession.enemyPokemons.length : 0;
      console.log(`[DUNGEON SERVICE] Enemy count in saved session: ${enemyCount}`);
    }

    return {
      ...session,
      selectedPokemon: session.selectedPokemon as any,
      enemyPokemons: session.enemyPokemons as any,
      deadPokemonIds: session.deadPokemonIds as any
    } as IDungeonSession;
  }

  /**
   * Récupère la session active d'un joueur
   */
  async getActiveSession(trainerId: string): Promise<IDungeonSession | null> {
    const session = await prisma.dungeonSession.findUnique({
      where: { trainerId }
    });
    
    if (!session) return null;
    
    return {
      ...session,
      selectedPokemon: session.selectedPokemon as any,
      enemyPokemons: session.enemyPokemons as any,
      deadPokemonIds: session.deadPokemonIds as any
    } as IDungeonSession;
  }

  /**
   * Met à jour le statut d'une session
   */
  async updateSessionStatus(
    trainerId: string,
    status: DungeonStatus,
    defeatedEnemies?: number
  ): Promise<IDungeonSession | null> {
    const updateData: any = { status };
    
    if (defeatedEnemies !== undefined) {
      updateData.defeatedEnemies = defeatedEnemies;
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const session = await prisma.dungeonSession.update({
      where: { trainerId },
      data: updateData
    });

    return {
      ...session,
      selectedPokemon: session.selectedPokemon as any,
      enemyPokemons: session.enemyPokemons as any,
      deadPokemonIds: session.deadPokemonIds as any
    } as IDungeonSession;
  }

  /**
   * Ajoute un pokémon mort à la session
   */
  async addDeadPokemon(trainerId: string, pokemonId: string): Promise<void> {
    const session = await prisma.dungeonSession.findUnique({
      where: { trainerId }
    });
    
    if (!session) return;
    
    const currentDeadIds = (session.deadPokemonIds as string[]) || [];
    if (!currentDeadIds.includes(pokemonId)) {
      currentDeadIds.push(pokemonId);
      
      await prisma.dungeonSession.update({
        where: { trainerId },
        data: { deadPokemonIds: currentDeadIds }
      });
    }
  }

  /**
   * Supprime une session
   */
  async deleteSession(trainerId: string): Promise<boolean> {
    const result = await prisma.dungeonSession.deleteMany({
      where: { trainerId }
    });
    return result.count > 0;
  }

  /**
   * Calcule les récompenses dynamiques basées sur le donjon
   */
  private calculateDynamicRewards(dungeon: IDungeon): IDynamicRewards {
    const baseReward = dungeon.id * 100;
    
    return {
      money: baseReward + Math.floor(Math.random() * 200),
      experience: baseReward * 2,
      items: [
        {
          name: 'Potion',
          quantity: Math.floor(Math.random() * 3) + 1,
          rarity: 'common'
        },
        {
          name: 'Super Ball',
          quantity: Math.floor(Math.random() * 2) + 1,
          rarity: 'uncommon'
        }
      ]
    };
  }

  /**
   * Initialise un donjon par défaut si aucun n'existe
   */
  async initializeDefaultDungeon(): Promise<void> {
    try {
      // Vérifier s'il y a déjà des donjons
      const existingDungeons = await prisma.dungeon.findMany();
      
      if (existingDungeons.length > 0) {
        console.log(`[DUNGEON SERVICE] ${existingDungeons.length} donjon(s) déjà présent(s) en base`);
        return;
      }

      console.log('[DUNGEON SERVICE] Aucun donjon trouvé, création du donjon par défaut...');

      // Créer le donjon par défaut avec Mew
      const defaultDungeon = await prisma.dungeon.create({
        data: {
          name: "Sanctuaire de Mew",
          description: "Un donjon mystérieux où règne le légendaire Mew. Trois gardiens protègent l'entrée de ce lieu sacré avant que vous ne puissiez affronter le maître des lieux.",
          rewards: JSON.stringify({
            money: 500,
            experience: 1200,
            items: [
              { name: "Potion", quantity: 2, rarity: "common" },
              { name: "Super Ball", quantity: 2, rarity: "uncommon" }
            ]
          }),
          bossPokemonId: 151, // Mew
          bossLevel: 25,
          spawnLevels: [15, 17, 20], // Niveaux des 3 pokémon gardiens
          isActive: true
        }
      });

      console.log(`[DUNGEON SERVICE] ✅ Donjon par défaut créé avec succès : "${defaultDungeon.name}" (ID: ${defaultDungeon.id})`);
      console.log(`[DUNGEON SERVICE] Boss: Mew niveau ${defaultDungeon.bossLevel}`);
      console.log(`[DUNGEON SERVICE] Gardiens: niveaux ${(defaultDungeon.spawnLevels as number[]).join(', ')}`);
      
    } catch (error) {
      console.error('[DUNGEON SERVICE] ❌ Erreur lors de l\'initialisation du donjon par défaut:', error);
    }
  }
}

export const dungeonService = new DungeonService(); 