import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";

interface DungeonCompletionProps {
  isWin: boolean;
  message: string;
  rewards?: {
    money: number;
    experience: number;
    items: Array<{
      name: string;
      quantity: number;
      rarity: string;
    }>;
  };
  onReturnToDungeons: () => void;
}

const DungeonCompletionCard: React.FC<DungeonCompletionProps> = ({
  isWin,
  message,
  rewards,
  onReturnToDungeons,
}) => {
  // Fonction pour obtenir l'icône d'un objet
  const getItemIcon = (itemName: string): string | null => {
    const itemIcons: { [key: string]: string } = {
      Potion: "/src/assets/icon/potion/Potion_Commun.webp",
      "Super Ball": "/src/assets/icon/pokeball/super-ball_Uncommun.png",
      // Ajoute d'autres objets ici si besoin
    };

    return itemIcons[itemName] || null;
  };

  return (
    <div
      className="dungeon-battle-page"
      style={{ backgroundColor: "#3a3a3a", minHeight: "100vh" }}
    >
      <Card
        className="completion-card"
        sx={{ textAlign: "center", p: 4, backgroundColor: "#2a2a2a" }}
      >
        <CardContent>
          <Typography
            variant="h3"
            sx={{
              color: isWin ? "#4caf50" : "#f44336",
              mb: 3,
              fontWeight: "bold",
            }}
          >
            {isWin ? "🎉 VICTOIRE ! 🎉" : "💀 DÉFAITE 💀"}
          </Typography>

          <Typography variant="h5" sx={{ mb: 4, color: "white" }}>
            {message}
          </Typography>

          {isWin && rewards && (
            <div className="rewards-section">
              <Typography variant="h6" sx={{ color: "#ffeb3b", mb: 2 }}>
                🏆 Récompenses obtenues :
              </Typography>

              <div
                className="rewards-grid"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <img
                    src="/src/assets/icon/autre/PokeCoin.jpeg"
                    alt="Gold"
                    style={{ width: "16px", height: "16px" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <Typography variant="body1" sx={{ color: "#4caf50" }}>
                    Argent : {rewards.money || 0} PokéDollars
                  </Typography>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <img
                    src="/src/assets/icon/autre/XP.png"
                    alt="XP"
                    style={{ width: "16px", height: "16px" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <Typography variant="body1" sx={{ color: "#2196f3" }}>
                    Expérience : {rewards.experience || 0} XP
                  </Typography>
                </div>

                {rewards.items && rewards.items.length > 0 && (
                  <div className="items-section">
                    <Typography variant="h6" sx={{ color: "#ff9800", mb: 1 }}>
                      🎁 Objets :
                    </Typography>
                    {rewards.items.map((item, index) => {
                      const itemIcon = getItemIcon(item.name);
                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "6px",
                          }}
                        >
                          {itemIcon ? (
                            <img
                              src={itemIcon}
                              alt={item.name}
                              style={{ width: "16px", height: "16px" }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: "16px",
                                width: "16px",
                                textAlign: "center",
                              }}
                            >
                              🎁
                            </span>
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                item.rarity === "legendary"
                                  ? "#9c27b0"
                                  : item.rarity === "rare"
                                  ? "#ff5722"
                                  : item.rarity === "uncommon"
                                  ? "#ff9800"
                                  : "#4caf50",
                              fontWeight:
                                item.rarity === "legendary" ||
                                item.rarity === "rare"
                                  ? "bold"
                                  : "normal",
                            }}
                          >
                            {item.name} x{item.quantity}
                            <span
                              style={{
                                fontSize: "0.8em",
                                opacity: 0.8,
                                marginLeft: "8px",
                              }}
                            >
                              ({item.rarity})
                            </span>
                          </Typography>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <Typography
            variant="body2"
            sx={{
              color: "#ffc107",
              fontStyle: "italic",
              mt: 3,
              mb: 3,
            }}
          >
            {isWin
              ? "Note : Les objets ne sont pas ajoutés à ton inventaire (système non implémenté)"
              : "Réessaie avec une stratégie différente !"}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={onReturnToDungeons}
            sx={{
              mt: 2,
              backgroundColor: isWin ? "#4caf50" : "#f44336",
              "&:hover": {
                backgroundColor: isWin ? "#45a049" : "#d32f2f",
              },
            }}
          >
            Retour aux Donjons
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DungeonCompletionCard;
