import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SnakeGame from "./pages/SnakeGame";
import TicTacToe from "./pages/TicTacToe";
import Sudoku from "./pages/Sudoku";
import RockPaperScissors from "./pages/RockPaperScissors";
import MemoryGame from "./pages/MemoryGame";
import Navbar from "./components/Navbar";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/snake" element={<SnakeGame />} />
          <Route path="/tictactoe" element={<TicTacToe />} />
          <Route path="/sudoku" element={<Sudoku />} />
          <Route path="/rps" element={<RockPaperScissors />} />
          <Route path="/memory" element={<MemoryGame />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;