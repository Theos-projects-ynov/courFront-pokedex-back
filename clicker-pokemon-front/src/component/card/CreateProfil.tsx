import "./createProfil.scss";

const CreateProfil = () => {
  return (
    <div className="create-profil">
      <div className="create-profil-card">
        <div className="create-profil-card-content">
          <div className="create-profil-card-content-title">
            <h2>Créer un profil</h2>
          </div>
          <div className="create-profil-card-content-form">
            <input type="text" placeholder="Nom" />
            <button>Créer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfil;
