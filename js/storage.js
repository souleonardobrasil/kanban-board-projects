class Storage {
  constructor(storageKey = 'kanban_boards') {
    this.storageKey = storageKey;
  }

  getBoards() {
    try {
      const boards = localStorage.getItem(this.storageKey);
      return boards ? JSON.parse(boards) : [];
    } catch (error) {
      console.error('Error loading boards:', error);
      return [];
    }
  }

  saveBoards(boards) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(boards));
      return true;
    } catch (error) {
      console.error('Error saving boards:', error);
      return false;
    }
  }

  getBoardById(boardId) {
    const boards = this.getBoards();
    return boards.find(board => board.id === boardId);
  }

  saveBoard(board) {
    const boards = this.getBoards();
    const index = boards.findIndex(b => b.id === board.id);
    
    if (index >= 0) {
      boards[index] = board;
    } else {
      boards.push(board);
    }
    
    return this.saveBoards(boards);
  }

  deleteBoard(boardId) {
    const boards = this.getBoards();
    const filteredBoards = boards.filter(board => board.id !== boardId);
    return this.saveBoards(filteredBoards);
  }

  exportData() {
    const boards = this.getBoards();
    const dataStr = JSON.stringify(boards, null, 2);
    return new Blob([dataStr], { type: 'application/json' });
  }

  importData(jsonData) {
    try {
      const boards = JSON.parse(jsonData);
      if (!Array.isArray(boards)) {
        throw new Error('Invalid data format');
      }
      return this.saveBoards(boards);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Compatibility methods for existing code
  save(data) {
    return this.saveBoard(data);
  }

  load() {
    return this.getBoardById(this.storageKey) || null;
  }

  clear() {
    return this.deleteBoard(this.storageKey);
  }
}

export default Storage;