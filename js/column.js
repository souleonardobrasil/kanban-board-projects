/**
 * Class representing a Kanban column
 */
class Column {
  /**
   * Create a new column
   * @param {Object} data - Column data
   * @param {string} data.id - Unique identifier for the column
   * @param {string} data.title - Column title
   * @param {string} data.status - Status identifier for the column
   * @param {Card[]} [data.cards=[]] - Array of cards in the column
   */
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.status = data.status;
    this.cards = new Map();
    this.element = null;

    if (Array.isArray(data.cards)) {
      data.cards.forEach(cardData => {
        const card = new Card(cardData);
        this.cards.set(card.id, card);
      });
    }
  }

  /**
   * Creates the DOM element for the column
   * @returns {HTMLElement} The column element
   */
  createElement() {
    const template = document.getElementById('column-template');
    const element = template.content.cloneNode(true).firstElementChild;
    
    element.dataset.id = this.id;
    element.dataset.status = this.status;
    this.element = element;
    
    this.render();
    this.setupDropZone();
    this.attachEventListeners();
    
    return element;
  }

  /**
   * Updates the column's content in the DOM
   */
  render() {
    if (!this.element) return;

    const titleEl = this.element.querySelector('.column-title');
    const cardsContainer = this.element.querySelector('.column-cards');
    
    titleEl.textContent = this.title;
    cardsContainer.innerHTML = '';
    
    this.cards.forEach(card => {
      cardsContainer.appendChild(card.createElement());
    });
  }

  /**
   * Sets up the column as a drop zone for drag and drop
   */
  setupDropZone() {
    if (!this.element) return;

    const cardsContainer = this.element.querySelector('.column-cards');
    new Sortable(cardsContainer, {
      group: 'cards',
      animation: 150,
      ghostClass: 'card-ghost',
      dragClass: 'card-drag',
      onEnd: (evt) => {
        const cardId = evt.item.dataset.id;
        const card = this.cards.get(cardId);
        if (card) {
          card.status = this.status;
          this.onCardMoved?.(card);
        }
      }
    });
  }

  /**
   * Attaches event listeners to the column element
   */
  attachEventListeners() {
    if (!this.element) return;

    const addCardBtn = this.element.querySelector('.add-card');
    if (addCardBtn) {
      addCardBtn.addEventListener('click', () => {
        this.onAddCard?.();
      });
    }
  }

  /**
   * Adds a new card to the column
   * @param {Card} card - The card to add
   */
  addCard(card) {
    this.cards.set(card.id, card);
    if (this.element) {
      const cardsContainer = this.element.querySelector('.column-cards');
      cardsContainer.appendChild(card.createElement());
    }
  }

  /**
   * Removes a card from the column
   * @param {string} cardId - ID of the card to remove
   */
  removeCard(cardId) {
    const card = this.cards.get(cardId);
    if (card) {
      card.remove();
      this.cards.delete(cardId);
    }
  }

  /**
   * Converts the column to a plain object for storage
   * @returns {Object} Plain object representation of the column
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      cards: Array.from(this.cards.values()).map(card => card.toJSON())
    };
  }
}

export default Column;