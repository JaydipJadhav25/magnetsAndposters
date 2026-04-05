import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "map_cart";

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.findIndex(
        (i) =>
          i.productId === action.item.productId &&
          i.variant === action.item.variant,
      );
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = {
          ...items[existing],
          quantity: items[existing].quantity + action.item.quantity,
        };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((_, i) => i !== action.index),
      };
    case "UPDATE_QTY": {
      const items = [...state.items];
      items[action.index] = { ...items[action.index], quantity: action.qty };
      return { ...state, items };
    }
    case "UPDATE_IMAGE": {
      const items = [...state.items];
      items[action.index] = {
        ...items[action.index],
        customImage: action.image,
      };
      return { ...state, items };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { items: [] };
    } catch {
      return { items: [] };
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Persist cart
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addItem = (item) => {
    dispatch({ type: "ADD", item });
    setIsOpen(true);
  };
  const removeItem = (index) => dispatch({ type: "REMOVE", index });
  const updateQty = (index, qty) =>
    dispatch({ type: "UPDATE_QTY", index, qty });
  const updateImage = (index, image) =>
    dispatch({ type: "UPDATE_IMAGE", index, image });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const subtotal = state.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        subtotal,
        itemCount,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQty,
        updateImage,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
