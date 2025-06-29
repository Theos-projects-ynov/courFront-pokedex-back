import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export const useTrainerSelector = () => {
  const trainers = useSelector((state: RootState) =>
    Object.values(state.trainer.trainers)
  );

  const activeTrainerId = useSelector(
    (state: RootState) => state.trainer.activeTrainerId
  );

  const activeTrainer = useSelector((state: RootState) =>
    state.trainer.activeTrainerId
      ? state.trainer.trainers[state.trainer.activeTrainerId]
      : null
  );

  const trainerIds = useSelector((state: RootState) =>
    Object.keys(state.trainer.trainers)
  );

  const trainersMap = useSelector((state: RootState) => state.trainer.trainers);

  return {
    trainers,
    activeTrainer,
    activeTrainerId,
    trainerIds,
    trainersMap,
  };
};
