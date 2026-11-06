function Price({ amount, currency = 'USD' }) {
  const text = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  return <strong>{text}</strong>;
}

function Card({ title, children }) {
  return (
    <article style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 220 }}>
      <h3>{title}</h3>
      {children}
    </article>
  );
}

export function ProductCard({ product, onAddToCart }) {
  return (
    <Card title={product.name}>
      <p>{product.description}</p>
      <Price amount={product.price} />
      <button onClick={() => onAddToCart(product.id)} style={{ display: 'block', marginTop: 8 }}>
        Add to cart
      </button>
    </Card>
  );
}

export default function Shop() {
  const products = [
    { id: 1, name: 'Keyboard', description: 'Mechanical, quiet switches', price: 89 },
    { id: 2, name: 'Mouse', description: 'Wireless, ergonomic', price: 39.5 },
  ];
  const add = (id) => alert(`Added product ${id}`);
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAddToCart={add} />
      ))}
    </div>
  );
}
