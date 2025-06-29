import { IDungeonInfo } from '../../models/IDungeon';
import { IDungeonSession } from '../../models/IDungeonSession';
import { IPokemonAdversaire } from '../../models/IPokemonAdversaire';

// ========== MESSAGES ENTRANTS (Client -> Serveur) ==========

export interface IIncomingMessage {
  type: IncomingMessageType;
  data?: any;
  token?: string;
}

export type IncomingMessageType =
  | 'AUTHENTICATE'
  | 'GET_AVAILABLE_DUNGEONS'
  | 'GET_DUNGEON_INFO'
  | 'SELECT_TEAM'
  | 'START_DUNGEON';

export interface IAuthenticateMessage {
  type: 'AUTHENTICATE';
  token: string;
}

export interface IGetDungeonsMessage {
  type: 'GET_AVAILABLE_DUNGEONS';
}

export interface IGetDungeonInfoMessage {
  type: 'GET_DUNGEON_INFO';
  data: {
    dungeonId: number;
  };
}

export interface ISelectTeamMessage {
  type: 'SELECT_TEAM';
  data: {
    dungeonId: number;
    selectedPokemonIds: string[]; // Exactement 4 Pokémon
  };
}

export interface IStartDungeonMessage {
  type: 'START_DUNGEON';
  data: {
    dungeonId: number;
  };
}

// ========== MESSAGES SORTANTS (Serveur -> Client) ==========

export interface IOutgoingMessage {
  type: OutgoingMessageType;
  data?: any;
  error?: string;
}

export type OutgoingMessageType =
  | 'AUTHENTICATED'
  | 'AVAILABLE_DUNGEONS'
  | 'DUNGEON_INFO'
  | 'TEAM_SELECTED'
  | 'DUNGEON_STARTED'
  | 'ERROR';

export interface IAuthenticatedMessage {
  type: 'AUTHENTICATED';
  data: {
    trainerId: string;
    message: string;
  };
}

export interface IAvailableDungeonsMessage {
  type: 'AVAILABLE_DUNGEONS';
  data: {
    dungeons: Array<{
      id: number;
      name: string;
      description?: string;
      difficulty: string;
      recommendedLevel: number;
      rewards: string;
    }>;
  };
}

export interface IDungeonInfoMessage {
  type: 'DUNGEON_INFO';
  data: IDungeonInfo;
}

export interface ITeamSelectedMessage {
  type: 'TEAM_SELECTED';
  data: {
    session: IDungeonSession;
    dungeonInfo: IDungeonInfo;
    selectedPokemon: Array<{
      id: string;
      name: string;
      level: number;
      pokedexId: number;
    }>;
    message: string;
  };
}

export interface IDungeonStartedMessage {
  type: 'DUNGEON_STARTED';
  data: {
    session: IDungeonSession;
    enemies: IPokemonAdversaire[];
    boss: IPokemonAdversaire;
    message: string;
    nextAction: string;
  };
}

export interface IErrorMessage {
  type: 'ERROR';
  error: string;
  code?: string;
} 