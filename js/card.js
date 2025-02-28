/**
 * Class representing a Kanban card
 */
class Card {
  /**
   * Create a new card
   * @param {Object} data - Card data
   * @param {string} data.id - Unique identifier for the card
   * @param {string} data.title - Card title
   * @param {string} data.description - Card description
   * @param {string} data.status - Current status/column of the card
   * @param {Date} data.createdAt - Creation date
   * @param {Date} data.updatedAt - Last update date
   * @param {string} data.priority - Card priority (low, medium, high)
   * @param {string[]} data.labels - Card labels
   * @param {string} data.dueDate - Due date for the card
   */
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description || '';
    this.status = data.status;
    this.createdAt = new Date(data.createdAt || Date.now());
    this.updatedAt = new Date(data.updatedAt || Date.now());
    this.priority = data.priority || 'medium';
    this.labels = data.labels || [];
    this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    this.element = null;
  }

  /**
   * Creates the DOM element for the card
   * @returns {HTMLElement} The card element
   */
  createElement() {
    const template = document.getElementById('card-template');
    const element = template.content.cloneNode(true).firstElementChild;
    
    element.dataset.id = this.id;
    this.element = element;
    this.render();
    this.attachEventListeners();
    
    return element;
  }

  /**
   * Updates the card's content in the DOM
   */
  render() {
    if (!this.element) return;

    this.element.className = `kanban-card priority-${this.priority}`;
    
    const content = `
      <div class="card-header">
        <h3 class="card-title">${this.title}</h3>
        <div class="card-actions">
          <button class="edit-card">Edit</button>
          <button class="delete-card">×</button>
        </div>
      </div>
      ${this.labels.length ? `
        <div class="card-labels">
          ${this.labels.map(label => `<span class="label ${label}">${label}</span>`).join('')}
        </div>
      ` : ''}
      ${this.description ? `<div class="card-description">${this.description}</div>` : ''}
      ${this.dueDate ? `
        <div class="card-due-date ${this.isOverdue() ? 'overdue' : ''}">
          Due: ${formatDate(this.dueDate)}
        </div>
      ` : ''}
      <div class="card-date">Updated: ${formatDate(this.updatedAt)}</div>
    `;

    this.element.innerHTML = content;
    this.attachEventListeners();
  }

  /**
   * Attaches event listeners to the card element
   */
  attachEventListeners() {
    if (!this.element) return;

    this.element.querySelector('.edit-card').addEventListener('click', () => {
      this.edit();
    });

    this.element.querySelector('.delete-card').addEventListener('click', () => {
      this.delete();
    });
  }

  /**
   * Updates the card's data
   * @param {Object} data - New card data
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date();
    this.render();
  }

  /**
   * Removes the card from the DOM
   */
  remove() {
    this.element?.remove();
    this.element = null;
  }

  /**
   * Converts the card to a plain object for storage
   * @returns {Object} Plain object representation of the card
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      priority: this.priority,
      labels: this.labels,
      dueDate: this.dueDate ? this.dueDate.toISOString() : null
    };
  }

  /**
   * Check if the card is overdue
   * @returns {boolean} True if the card is overdue
   */
  isOverdue() {
    if (!this.dueDate) return false;
    return this.dueDate < new Date();
  }
}

export default Card;