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

    isConflict(row, col) {
        const val = Number(this.grid[row][col]); // 强制转数字
        if (val === 0 || isNaN(val)) return false;

        for (let i = 0; i < 9; i++) {
            // 检查行：确保比较的两端都是数字
            if (i !== col && Number(this.grid[row][i]) === val) return true;
            // 检查列
            if (i !== row && Number(this.grid[i][col]) === val) return true;
        }

        // 检查九宫格
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if ((i !== row || j !== col) && Number(this.grid[i][j]) === val) return true;
            }
        }
        return false;
    }
     isSolved() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                // 如果还有空格（0），或者有冲突，就没赢
                if (this.grid[r][c] === 0 || this.isConflict(r, c)) {
                    return false;
                }
            }
        }
        return true; // 填满了且没冲突
    }
    //候选格子是否合法
    isValid(row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (this.grid[row][i] === num) return false;
            if (this.grid[i][col] === num) return false;
        }
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if (this.grid[i][j] === num) return false;
            }
        }
        return true;
    }

    //获取某个格子所有可用的候选数
    getCandidates(row, col) {
        // 如果已经填了数字，就没有候选数
        if (this.grid[row][col] !== 0) return [];

        const candidates = [];
        for (let num = 1; num <= 9; num++) {
            if (this.isValid(row, col, num)) {
                candidates.push(num);
            }
        }
        return candidates;
    }

    getNextHint() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.grid[r][c] === 0) {
                    const candidates = this.getCandidates(r, c);
                    // 如果发现某个格子只有一种合法填法，这就是绝对推断
                    if (candidates.length === 1) {
                        return { row: r, col: c, value: candidates[0] };
                    }
                }
            }
        }
        return null;
    }
}

class Game {
    constructor(sudoku) {
        this.currentSudoku = sudoku;      // 当前棋盘
        this.history = [sudoku.clone()];  // history里存的是每一步操作的Sudoku实例，初始状态下是游戏刚开始时的空棋盘状态。
        this.currentIndex = 0;            // 当前正在第几个状态

        this.isExploring = false;         // 是否处于探索模式
        this.exploreSnapshot = null;      // 探索起点的快照
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
    //获取提示
    getHint() {
        return this.currentSudoku.getNextHint();
    }
    //把提示填进空格里
    applyHint() {
        const hint = this.getHint();
        if (hint) {
            this.guess({ row: hint.row, col: hint.col, value: hint.value });
            return true; // 提示成功
        }
        return false; // 当前盘面卡壳，没有绝对确定的格子
    }

    startExplore() {
        if (this.isExploring) return; // 防止重复开启
        this.isExploring = true;
        
        // 对历史记录和当前盘面进行深拷贝
        this.exploreSnapshot = {
            history: this.history.map(s => s.clone()),
            currentIndex: this.currentIndex,
            currentSudoku: this.currentSudoku.clone()
        };
    }

    cancelExplore() {
        if (!this.isExploring || !this.exploreSnapshot) return;
        
        // 用快照覆盖当前状态
        this.history = this.exploreSnapshot.history;
        this.currentIndex = this.exploreSnapshot.currentIndex;
        this.currentSudoku = this.exploreSnapshot.currentSudoku;
        
        // 退出探索状态
        this.isExploring = false;
        this.exploreSnapshot = null;
    }

    commitExplore() {
        if (!this.isExploring) return;
        
        // 探索成功了，这段时间的 guess 操作已经在当前的 history 里了，
        this.isExploring = false;
        this.exploreSnapshot = null;
    }

    getIsExploring() {
        return this.isExploring;
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