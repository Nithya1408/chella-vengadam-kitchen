import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

// Custom hook to use the cart from any component
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider component (wraps the app)
export function CartProvider({ children }) {
  // Initialize cart from localStorage if available (so cart survives page refresh)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cv_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem('cv_cart', JSON.stringify(cart));
  }, [cart]);

  // Add an item to cart (or increment quantity if already there)
  const addToCart = (item) => {
    setCart(prevCart => {
      const existing = prevCart.find(c => c.item_id === item.item_id);
      if (existing) {
        return prevCart.map(c =>
          c.item_id === item.item_id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Increase quantity
  const increaseQuantity = (itemId) => {
    setCart(prevCart =>
      prevCart.map(c =>
        c.item_id === itemId ? { ...c, quantity: c.quantity + 1 } : c
      )
    );
  };

  // Decrease quantity (removes from cart if reaches 0)
  const decreaseQuantity = (itemId) => {
    setCart(prevCart =>
      prevCart
        .map(c =>
          c.item_id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        )
        .filter(c => c.quantity > 0)
    );
  };

  // Remove item entirely
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(c => c.item_id !== itemId));
  };

  // Clear cart (after order placement)
  const clearCart = () => {
    setCart([]);
  };

  // Get quantity of a specific item (helps cards show + / - vs Add)
  const getItemQuantity = (itemId) => {
    const item = cart.find(c => c.item_id === itemId);
    return item ? item.quantity : 0;
  };

  // Computed: total item count (for navbar badge)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Computed: subtotal before tax
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // Computed: GST (5% for restaurants in India)
  const gst = subtotal * 0.05;

  // Computed: total
  const total = subtotal + gst;

  const value = {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalItems,
    subtotal,
    gst,
    total,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}