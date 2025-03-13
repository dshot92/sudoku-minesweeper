"use client"

import React, { useEffect, useState } from 'react'
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
    isNewGridCreated
  } = useGame()

  // Animation states
  const [isNewGrid, setIsNewGrid] = useState(false)
  const [shouldShake, setShouldShake] = useState(false)

  // Use a counter to force new components on grid creation
  const [gridCounter, setGridCounter] = useState(0)

  // Handle clicking the grid when game is over
  const handleGameOverClick = () => {
    // Allow clicking to start a new game in both modes when game is over
    initializeGame();
  }

  const isGameOver = gameOver || gameWon

  // Trigger animations when a new grid is created
  // This uses the isNewGridCreated flag from the context
  useEffect(() => {
    if (isNewGridCreated) {
      setIsNewGrid(true);
      // Increment grid counter to force new cell components
      setGridCounter(prev => prev + 1);

      const timer = setTimeout(() => {
        setIsNewGrid(false);
      }, 1000); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [isNewGridCreated]);

  // Trigger shake animation when game is lost
  useEffect(() => {
    if (gameOver && !gameWon) {
      setShouldShake(true)
      const timer = setTimeout(() => {
        setShouldShake(false)
      }, 600) // Shake duration
      return () => clearTimeout(timer)
    }
  }, [gameOver, gameWon])

  // Create a consistent container for the grid regardless of state
  return (
    <div className="grid grid-cols-1 p-2 w-full mx-auto select-none">
      <div
        className={`aspect-square ${isGameOver ? 'cursor-pointer' : ''} ${shouldShake ? 'animate-shake' : ''}`}
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
                  key={`grid-${gridCounter}-${rowIndex}-${colIndex}-${cell.componentId}`}
                  cell={cell}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  gridSize={gridSize}
                  isNewGrid={isNewGrid}
                  gameWon={gameWon}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
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