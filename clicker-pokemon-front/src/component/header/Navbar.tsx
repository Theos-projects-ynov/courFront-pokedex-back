import { Link, useLocation } from "react-router-dom";
import "../../style/component/header/navbar.scss";
import { useEffect, useState } from "react";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("token", token, " : ", token !== null);

    if (token !== null) {
      console.log("QUOI token", token, " : ", token !== null);
      setIsLoggedIn(true);
    }
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Fonction pour déterminer si un lien est actif
  const isActiveLink = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Gérer le toggle du menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fermer le menu mobile lors du clic sur un lien
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="navbar">
      <h1 className="navbar-logo">DonjonDex</h1>

      {/* Menu hamburger pour mobile */}
      <button
        className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation - desktop et mobile */}
      <div className={`navbar-menu ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <Link
          to="/"
          className={`btn-navbar ${isActiveLink("/") ? "active" : ""}`}
          onClick={handleLinkClick}
        >
          Home
        </Link>
        <Link
          to="/catch"
          className={`btn-navbar ${isActiveLink("/catch") ? "active" : ""}`}
          onClick={handleLinkClick}
        >
          Capture
        </Link>
        <Link
          to="/dungeon"
          className={`btn-navbar ${isActiveLink("/dungeon") ? "active" : ""}`}
          onClick={handleLinkClick}
        >
          Donjon
        </Link>
        {isLoggedIn ? (
          <>
            <Link
              to="/profil"
              className={`btn-navbar ${
                isActiveLink("/profil") ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              Profil
            </Link>
            <Link
              to="/logout"
              className={`btn-navbar ${
                isActiveLink("/logout") ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`btn-navbar ${isActiveLink("/login") ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`btn-navbar ${
                isActiveLink("/register") ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              Register
            </Link>
          </>
        )}
      </div>

      {/* Overlay pour fermer le menu en cliquant à côté */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={handleLinkClick}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default Navbar;
