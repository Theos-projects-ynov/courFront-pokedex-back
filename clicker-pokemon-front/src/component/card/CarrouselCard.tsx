import "../../style/component/card/carrouselCard.scss";
import IconProfils from "./IconProfils";
import { useTrainerSelector } from "../../hooks/useSelector";
import { useDispatcher } from "../../hooks/useDispatcher";

function CarrouselCard() {
  const { trainers, activeTrainer } = useTrainerSelector();
  const { setActiveTrainer } = useDispatcher();

  const handleTrainerActive = (id: number) => {
    if (trainers[id]) {
      setActiveTrainer(trainers[id].id);
    }
  };

  return (
    <div className="carrousel-card">
      <div className="carrousel-card__container">
        {trainers.map((trainer, index) => (
          <IconProfils
            key={trainer.id}
            image={trainer.image}
            handleTrainerActive={handleTrainerActive}
            id={index}
            isActive={trainer.id === activeTrainer?.id}
          />
        ))}
      </div>
    </div>
  );
}

export default CarrouselCard;
