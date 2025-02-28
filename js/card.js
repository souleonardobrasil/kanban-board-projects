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
   */
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description || '';
    this.status = data.status;
    this.createdAt = new Date(data.createdAt || Date.now());
    this.updatedAt = new Date(data.updatedAt || Date.now());
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

    this.element.querySelector('.card-title').textContent = this.title;
    this.element.querySelector('.card-description').textContent = this.description;
    this.element.querySelector('.card-date').textContent = formatDate(this.updatedAt);
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
      updatedAt: this.updatedAt.toISOString()
    };
  }
}

export default Card;