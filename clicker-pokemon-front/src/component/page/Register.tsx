import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AuthService } from "../../service/authService";
import "../../style/page/register.scss";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState(10);
  const [region, setRegion] = useState("Kanto");
  const [gender, setGender] = useState<"Homme" | "Femme" | "Autre">("Homme");
  const [height, setHeight] = useState(1.65);
  const [weight, setWeight] = useState(45.5);
  const [description, setDescription] = useState(
    "Un nouveau dresseur Pokémon prêt à vivre l'aventure !"
  );
  const [image] = useState(
    "https://via.placeholder.com/150/007bff/ffffff?text=Trainer"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const regions = [
    "Kanto",
    "Johto",
    "Hoenn",
    "Sinnoh",
    "Unys",
    "Kalos",
    "Alola",
    "Galar",
    "Paldea",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs obligatoires");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    if (age < 5 || age > 100) {
      setError("L'âge doit être entre 5 et 100 ans");
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      setIsLoading(false);
      return;
    }

    try {
      const result = await AuthService.register({
        email,
        password,
        name,
        age,
        region,
        gender,
        height,
        weight,
        description,
        image,
      });
      console.log("Inscription réussie:", result);
      // Redirection vers la page de connexion après inscription
      navigate("/login");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'inscription. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "PokéDex - Inscription";
  }, []);

  return (
    <div className="register-page">
      <div className="register-container">
        <Card className="register-card">
          <CardContent>
            <Box className="register-header">
              <Typography
                variant="h4"
                component="h1"
                className="register-title"
              >
                Inscription
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Créez votre compte Dresseur Pokémon
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" className="register-error">
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              className="register-form"
            >
              <TextField
                fullWidth
                label="Nom du dresseur *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required
                autoComplete="name"
                autoFocus
                helperText="Votre nom de dresseur (ex: Sacha)"
              />

              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
              />

              <TextField
                fullWidth
                label="Mot de passe *"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirmer le mot de passe *"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <TextField
                  label="Âge"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  margin="normal"
                  inputProps={{ min: 5, max: 100 }}
                  sx={{ flex: 1 }}
                />

                <TextField
                  select
                  label="Région"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  margin="normal"
                  sx={{ flex: 1 }}
                >
                  {regions.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <TextField
                  select
                  label="Genre"
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as "Homme" | "Femme" | "Autre")
                  }
                  margin="normal"
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="Homme">Homme</MenuItem>
                  <MenuItem value="Femme">Femme</MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
                </TextField>

                <TextField
                  label="Taille (m)"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  margin="normal"
                  inputProps={{ min: 0.5, max: 3, step: 0.01 }}
                  sx={{ flex: 1 }}
                />

                <TextField
                  label="Poids (kg)"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  margin="normal"
                  inputProps={{ min: 10, max: 300, step: 0.1 }}
                  sx={{ flex: 1 }}
                />
              </Box>

              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                helperText="Présentez-vous en quelques mots"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label="J'accepte les conditions d'utilisation"
                className="terms-checkbox"
                sx={{ mt: 2, mb: 1 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                className="register-button"
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? "Inscription..." : "Devenir Dresseur Pokémon"}
              </Button>

              <Box className="register-links">
                <Typography variant="body2" align="center">
                  Déjà dresseur ?{" "}
                  <Link to="/login" className="login-link">
                    Se connecter
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
