// npm install react-router
import { BrowserRouter, Link, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router';

const products = [
  { id: '1', name: 'Keyboard', price: 89 },
  { id: '2', name: 'Mouse', price: 39 },
  { id: '3', name: 'Monitor', price: 249 },
];

function Layout() {
  const style = ({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal', marginRight: 12 });
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <nav>
        <NavLink to="/" end style={style}>Home</NavLink>
        <NavLink to="/products" style={style}>Products</NavLink>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

const Home = () => <h2>Welcome to the shop</h2>;

function Products() {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}><Link to={`/products/${p.id}`}>{p.name}</Link></li>
      ))}
    </ul>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  if (!product) return <p>No such product.</p>;
  return (
    <div>
      <h2>{product.name}</h2>
      <p>${product.price}</p>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

const NotFound = () => <p>Page not found.</p>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
