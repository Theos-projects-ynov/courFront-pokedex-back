import "../../style/component/card/IconProfil.scss";

function IconProfils({
  image,
  handleTrainerActive,
  id,
  isActive,
}: {
  image: string;
  handleTrainerActive: (id: number) => void;
  id: number;
  isActive: boolean;
}) {
  console.log(image);

  return (
    <div
      className={`icon-profil ${isActive ? "active" : ""}`}
      onClick={() => handleTrainerActive(id)}
    >
      <img src={image} alt="icon" />
    </div>
  );
}

export default IconProfils;
