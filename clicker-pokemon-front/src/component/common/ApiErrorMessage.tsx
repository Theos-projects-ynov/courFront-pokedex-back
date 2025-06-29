import { useCallback } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { Refresh, Logout } from "@mui/icons-material";

interface ApiErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
  onLogout?: () => void;
  showLogout?: boolean;
  retryLabel?: string;
  logoutLabel?: string;
}

const ApiErrorMessage = ({
  error,
  onRetry,
  onLogout,
  showLogout = false,
  retryLabel = "Réessayer",
  logoutLabel = "Se déconnecter",
}: ApiErrorMessageProps) => {
  const getErrorMessage = useCallback(() => {
    if (error && typeof error === "object" && "data" in error) {
      const errorData = error.data as { message?: string };
      return errorData?.message || "Erreur lors du chargement des données";
    }
    return "Erreur lors du chargement des données. Veuillez réessayer.";
  }, [error]);

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          {getErrorMessage()}
        </Typography>

        {(onRetry || showLogout) && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            {onRetry && (
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={onRetry}
                size="small"
              >
                {retryLabel}
              </Button>
            )}

            {showLogout && onLogout && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={onLogout}
                size="small"
              >
                {logoutLabel}
              </Button>
            )}
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default ApiErrorMessage;
