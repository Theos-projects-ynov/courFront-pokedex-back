import axios from 'axios';

const TYRADEX_BASE_URL = 'https://tyradex.app/api/v1';

// Récupérer les infos d’un Pokémon par nom (français) ou ID
export async function getPokemonByNameOrId(nameOrId: string | number) {
  const url = `${TYRADEX_BASE_URL}/pokemon/${nameOrId}`;
  const res = await axios.get(url);
  return res.data;
}

// Exemple d’autres endpoints Tyradex si besoin : 
// - https://tyradex.app/api/v1/pokemon
// - https://tyradex.app/api/v1/types
