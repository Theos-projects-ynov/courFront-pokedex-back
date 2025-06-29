import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from "@mui/material";
import { PROFILE_LABELS, UI_CONFIG } from "../../constants/profileConstants";
import { formatters } from "../../utils/profileUtils";
import type { Trainer } from "../../types/Trainer";

interface TrainerProgressCardProps {
  trainer: Trainer;
}

const TrainerProgressCard = ({ trainer }: TrainerProgressCardProps) => {
  // Calcul du pourcentage d'expérience pour la barre de progression
  const progressPercentage = (trainer.exp % UI_CONFIG.XP_CALCULATION_BASE) / 10;

  return (
    <Card variant="outlined" className="info-card">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {PROFILE_LABELS.PROGRESSION}
        </Typography>

        <Box className="info-item">
          <Typography variant="body2" color="text.secondary">
            {PROFILE_LABELS.LEVEL}
          </Typography>
          <Typography variant="h5" color="primary">
            {trainer.level}
          </Typography>
        </Box>

        <Box className="info-item">
          <Typography variant="body2" color="text.secondary">
            {PROFILE_LABELS.EXPERIENCE}
          </Typography>
          <Box sx={{ width: "100%", mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: UI_CONFIG.PROGRESS_BAR_HEIGHT,
                borderRadius: 4,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {formatters.experience(trainer.exp)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrainerProgressCard;
