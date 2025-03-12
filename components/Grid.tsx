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
    handleCellClick,
    gameMode
  } = useGame()

  // Handle clicking the grid when game is over
  const handleGameOverClick = () => {
    // Allow clicking to start a new game in both modes when game is over
    initializeGame();
  }

  const isGameOver = gameOver || gameWon

  // Create a consistent container for the grid regardless of state
  return (
    <div className="grid grid-cols-1 p-2 w-full mx-auto select-none">
      <div
        className={`aspect-square ${isGameOver ? 'cursor-pointer' : ''}`}
        onClick={isGameOver ? handleGameOverClick : undefined}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin h-10 w-10" />
          </div>
        ) : !grid || grid.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            No grid data available.
          </div>
        ) : (
          <div
            className="grid w-full h-full text-black font-bold text-6xl"
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
        )}
      </div>
    </div>
  )
}

export default Grid