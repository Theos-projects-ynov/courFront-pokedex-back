import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from "@mui/material";

interface RetryLoaderProps {
  retryCount: number;
  maxRetries?: number;
  message?: string;
}

const RetryLoader: React.FC<RetryLoaderProps> = ({
  retryCount,
  maxRetries = 3,
  message = "Connexion au donjon en cours...",
}) => {
  const progress = (retryCount / maxRetries) * 100;

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="400px"
      sx={{ p: 3 }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />

      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        {message}
      </Typography>

      {retryCount > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tentative {retryCount}/{maxRetries}
          </Typography>

          <Box sx={{ width: "100%", maxWidth: 300, mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(0,0,0,0.1)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                },
              }}
            />
          </Box>

          <Typography variant="caption" color="text.secondary">
            Résolution du conflit de session...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default RetryLoader;
