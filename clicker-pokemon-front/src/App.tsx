import { Outlet } from "react-router-dom";
import Navbar from "./component/header/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default App;
