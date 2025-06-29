import React from "react";
import { Typography } from "@mui/material";

interface BattleMessagesProps {
  messages: string[];
  maxMessages?: number;
}

const BattleMessages: React.FC<BattleMessagesProps> = ({
  messages,
  maxMessages = 5,
}) => {
  if (messages.length === 0) return null;

  return (
    <div className="battle-messages">
      {messages.slice(-maxMessages).map((message, index) => (
        <Typography key={index} variant="caption" className="battle-message">
          {message}
        </Typography>
      ))}
    </div>
  );
};

export default BattleMessages;
