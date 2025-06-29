import { Link } from "react-router-dom";
import NotFoundImg from "../../assets/missingno.png";
import "../../style/page/notFound.scss";

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <img src={NotFoundImg} alt="404" />
        <h1>404</h1>
        <p>Page non trouvée</p>
        <img src={NotFoundImg} alt="404" />
      </div>
      <Link to="/" className="btn-home">
        Retour à la page d'accueil
      </Link>
    </div>
  );
}

export default NotFound;
