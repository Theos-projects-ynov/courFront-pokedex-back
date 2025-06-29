import { useEffect } from "react";
import "../../style/page/login.scss";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    document.title = "PokéDex - Déconnexion";
  }, []);

  return (
    <div>
      <h1>Logout</h1>
    </div>
  );
};

export default Logout;
