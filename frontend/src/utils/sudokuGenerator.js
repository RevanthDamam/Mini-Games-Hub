// Sudoku Generator and Solver Utilities

export const generateEmptyGrid = () => {
  return Array(9).fill().map(() => Array(9).fill(0));
};

export const isValidMove = (grid, row, col, num) => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check 3x3 box
  let startRow = row - (row % 3);
  let startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
};

export const solveSudoku = (grid) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

export const generateCompleteSudoku = () => {
  const grid = generateEmptyGrid();
  
  // Fill diagonal 3x3 boxes first
  for (let i = 0; i < 9; i += 3) {
    fillBox(grid, i, i);
  }
  
  // Fill remaining cells
  solveSudoku(grid);
  return grid;
};

const fillBox = (grid, row, col) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);
  
  let index = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      grid[row + i][col + j] = numbers[index++];
    }
  }
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export const generatePuzzle = (difficulty = 'medium') => {
  const completeGrid = generateCompleteSudoku();
  const puzzle = completeGrid.map(row => [...row]);
  
  const difficultyLevels = {
    easy: 35,
    medium: 45,
    hard: 55,
    expert: 65
  };
  
  const cellsToRemove = difficultyLevels[difficulty] || 45;
  let removed = 0;
  
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (puzzle[row][col] !== 0) {
      const backup = puzzle[row][col];
      puzzle[row][col] = 0;
      
      // Check if puzzle still has unique solution
      const testGrid = puzzle.map(row => [...row]);
      if (hasUniqueSolution(testGrid)) {
        removed++;
      } else {
        puzzle[row][col] = backup;
      }
    }
  }
  
  return {
    puzzle: puzzle,
    solution: completeGrid
  };
};

const hasUniqueSolution = (grid) => {
  const solutions = [];
  findAllSolutions(grid, solutions, 2); // Find at most 2 solutions
  return solutions.length === 1;
};

const findAllSolutions = (grid, solutions, maxSolutions) => {
  if (solutions.length >= maxSolutions) return;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(grid, row, col, num)) {
            grid[row][col] = num;
            findAllSolutions(grid, solutions, maxSolutions);
            grid[row][col] = 0;
          }
        }
        return;
      }
    }
  }
  
  // Found a complete solution
  solutions.push(grid.map(row => [...row]));
};

export const checkSudokuComplete = (grid) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) return false;
    }
  }
  return true;
};

export const getHint = (puzzle, solution) => {
  const emptyCells = [];
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  if (emptyCells.length === 0) return null;
  
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  return {
    row: randomCell.row,
    col: randomCell.col,
    value: solution[randomCell.row][randomCell.col]
  };
};