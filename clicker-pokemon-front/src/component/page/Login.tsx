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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AuthService } from "../../service/authService";
import "../../style/page/login.scss";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError("");
    setIsLoading(true);

    // Validation simple
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    try {
      const result = await AuthService.login({ email, password });
      console.log("Connexion réussie:", result);
      localStorage.setItem("token", result.token);
      // Redirection vers la page d'accueil après connexion
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Identifiants incorrects. Vérifiez votre email et mot de passe.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "PokéDex - Connexion";
  }, []);

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <CardContent>
            <Box className="login-header">
              <Typography variant="h4" component="h1" className="login-title">
                Connexion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connectez-vous à votre PokéDex
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" className="login-error">
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="login-form">
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                className="login-button"
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>

              <Box className="login-links">
                <Typography variant="body2" align="center">
                  Pas encore de compte ?{" "}
                  <Link to="/register" className="register-link">
                    S'inscrire
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

export default Login; 