/**
 * Class representing the Kanban board
 */
class Board {
  /**
   * Create a new board
   * @param {Object} config - Board configuration
   * @param {string} config.containerId - ID of the container element
   * @param {Storage} config.storage - Storage instance for persistence
   */
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    this.storage = config.storage;
    this.columns = new Map();
    this.init();
  }

  /**
   * Initialize the board
   */
  init() {
    this.loadState();
    this.render();
    this.attachEventListeners();
  }

  /**
   * Load the board state from storage
   */
  loadState() {
    const data = this.storage.load();
    if (data?.columns) {
      data.columns.forEach(columnData => {
        const column = new Column(columnData);
        this.columns.set(column.id, column);
      });
    } else {
      this.createDefaultColumns();
    }
  }

  /**
   * Create default columns if no state exists
   */
  createDefaultColumns() {
    const defaultColumns = [
      { id: generateId(), title: 'A Fazer', status: 'todo' },
      { id: generateId(), title: 'Em Progresso', status: 'in-progress' },
      { id: generateId(), title: 'Concluído', status: 'done' }
    ];

    defaultColumns.forEach(columnData => {
      const column = new Column(columnData);
      this.columns.set(column.id, column);
    });
  }

  /**
   * Render the board and its columns
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = '';
    this.columns.forEach(column => {
      const columnElement = column.createElement();
      this.container.appendChild(columnElement);

      // Set up column event handlers
      column.onCardMoved = (card) => this.handleCardMoved(card);
      column.onAddCard = () => this.handleAddCard(column);
    });
  }

  /**
   * Attach event listeners to board-level controls
   */
  attachEventListeners() {
    const controls = document.getElementById('board-controls');
    if (!controls) return;

    // Add board-level event listeners here
  }

  /**
   * Handle card movement between columns
   * @param {Card} card - The moved card
   */
  handleCardMoved(card) {
    this.saveState();
  }

  /**
   * Handle adding a new card to a column
   * @param {Column} column - The column to add the card to
   */
  handleAddCard(column) {
    const cardData = {
      id: generateId(),
      title: 'Novo Cartão',
      description: '',
      status: column.status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const card = new Card(cardData);
    column.addCard(card);
    this.saveState();
  }

  /**
   * Save the current board state
   */
  saveState() {
    const data = {
      columns: Array.from(this.columns.values()).map(column => column.toJSON())
    };
    this.storage.save(data);
  }

  /**
   * Clear the board state
   */
  clear() {
    this.columns.clear();
    this.createDefaultColumns();
    this.render();
    this.storage.clear();
  }
}

export default Board;