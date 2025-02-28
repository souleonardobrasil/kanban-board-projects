/**
 * Class representing the Kanban board
 */
class KanbanBoard {
  /**
   * Create a new board
   * @param {Object} config - Board configuration
   * @param {string} config.containerId - ID of the container element
   * @param {Storage} config.storage - Storage instance for persistence
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.title = data.title || 'Novo Quadro';
    this.description = data.description || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.columns = new Map();
    this.container = null;

    // Initialize columns if provided
    if (Array.isArray(data.columns)) {
      data.columns.forEach(columnData => {
        const column = new Column(columnData);
        this.columns.set(column.id, column);
      });
    }
  }

  /**
   * Initialize the board
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('Container element not found');
      return;
    }
    this.render();
    this.setupEventListeners();
  }

  /**
   * Load the board state from storage
   */
  addColumn(columnData) {
    const column = new Column({
      id: generateId(),
      ...columnData
    });
    this.columns.set(column.id, column);
    if (this.container) {
      this.render();
    }
    return column;
  }

  /**
   * Remove a column from the board
   * @param {string} columnId - ID of the column to remove
   */
  removeColumn(columnId) {
    if (this.columns.delete(columnId) && this.container) {
      this.render();
    }
  }

  /**
   * Find a column by its ID
   * @param {string} columnId - ID of the column to find
   * @returns {Column|undefined} The found column or undefined
   */
  findColumn(columnId) {
    return this.columns.get(columnId);
  }

  /**
   * Move a card between columns
   * @param {string} cardId - ID of the card to move
   * @param {string} sourceColumnId - ID of the source column
   * @param {string} targetColumnId - ID of the target column
   * @param {number} [position] - Position to insert the card at
   * @returns {boolean} Whether the move was successful
   */
  moveCard(cardId, sourceColumnId, targetColumnId, position) {
    const sourceColumn = this.findColumn(sourceColumnId);
    const targetColumn = this.findColumn(targetColumnId);

    if (!sourceColumn || !targetColumn) return false;

    const card = sourceColumn.cards.get(cardId);
    if (!card) return false;

    // Check WIP limit
    if (targetColumn.wipLimit > 0 && targetColumn.cards.size >= targetColumn.wipLimit) {
      alert(`A coluna "${targetColumn.title}" atingiu o limite de ${targetColumn.wipLimit} cartões.`);
      return false;
    }

    // Remove from source column
    sourceColumn.removeCard(cardId);

    // Add to target column
    card.status = targetColumn.status;
    targetColumn.addCard(card);

    return true;
  }

  /**
   * Render the board and its columns
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = '';

    // Create board header
    const header = document.createElement('div');
    header.className = 'board-header';
    header.innerHTML = `
      <h1>${this.title}</h1>
      <div class="board-actions">
        <button class="add-column-btn">Adicionar Coluna</button>
        <button class="export-btn">Exportar</button>
      </div>
    `;
    this.container.appendChild(header);

    // Create columns container
    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'columns-container';
    this.container.appendChild(columnsContainer);

    // Render columns
    this.columns.forEach(column => {
      const columnElement = column.createElement();
      columnsContainer.appendChild(columnElement);

      // Set up column event handlers
      column.onCardMoved = (card) => this.handleCardMoved(card);
      column.onAddCard = () => this.handleAddCard(column);
    });

    // Setup drag and drop
    this.setupDragAndDrop(columnsContainer);
  }

  /**
   * Attach event listeners to board-level controls
   */
  setupEventListeners() {
    if (!this.container) return;

    this.container.addEventListener('click', (e) => {
      if (e.target.matches('.add-column-btn')) {
        this.showAddColumnDialog();
      } else if (e.target.matches('.export-btn')) {
        this.exportBoard();
      }
    });
  }

  /**
   * Set up drag and drop functionality
   * @param {HTMLElement} columnsContainer - Container element for columns
   */
  setupDragAndDrop(columnsContainer) {
    new Sortable(columnsContainer, {
      animation: 150,
      handle: '.column-header',
      draggable: '.kanban-column',
      ghostClass: 'column-ghost',
      onEnd: (evt) => {
        // Update columns order
        const columns = Array.from(columnsContainer.children);
        const newColumns = new Map();
        columns.forEach(colElement => {
          const columnId = colElement.dataset.id;
          const column = this.findColumn(columnId);
          if (column) {
            newColumns.set(columnId, column);
          }
        });
        this.columns = newColumns;
        this.save();
      }
    });
  }

  /**
   * Show dialog to add a new column
   */
  showAddColumnDialog() {
    const title = prompt('Digite o título da nova coluna:');
    if (title) {
      this.addColumn({
        title,
        status: title.toLowerCase().replace(/\s+/g, '-')
      });
      this.save();
    }
  }

  /**
   * Export board data
   */
  exportBoard() {
    const data = this.toJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-board-${this.id}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const card = new Card(cardData);
    if (column.addCard(card)) {
      this.save();
    }
  }

  /**
   * Save the current board state
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      createdAt: this.createdAt,
      columns: Array.from(this.columns.values()).map(column => column.toJSON())
    };
  }

  /**
   * Save the board state
   */
  save() {
    const storage = new Storage();
    storage.saveBoard(this.toJSON());
  }

  /**
   * Filter cards based on search term and filter criteria
   * @param {string} searchTerm - Text to search for in card title and description
   * @param {Object} filters - Filter criteria (priority, labels, etc)
   */
  filterCards(searchTerm, filters = {}) {
    // Reset visual state of all cards
    document.querySelectorAll('.kanban-card').forEach(card => {
      card.style.display = 'block';
    });
    
    if (!searchTerm && Object.keys(filters).length === 0) {
      return; // Nothing to filter
    }
    
    // Iterate through all columns and cards
    this.columns.forEach(column => {
      column.cards.forEach(card => {
        const cardElement = document.querySelector(`.kanban-card[data-id="${card.id}"]`);
        if (!cardElement) return;
        
        let visible = true;
        
        // Filter by search term
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const titleMatch = card.title.toLowerCase().includes(searchLower);
          const descMatch = card.description.toLowerCase().includes(searchLower);
          visible = titleMatch || descMatch;
        }
        
        // Apply additional filters
        if (visible && filters.priority) {
          visible = card.priority === filters.priority;
        }
        
        if (visible && filters.label) {
          visible = card.labels.includes(filters.label);
        }
        
        if (visible && filters.dueDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          switch (filters.dueDate) {
            case 'overdue':
              visible = card.dueDate && new Date(card.dueDate) < today;
              break;
            case 'today':
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              visible = card.dueDate && 
                       new Date(card.dueDate) >= today && 
                       new Date(card.dueDate) < tomorrow;
              break;
            case 'week':
              const nextWeek = new Date(today);
              nextWeek.setDate(nextWeek.getDate() + 7);
              visible = card.dueDate && 
                       new Date(card.dueDate) >= today && 
                       new Date(card.dueDate) <= nextWeek;
              break;
          }
        }
        
        // Update card visibility
        cardElement.style.display = visible ? 'block' : 'none';
      });
    });
  }
}

export default KanbanBoard;