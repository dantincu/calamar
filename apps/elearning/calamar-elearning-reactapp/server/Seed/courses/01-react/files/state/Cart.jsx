import { useReducer } from 'react';
import { cartReducer, cartTotal } from './cartReducer.js';

const products = [
  { id: 1, name: 'Coffee beans', price: 12.5 },
  { id: 2, name: 'Grinder', price: 45 },
  { id: 3, name: 'Mug', price: 8 },
];

export default function Cart() {
  const [cart, dispatch] = useReducer(cartReducer, []);

  return (
    <div style={{ fontFamily: 'system-ui', display: 'flex', gap: 32 }}>
      <section>
        <h3>Products</h3>
        {products.map((p) => (
          <div key={p.id}>
            {p.name} (${p.price}){' '}
            <button onClick={() => dispatch({ type: 'added', product: p })}>Add</button>
          </div>
        ))}
      </section>
      <section>
        <h3>Cart</h3>
        {cart.length === 0 && <p>Empty</p>}
        {cart.map((i) => (
          <div key={i.id}>
            {i.name} ×{' '}
            <input
              type="number" min={0} value={i.qty} style={{ width: 48 }}
              onChange={(e) => dispatch({ type: 'quantityChanged', id: i.id, qty: Number(e.target.value) })}
            />{' '}
            <button onClick={() => dispatch({ type: 'removed', id: i.id })}>✕</button>
          </div>
        ))}
        <p><strong>Total: ${cartTotal(cart).toFixed(2)}</strong></p>
        {cart.length > 0 && <button onClick={() => dispatch({ type: 'cleared' })}>Clear</button>}
      </section>
    </div>
  );
}
