import { Box, Card, CardContent, Typography } from "@mui/material";
import { Height, FitnessCenter } from "@mui/icons-material";
import { PROFILE_LABELS } from "../../constants/profileConstants";
import { formatters } from "../../utils/profileUtils";
import type { Trainer } from "../../types/Trainer";

interface TrainerInfoCardProps {
  trainer: Trainer;
}

const TrainerInfoCard = ({ trainer }: TrainerInfoCardProps) => {
  return (
    <Card variant="outlined" className="info-card">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {PROFILE_LABELS.GENERAL_INFO}
        </Typography>

        <Box className="info-item">
          <Typography variant="body2" color="text.secondary">
            {PROFILE_LABELS.REGION}
          </Typography>
          <Typography variant="body1">{trainer.region}</Typography>
        </Box>

        <Box className="info-item">
          <Typography variant="body2" color="text.secondary">
            {PROFILE_LABELS.GENDER}
          </Typography>
          <Typography variant="body1">{trainer.gender}</Typography>
        </Box>

        <Box className="info-item">
          <Box display="flex" alignItems="center" gap={1}>
            <Height fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {PROFILE_LABELS.HEIGHT}
            </Typography>
          </Box>
          <Typography variant="body1">
            {formatters.height(trainer.height)}
          </Typography>
        </Box>

        <Box className="info-item">
          <Box display="flex" alignItems="center" gap={1}>
            <FitnessCenter fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {PROFILE_LABELS.WEIGHT}
            </Typography>
          </Box>
          <Typography variant="body1">
            {formatters.weight(trainer.weight)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrainerInfoCard;
