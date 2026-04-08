// src/domain/index.js

class Sudoku {
    constructor(grid) {
        //先序列化成字符串，再反序列化为全新对象，以此实现深拷贝
        this.grid = JSON.parse(JSON.stringify(grid));
    }

    // 获取当前的盘面数据，同样使用深拷贝
    getGrid() {
        return JSON.parse(JSON.stringify(this.grid));
    }

    // 填字
    guess(move) {
        //move的结构：{ row: 行号, col: 列号, value: 填的数字 }
        this.grid[move.row][move.col] = move.value;
    }

    // 克隆自己：以此实现撤销功能
    clone() {
        return new Sudoku(this.grid);
    }

    // 序列化为 JSON 格式保存方便实现撤销
    toJSON() {
        return { grid: this.grid };
    }

    // 打印成9x9字符串矩阵方便调试
    toString() {
        return this.grid.map(row => row.join(' ')).join('\n');
    }
}

class Game {
    constructor(sudoku) {
        this.currentSudoku = sudoku;      // 当前棋盘
        this.history = [sudoku.clone()];  // history里存的是每一步操作的Sudoku实例，初始状态下是游戏刚开始时的空棋盘状态。
        this.currentIndex = 0;            // 当前正在第几个状态
    }

    getSudoku() {
        return this.currentSudoku;
    }

    // 玩家执行一次填字
    guess(move) {
        // 如果撤销了几步后，又填了新数字，就把当前状态下所有的未来状态全部删除
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // 在当前棋盘上填数字
        this.currentSudoku.guess(move);
        // 存进history
        this.history.push(this.currentSudoku.clone());
        // 指针指到最新的history
        this.currentIndex++;
    }

    // 撤销：翻到历史记录的上一页
    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            this.currentSudoku = this.history[this.currentIndex].clone();
        }
    }

    // 重做：历史记录的下一页
    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            this.currentSudoku = this.history[this.currentIndex].clone();
        }
    }
    //判断是否能撤销
    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    // 序列化整个游戏状态，方便保存游戏状态
    toJSON() {
        return {
            history: this.history.map(s => s.toJSON()),
            currentIndex: this.currentIndex
        };
    }
}
//工厂函数
export function createSudoku(input) {
    // 创建普通盘面
    return new Sudoku(input);
}

export function createSudokuFromJSON(json) {
    // 从存档 JSON 恢复盘面
    return new Sudoku(json.grid);
}

export function createGame({ sudoku }) {
    // 创建游戏实例
    return new Game(sudoku);
}
// 从存档 JSON 恢复整个游戏
export function createGameFromJSON(json) {
    //恢复出当前这一步的盘面
    const game = new Game(createSudokuFromJSON(json.history[json.currentIndex]));
    //恢复
    game.history = json.history.map(sData => createSudokuFromJSON(sData));
    game.currentIndex = json.currentIndex;
    return game;
}

let globalGameInstance = null; // 全局单例，方便 UI 各处获取


// 获取当前正在进行的游戏实例，函数保证了全网页共用同一个游戏进程
export function getGameInstance(initialGrid) {
    if (!globalGameInstance && initialGrid) {
        globalGameInstance = createGame({ sudoku: createSudoku(initialGrid) });
    }
    return globalGameInstance;
}

export function updateGridFromGame(userGridStore) {
    if (!globalGameInstance) return;
    const currentGrid = globalGameInstance.getSudoku().getGrid();
    
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            userGridStore.set({ y: r, x: c }, currentGrid[r][c]);
        }
    }
}