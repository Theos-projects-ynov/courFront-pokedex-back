import { Card, CardContent, Typography } from "@mui/material";
import { PROFILE_LABELS } from "../../constants/profileConstants";

interface TrainerDescriptionProps {
  description: string;
}

const TrainerDescription = ({ description }: TrainerDescriptionProps) => {
  // Ne pas afficher la section si pas de description
  if (!description || description.trim().length === 0) {
    return null;
  }

  return (
    <Card variant="outlined" className="info-card full-width">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {PROFILE_LABELS.DESCRIPTION}
        </Typography>
        <Typography variant="body1">{description}</Typography>
      </CardContent>
    </Card>
  );
};

export default TrainerDescription;
