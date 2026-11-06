// A pure reducer: (state, action) => newState. No mutation, no side effects.
export function cartReducer(cart, action) {
  switch (action.type) {
    case 'added': {
      const existing = cart.find((i) => i.id === action.product.id);
      if (existing) {
        return cart.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...cart, { ...action.product, qty: 1 }];
    }
    case 'quantityChanged':
      return cart
        .map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i))
        .filter((i) => i.qty > 0);
    case 'removed':
      return cart.filter((i) => i.id !== action.id);
    case 'cleared':
      return [];
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export const cartTotal = (cart) => cart.reduce((sum, i) => sum + i.price * i.qty, 0);

// Reducers are trivial to test without React:
//   const s1 = cartReducer([], { type: 'added', product: { id: 1, price: 5 } });
//   console.assert(cartTotal(s1) === 5);
