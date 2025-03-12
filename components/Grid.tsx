"use client"

import React from 'react'
import { handleCellClick as handleCellClickLogic } from "@/lib/sudoku-minesweeper"
import { Cell } from "./Cell"
import { useGame } from "@/contexts/GameContext"
import { useCallback } from 'react'
import { Loader2 } from 'lucide-react'

const Grid: React.FC = () => {
  const { gridSize } = useGame()
  const {
    grid,
    gameOver,
    gameWon,
    setGrid,
    setGameOver,
    setGameWon,
    setMessage,
    isLoading,
    initializeGame
  } = useGame()

  const handleCellClick = useCallback((row: number, col: number) => {
    const result = handleCellClickLogic(grid, row, col, gridSize)

    setGrid(result.newGrid)
    setGameOver(result.gameOver)
    setGameWon(result.gameWon)

    if (result.message) {
      setMessage(result.message)
    }

  }, [gameOver, gameWon, grid, gridSize, setGameOver, setGameWon, setGrid, setMessage])

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
      className={`grid grid-cols-1 max-w-2xl w-full mx-auto select-none ${isGameOver ? 'cursor-pointer' : ''}`}
      onClick={isGameOver ? initializeGame : undefined}
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