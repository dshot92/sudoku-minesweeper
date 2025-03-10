"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CellState,
  generateSolvedGrid,
  handleCellClick as handleCellClickLogic,
  validateGridSize
} from "@/lib/sudoku-minesweeper"

export default function SudokuMinesweeper() {
  const initialGridSize = 5
  const [gridSize, setGridSize] = useState(initialGridSize)
  const [inputSize, setInputSize] = useState(initialGridSize.toString())
  const [grid, setGrid] = useState<CellState[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [message, setMessage] = useState("")

  const color = ["yellow", "blue", "green", "red", "orange", "pink", "teal", "gray"]
  // Initialize game
  const initializeGame = () => {
    const { size, message } = validateGridSize(inputSize);
    setGridSize(size);
    setInputSize(size.toString());
    setMessage(message);

    const newGrid = generateSolvedGrid(size);
    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
  }

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameOver || gameWon || grid[row][col].revealed) return;

    const result = handleCellClickLogic(grid, row, col, gridSize);
    setGrid(result.newGrid);
    setGameOver(result.gameOver);
    setGameWon(result.gameWon);

    if (result.message) {
      setMessage(result.message);
    }
  }

  // Initialize on component mount
  useEffect(() => {
    initializeGame()
  }, [])

  // Handle grid size change
  const handleSizeChange = () => {
    initializeGame()
  }

  return (
    <div className="flex flex-col items-center max-w-4xl w-full">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
        <div className="flex items-center gap-2">
          <label htmlFor="grid-size" className="whitespace-nowrap">
            Grid Size:
          </label>
          <Input
            id="grid-size"
            type="number"
            min="4"
            max="10"
            value={inputSize}
            onChange={(e) => setInputSize(e.target.value)}
            className="w-20 bg-gray-800 text-white"
          />
        </div>
        <Button onClick={handleSizeChange} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          New Game
        </Button>
      </div>

      {message && (
        <Alert className="mb-4 bg-gray-800 border-gray-700">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div
        className="grid gap-[1px] bg-gray-600 p-[1px]"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Show component colors for all cells, revealed or not
            const backgroundColor = color[cell.componentId]

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  flex items-center justify-center aspect-square
                  ${cell.revealed ? "text-white font-bold" : "cursor-pointer hover:opacity-90"}
                  border border-gray-500 text-sm sm:text-base
                `}
                style={{
                  minWidth: "24px",
                  minHeight: "24px",
                  maxWidth: "50px",
                  maxHeight: "50px",
                  color: backgroundColor,
                  backgroundColor: backgroundColor,
                }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell.revealed ? cell.value : ""}
              </div>
            )
          }),
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-300">
          Click to reveal cells. Each colored region contains one mine (the highest number)!
        </p>
      </div>
    </div>
  )
}