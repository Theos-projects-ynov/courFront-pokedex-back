import React from "react";
import { Alert, AlertTitle, Button } from "@mui/material";
import { HOME_MESSAGES } from "../../constants/homeConstants";

interface HomeErrorMessageProps {
  generation: number;
  onRetry: () => void;
}

const HomeErrorMessage: React.FC<HomeErrorMessageProps> = ({
  generation,
  onRetry,
}) => {
  return (
    <div className="error-container">
      <Alert severity="error" sx={{ marginBottom: 2 }}>
        <AlertTitle>Erreur</AlertTitle>
        {HOME_MESSAGES.ERROR} {generation}
      </Alert>
      <Button
        variant="contained"
        color="primary"
        onClick={onRetry}
        sx={{ marginTop: 1 }}
      >
        {HOME_MESSAGES.RETRY}
      </Button>
    </div>
  );
};

export default HomeErrorMessage;
