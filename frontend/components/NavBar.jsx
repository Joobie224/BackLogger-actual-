import React from "react";
import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../src/App.css";
import SaveIcon from "@mui/icons-material/Save";

const NavBar = () => {
  return (
    <header className="bg-gray-300 text-zinc-700 p-5 flex justify-between font-[Pixelify_Sans] items-center">
      <div className="flex">
        <Link to="/games" className="flex items-center">
          <SaveIcon sx={{ fontSize: "2.7rem" }} />
          <h1 className="text-5xl">BackLogger</h1>
        </Link>
      </div>
      <nav className="flex justify-evenly w-1/4 text-lg ">
        <Link to="/games">Games</Link>
        <Link to="/favorites">Favorites</Link>
      </nav>
    </header>
  );
};

export default NavBar;
