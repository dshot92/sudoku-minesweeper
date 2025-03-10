"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CellState,
  generateSolvedGrid,
  handleCellClick as handleCellClickLogic,
} from "@/lib/sudoku-minesweeper"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"

export default function SudokuMinesweeper() {
  const [gridSize, setGridSize] = useState(5)
  const [inputSize, setInputSize] = useState("5")
  const [grid, setGrid] = useState<CellState[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [message, setMessage] = useState("")

  const color = [
    "#FFD700", // bright yellow
    "#87CEEB", // sky blue
    "#90EE90", // light green
    "#FF9999", // vivid pink-red
    "#FFA07A", // light salmon
    "#FFB6C1", // light pink
    "#20B2AA", // light sea green
    "#B8B8B8"  // medium gray
  ]
  // Initialize game
  const initializeGame = () => {
    let newSize = parseInt(inputSize) || 5;
    // Clamp the size between 4 and 8
    setGridSize(newSize);
    setInputSize(newSize.toString());
    setMessage("");

    const newGrid = generateSolvedGrid(newSize);
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
    <div className="grid grid-cols-1 max-w-2xl w-full mx-auto px-2">
      <div className="mb-4">
        <div className="grid grid-cols-3 items-center w-full mb-2">
          <div className="justify-self-start">
            <Button onClick={handleSizeChange} className="flex items-center gap-2">
              {/* <RefreshCw className="h-4 w-4" /> */}
              New Game
            </Button>
          </div>

          <div className="flex items-center gap-1 justify-center">
            <Button
              onClick={() => {
                const newSize = Math.max(3, parseInt(inputSize) - 1)
                setInputSize(newSize.toString())
              }}
            >
              -
            </Button>
            <Button
            // variant="outline"
            >
              {inputSize + "x" + inputSize}
            </Button>
            <Button
              onClick={() => {
                const newSize = Math.min(7, parseInt(inputSize) + 1)
                setInputSize(newSize.toString())
              }}
            >
              +
            </Button>
          </div>

          <div className="justify-self-end">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div
        className="grid w-full mb-4 aspect-square max-w-[80vh] mx-auto text-black font-bold text-4xl"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const backgroundColor = color[cell.componentId]

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={"flex items-center justify-center aspect-square border"}
                style={{
                  backgroundColor: backgroundColor,
                }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell.revealed && (
                  cell.value === gridSize ? (
                    <Image
                      src="/mine.svg"
                      alt="Mine"
                      width={24}
                      height={24}
                    />
                  ) : cell.value
                )}
              </div>
            )
          }),
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