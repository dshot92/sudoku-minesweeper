"use client"

import { handleCellClick as handleCellClickLogic } from "@/lib/sudoku-minesweeper"
import { Cell } from "./Cell"
import { useSettings } from "@/contexts/SettingsContext"
import { useGame } from "@/contexts/GameContext"

export default function Grid() {
  const { gridSize } = useSettings()
  const {
    grid,
    gameOver,
    gameWon,
    message,
    setGrid,
    setGameOver,
    setGameWon,
    setMessage
  } = useGame()

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameOver || gameWon || grid[row][col].revealed) return

    const result = handleCellClickLogic(grid, row, col, gridSize)
    setGrid(result.newGrid)
    setGameOver(result.gameOver)
    setGameWon(result.gameWon)

    if (result.message) {
      setMessage(result.message)
    }
  }

  return (
    <div className="grid grid-cols-1 max-w-2xl w-full mx-auto select-none">
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