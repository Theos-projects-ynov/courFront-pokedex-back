import "../../style/page/profilPage.scss";
import CardProfil from "../card/CardProfil";
import { useEffect, useState } from "react";
import { useDispatcher } from "../../hooks/useDispatcher";
import { Box, TextField, Button, Typography } from "@mui/material";

function ProfilPage() {
  const { createTrainer } = useDispatcher();

  const [name, setName] = useState("");
  const [region, setRegion] = useState("");

  const handleCreateTrainer = () => {
    if (name.trim()) {
      createTrainer(name, region);
      setName("");
      setRegion("");
    }
  };

  useEffect(() => {
    document.title = "PokéDex - Profil";
  }, []);


  return (
    <>
      <div className="profil-page">
        <Typography variant="h4" className="profil-page__title">
          Profil
        </Typography>

      {/* <CarrouselCard /> */}
      <CardProfil />

      <Box sx={{ mt: 4, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Nom du dresseur"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
        />
        <TextField
          label="Région"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleCreateTrainer}
          disabled={!name.trim()}
        >
          Créer un dresseur
        </Button>
      </Box>
      </div>
    </>
  );
}

export default ProfilPage;
