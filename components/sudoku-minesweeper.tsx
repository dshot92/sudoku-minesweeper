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
} from "@/lib/sudoku-minesweeper"
import Image from "next/image"

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
    newSize = Math.max(4, Math.min(8, newSize));
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
    <div className="flex flex-col items-center max-w-4xl w-full p-2">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
        <div className="flex items-center gap-2">
          <label htmlFor="grid-size" className="whitespace-nowrap">
            Grid Size:
          </label>
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={() => {
                const newSize = Math.max(4, parseInt(inputSize) - 1)
                setInputSize(newSize.toString())
              }}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <Input
              id="grid-size"
              type="number"
              min="4"
              max="8"
              value={inputSize}
              readOnly
              className="w-16 text-center mx-1 bg-gray-800 text-white cursor-default"
            />
            <Button
              variant="outline"
              onClick={() => {
                const newSize = Math.min(8, parseInt(inputSize) + 1)
                setInputSize(newSize.toString())
              }}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>
        </div>
        <Button onClick={handleSizeChange} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          New Game
        </Button>
      </div>

      <div
        className="grid gap-[1px] bg-gray-600 p-[1px] w-full text-black"
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
                className={`
                  flex items-center justify-center aspect-square w-full
                  ${cell.revealed ? "text-black font-bold text-[min(8vw,4rem)]" : "cursor-pointer hover:opacity-90"}
                  border border-gray-500
                `}
                style={{
                  backgroundColor: backgroundColor,
                  color: cell.revealed ? 'black' : backgroundColor,
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
                      className="w-[min(8vw,4rem)] h-[min(8vw,4rem)]"
                    />
                  ) : cell.value
                )}
              </div>
            )
          }),
        )}
      </div>

      {message && (
        <Alert className="my-4 bg-gray-800 border-gray-700">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}