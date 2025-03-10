"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

// Function to generate a solved Sudoku board
const generateSolvedBoard = () => {
  // Initialize empty 9x9 board
  const board = Array(9)
    .fill()
    .map(() => Array(9).fill(0))

  // Helper function to check if a number can be placed at a position
  const isValid = (board: number[][], row: number, col: number, num: number) => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false
      }
    }

    return true
  }

  // Recursive function to fill the board
  const fillBoard = (board: number[][], row = 0, col = 0): boolean => {
    if (row === 9) return true

    if (col === 9) return fillBoard(board, row + 1, 0)

    if (board[row][col] !== 0) return fillBoard(board, row, col + 1)

    // Try placing numbers 1-9
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    // Shuffle array for randomness
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }

    for (const num of nums) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num

        if (fillBoard(board, row, col + 1)) return true

        board[row][col] = 0
      }
    }

    return false
  }

  fillBoard(board)
  return board
}

// Function to create a puzzle by removing numbers from a solved board
const createPuzzle = (solvedBoard: number[][], difficulty = 0.6) => {
  const puzzle = solvedBoard.map((row) => [...row])
  const totalCells = 81
  const cellsToRemove = Math.floor(totalCells * difficulty)

  let removed = 0
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0
      removed++
    }
  }

  return puzzle
}

export default function SudokuGame() {
  const [board, setBoard] = useState<number[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [userBoard, setUserBoard] = useState<number[][]>([])
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate a new game
  const generateNewGame = () => {
    setIsLoading(true)

    // Use setTimeout to prevent UI freeze
    setTimeout(() => {
      const solvedBoard = generateSolvedBoard()
      const puzzle = createPuzzle(solvedBoard)

      setSolution(solvedBoard)
      setBoard(puzzle)
      setUserBoard(puzzle.map((row) => [...row]))
      setSelectedCell(null)
      setIsLoading(false)
    }, 10)
  }

  // Initialize game on component mount
  useEffect(() => {
    generateNewGame()
  }, [])

  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] === 0) {
      setSelectedCell([row, col])
    }
  }

  // Handle number input
  const handleNumberInput = (num: number) => {
    if (selectedCell) {
      const [row, col] = selectedCell
      if (board[row][col] === 0) {
        const newUserBoard = userBoard.map((r) => [...r])
        newUserBoard[row][col] = num
        setUserBoard(newUserBoard)
      }
    }
  }

  // Handle key press for number input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      if (/^[1-9]$/.test(key) && selectedCell) {
        handleNumberInput(Number.parseInt(key))
      } else if (key === "Backspace" && selectedCell) {
        const [row, col] = selectedCell
        if (board[row][col] === 0) {
          const newUserBoard = userBoard.map((r) => [...r])
          newUserBoard[row][col] = 0
          setUserBoard(newUserBoard)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedCell, board, userBoard])

  // Check if the cell value is correct
  const isCellCorrect = (row: number, col: number) => {
    return userBoard[row][col] === solution[row][col]
  }

  // Check if the cell value is incorrect
  const isCellIncorrect = (row: number, col: number) => {
    return userBoard[row][col] !== 0 && userBoard[row][col] !== solution[row][col]
  }

  if (isLoading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex justify-center">
        <Button onClick={generateNewGame} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          New Game
        </Button>
      </div>

      <div className="grid grid-cols-9 gap-[1px] bg-gray-600 p-[1px] max-w-md w-full">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isOriginal = board[rowIndex][colIndex] !== 0
            const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex
            const isCorrect = isCellCorrect(rowIndex, colIndex)
            const isIncorrect = isCellIncorrect(rowIndex, colIndex)

            // Determine border styles for 3x3 boxes
            const borderTop = rowIndex % 3 === 0 ? "border-t-2" : ""
            const borderLeft = colIndex % 3 === 0 ? "border-l-2" : ""
            const borderRight = colIndex === 8 ? "border-r-2" : ""
            const borderBottom = rowIndex === 8 ? "border-b-2" : ""

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 
                  ${isOriginal ? "bg-gray-800 text-gray-300 font-bold" : "bg-gray-700 cursor-pointer"}
                  ${isSelected ? "bg-gray-600 text-white" : ""}
                  ${isIncorrect ? "text-red-500" : ""}
                  ${borderTop} ${borderLeft} ${borderRight} ${borderBottom}
                  border-gray-500
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {userBoard[rowIndex][colIndex] !== 0 ? userBoard[rowIndex][colIndex] : ""}
              </div>
            )
          }),
        )}
      </div>

      <div className="mt-6 grid grid-cols-9 gap-1 max-w-md w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded"
            onClick={() => handleNumberInput(num)}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}

