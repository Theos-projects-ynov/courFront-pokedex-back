import React from "react";
import { Alert, Button, Box } from "@mui/material";

interface AlertMessageProps {
  severity?: "error" | "warning" | "info" | "success";
  message: string;
  onAction?: () => void;
  actionLabel?: string;
  sx?: object;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  severity = "error",
  message,
  onAction,
  actionLabel = "Réessayer",
  sx = {},
}) => {
  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Alert severity={severity} sx={{ mb: onAction ? 2 : 0 }}>
        {message}
      </Alert>
      {onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default AlertMessage;
