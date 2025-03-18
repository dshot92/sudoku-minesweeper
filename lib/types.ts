/**
 * Represents the state of a cell in the game grid
 */
export type CellState = {
  value: number
  revealed: boolean
  isMine: boolean
  isFlag: boolean
  componentId: number
}; 