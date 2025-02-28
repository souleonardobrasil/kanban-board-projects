/**
 * Main application entry point
 */

// Import required modules
import Storage from './storage.js';
import Board from './board.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the application
  const KanbanApp = {
    init() {
      this.container = document.getElementById('kanban-container');
      this.loadBoard();
      this.setupEventListeners();
    },
    
    // Load current board or create a new one
    loadBoard() {
      const storage = new Storage();
      const boards = storage.getBoards();
      
      if (boards.length === 0) {
        // Create default board for first run
        this.currentBoard = new Board({
          title: 'My Project',
          columns: [
            { title: 'To Do', status: 'todo' },
            { title: 'In Progress', status: 'in-progress' },
            { title: 'Done', status: 'done' }
          ]
        });
        
        // Save the default board
        this.currentBoard.save();
      } else {
        // Load the first board
        this.currentBoard = new Board(boards[0]);
      }
      
      // Initialize the board with the container
      this.currentBoard.init('kanban-container');
    },
    
    // Set up global event listeners
    setupEventListeners() {
      // Import data button
      const importBtn = document.getElementById('import-btn');
      if (importBtn) {
        importBtn.addEventListener('click', () => {
          this.showImportDialog();
        });
      }
    },
    
    // Show import dialog
    showImportDialog() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target.result);
              this.currentBoard = new Board(data);
              this.currentBoard.init('kanban-container');
              this.currentBoard.save();
            } catch (error) {
              console.error('Error importing board:', error);
              alert('Error importing board. Please check the file format.');
            }
          };
          reader.readAsText(file);
        }
      });
      
      input.click();
    }
  };
  
  // Start the application
  KanbanApp.init();
});