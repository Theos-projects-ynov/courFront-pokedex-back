import "../../style/component/card/cardProfil.scss";
import React from "react";

// Types temporaires pour éviter les erreurs
interface TempPokemon {
  name: string;
  image: string;
}

function CardProfil({
  name,
  teamPokemon,
}: {
  name: string;
  teamPokemon: TempPokemon[];
}) {
  return (
    <div className="profil-card">
      <h2>{name}</h2>
      <div className="team">
        {teamPokemon?.map((p) => (
          <img key={p.name} src={p.image} alt={p.name} />
        ))}
      </div>
    </div>
  );
}
export default CardProfil;
