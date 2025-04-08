import { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";

import CreateGames from "../components/CreateGames.jsx";
import Favorites from "../components/Favorites.jsx";
import NavBar from "../components/NavBar.jsx";

const baseURL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [games, setGames] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch(`${baseURL}/games`);
      const data = await response.json();

      setGames(data);
    };

    getData();
  }, []);

  return (
    <>
      <NavBar />
      <Routes>
        <Route
          index
          element={<CreateGames games={games} setGames={setGames} />}
        />
        <Route
          path="/games"
          element={<CreateGames games={games} setGames={setGames} />}
        />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </>
  );
}

export default App;
