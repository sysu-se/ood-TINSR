import { writable } from 'svelte/store';
import { createSudoku, createGame } from '../domain/index.js';
import { generateSudoku } from '@sudoku/sudoku';

// 保留这个空壳，防止网页刚加载时白屏崩溃
const emptyGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
];

export function createGameStore() {
    let sudoku = createSudoku(emptyGrid);
    let game = createGame({ sudoku });

    // 计算冲突地图的辅助函数
    function getConflictsMap() {
        const grid = game.getSudoku().getGrid();
        return grid.map((row, r) => row.map((_, c) => game.getSudoku().isConflict(r, c)));
    }

    // 1. 初始化时，带上 conflicts
    const { subscribe, set } = writable({
        grid: game.getSudoku().getGrid(),
        conflicts: getConflictsMap(),
        canUndo: game.canUndo(),
        canRedo: game.canRedo(),
        isExploring: game.getIsExploring() 
    });

    //每次有动作时，更新 conflicts
    function notifyUpdate() {
        const currentSudoku = game.getSudoku();
        set({
            grid: currentSudoku.getGrid(),
            conflicts: getConflictsMap(),
            canUndo: game.canUndo(),
            canRedo: game.canRedo(),
            isWon: currentSudoku.isSolved(),
            isExploring: game.getIsExploring() // ✅ 新增这一行
        });
    }

    return {
        //对外暴露的API
        subscribe,
        guess: (row, col, value) => {
            game.guess({ row, col, value });
            notifyUpdate(); 
        },
        undo: () => {
            if (game.canUndo()) {
                game.undo();
                notifyUpdate();
            }
        },
        redo: () => {
            if (game.canRedo()) {
                game.redo();
                notifyUpdate();
            }
        },
        initNewGame: (realGrid) => {
            sudoku = createSudoku(realGrid);
            game = createGame({ sudoku });
            notifyUpdate();
        },

        startNew(difficulty) {
            // 1. 直接调用算法生成 9x9 数组
            const puzzleData = generateSudoku(difficulty);
            // 2. 直接初始化，不再经过任何旧的 Store
            this.initNewGame(puzzleData);
        },

        applyHint() {
            if (!game) return;

            const success = game.applyHint(); 
            
            if (success) {
                notifyUpdate(); 
            } else {
                alert("当前局面无解，需要开启探索模式！");
            }return success
        },
        startExplore() {
            game.startExplore();
            notifyUpdate(); // 通知界面刷新
        },
        cancelExplore() {
            game.cancelExplore();
            notifyUpdate(); // 读档回溯
        },
        commitExplore() {
            game.commitExplore();
            notifyUpdate(); // 确认分支，回到正常模式
        }

    };

}

// 导出全局单例
export const gameStore = createGameStore();