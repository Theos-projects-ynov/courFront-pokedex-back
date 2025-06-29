import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface FullPageLoaderProps {
  message?: string;
  size?: number;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = "Chargement...",
  size = 60,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="400px"
    >
      <CircularProgress size={size} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default FullPageLoader;
