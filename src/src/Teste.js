import React, { useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './model/util/css/index.css';

const ItemList = () => {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);

  const addItem = () => {
    const newItem = `Item ${items.length + 1}`;
    setItems([...items, newItem]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  return (
    <div>
      <button onClick={addItem}>Adicionar Item</button>
      
    </div>
  );
};

export default ItemList;
