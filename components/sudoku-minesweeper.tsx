"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CellState,
  generateSolvedGrid,
  handleCellClick as handleCellClickLogic,
} from "@/lib/sudoku-minesweeper"
import { Cell } from "./Cell"
import { useSettings } from "@/contexts/SettingsContext"

export default function SudokuMinesweeper() {
  const { theme } = useTheme()
  const { gridSize } = useSettings()
  const [grid, setGrid] = useState<CellState[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [message, setMessage] = useState("")

  // Initialize game
  const initializeGame = () => {
    setMessage("")
    const newGrid = generateSolvedGrid(gridSize)
    setGrid(newGrid)
    setGameOver(false)
    setGameWon(false)
  }

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

  // Initialize on component mount or when grid size changes
  useEffect(() => {
    initializeGame()
  }, [gridSize])

  return (
    <div className="grid grid-cols-1 max-w-2xl w-full mx-auto px-2">
      <div className="mb-4">
        <div className="flex justify-center items-center w-full mb-2">
          <Button onClick={initializeGame} className="flex items-center gap-2 p-2 h-auto">
            <div className={theme === 'light' ? 'invert-[1]' : ''}>
              <Image
                src={gameOver ? "/game-button/lost.svg" : gameWon ? "/game-button/win.svg" : "/game-button/new.svg"}
                alt={gameOver ? "Game Over" : gameWon ? "You Won!" : "New Game"}
                width={32}
                height={32}
                priority
              />
            </div>
          </Button>
        </div>
      </div>

      <div
        className="grid w-full mb-4 aspect-square max-w-[80vh] mx-auto text-black font-bold text-6xl"
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

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}