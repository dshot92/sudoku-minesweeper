"use client"

import React from 'react'
import { Cell } from "./Cell"
import { useGame } from "@/contexts/GameContext"
import { Loader2 } from 'lucide-react'

const Grid: React.FC = () => {
  const {
    grid,
    gridSize,
    gameOver,
    gameWon,
    isLoading,
    initializeGame,
    handleCellClick
  } = useGame()

  // Handle clicking the grid when game is over
  const handleGameOverClick = () => {
    console.log("🔄 Grid clicked when game over/won, reinitializing game");
    initializeGame();
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    )
  }

  if (!grid || grid.length === 0) {
    return <div>No grid data available.</div>
  }

  const isGameOver = gameOver || gameWon

  return (
    <div
      className={`grid grid-cols-1 p-2 max-w-2xl w-full mx-auto my-auto select-none ${isGameOver ? 'cursor-pointer' : ''}`}
      onClick={isGameOver ? handleGameOverClick : undefined}
    >
      <div
        className="grid w-full aspect-square max-w-[80vh] mx-auto text-black font-bold text-6xl"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              gridSize={gridSize}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Grid