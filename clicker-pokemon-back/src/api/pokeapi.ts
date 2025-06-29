import axios from "axios";

export async function getFromPokeAPIMoveByMoveId(moveId: number) {
  const res = await axios.get(`https://pokeapi.co/api/v2/move/${moveId}`);
  
  const movePokemon = {
    id: res.data.id,
    name: res.data.name,
    type: res.data.type.name,
    power: res.data.power,
    accuracy: res.data.accuracy,
    pp: res.data.pp,
    priority: res.data.priority,
    damageClass: res.data.damage_class.name,
  }

  console.log("[pokeapi.ts] - movePokemon : ", movePokemon);

  return movePokemon;
}

export async function getFromPokeAPIMoves(pokemonId: number) {
  const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  const resMoves: object[] = [];
  const moves = res.data.moves;

  moves.map((move:any) => {
    // console.log("[pokeapi.ts] - moves : ", move);
    console.log("[pokeapi.ts] - move Split : ", move.move.url.split("/"));
    console.log("[pokeapi.ts] - move Split 2 : ", move.move.url.split("/").pop());
    console.log("[pokeapi.ts] - move : ", move.move.name);
    const moveData = {
        pokemonId: pokemonId,
        moveId: parseInt(move.move.url.split("/")[move.move.url.split("/").length - 2]),
        level: move.version_group_details[0].level_learned_at,
    }
    resMoves.push(moveData);
  });

  console.log("[pokeapi.ts] - res : ", resMoves);
//   console.log("[pokeapi.ts] - res : ", resMoves);

  return resMoves;

}
