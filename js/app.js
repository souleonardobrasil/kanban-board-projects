/**
 * Main application entry point
 */

// Import required modules
import Storage from './storage.js';
import Board from './board.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create storage instance
  const storage = new Storage();

  // Initialize the board
  const board = new Board({
    containerId: 'kanban-container',
    storage: storage
  });

  // Make board instance available globally for debugging
  window.board = board;
});