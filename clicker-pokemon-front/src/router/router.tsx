import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import Home from "../component/page/Home";
import NotFound from "../component/page/NotFound";
import PokemonPage from "../component/page/PokemonPage";
import Dungeon from "../component/page/Dungeon";
import DungeonBattle from "../component/page/DungeonBattle";
import Login from "../component/page/Login";
import Register from "../component/page/Register";
import Logout from "../component/page/logout";
import CatchPage from "../component/page/CatchPage";
import Profil from "../component/page/Profil";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        index: true,
        element: <Home />,
      },
      {
        path: "/pokemon/:id",
        element: <PokemonPage />,
      },
      {
        path: "/profil",
        element: <Profil />,
      },
      {
        path: "/catch",
        element: <CatchPage />,
      },
      {
        path: "/dungeon",
        element: <Dungeon />,
      },
      {
        path: "/dungeon-battle/:dungeonId",
        element: <DungeonBattle />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  // Routes d'authentification sans layout principal
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
