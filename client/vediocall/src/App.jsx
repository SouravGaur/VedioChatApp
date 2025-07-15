import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import "./App.css";
import Lobby from "./screens/Lobby.jsx";
import Room from "./screens/Room.jsx";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lobby />}></Route>
        <Route path="/room/:roomid" element={<Room />}></Route>
      </Routes>
    </div>
  );
}

export default App;
