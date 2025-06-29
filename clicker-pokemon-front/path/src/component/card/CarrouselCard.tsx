import React, { useEffect } from "react";
import { ITrainer } from "../../types/Trainer";

function CarrouselCard({
  trainers,
  activeIdx,
  onSelect,
}: {
  trainers: ITrainer[];
  activeIdx: number;
  onSelect: (idx: number) => void;
}) {
  useEffect(() => {
    console.log("trainers : ", trainers);
  }, [trainers]);

  return (
    <div className="carrousel-card">
      {trainers.map((t, i) => (
        <div
          key={t.name}
          className={i === activeIdx ? "active" : ""}
          onClick={() => onSelect(i)}
        >
          <img src={t.image} alt={t.name} />
        </div>
      ))}
    </div>
  );
}
export default CarrouselCard;
