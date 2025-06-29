import { Box, Typography, Avatar, Chip } from "@mui/material";
import { UI_CONFIG } from "../../constants/profileConstants";
import { formatters } from "../../utils/profileUtils";
import type { Trainer } from "../../types/Trainer";

interface TrainerHeaderProps {
  trainer: Trainer;
}

const TrainerHeader = ({ trainer }: TrainerHeaderProps) => {
  return (
    <Box className="profil-header">
      <Avatar
        src={trainer.image}
        alt={trainer.name}
        sx={{
          width: UI_CONFIG.AVATAR_SIZE,
          height: UI_CONFIG.AVATAR_SIZE,
          mb: 2,
        }}
      />
      <Typography variant="h4" component="h1" className="profil-name">
        {trainer.name}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {trainer.email}
      </Typography>
      <Chip
        label={formatters.userRole(trainer.isAdmin)}
        color={trainer.isAdmin ? "secondary" : "primary"}
        sx={{ mt: 1 }}
      />
    </Box>
  );
};

export default TrainerHeader;
