A single-page application still needs multiple "pages" with their own URLs, working back/forward buttons and shareable links. **React Router** is the most popular solution.

```bash
npm install react-router
```

## Defining routes

```jsx
import { BrowserRouter, Routes, Route } from 'react-router';

createRoot(document.getElementById('root')).render(
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
```

Nested routes render inside their parent's `<Outlet />` — perfect for a shared header and navigation.

## Navigating

```jsx
import { Link, NavLink, useNavigate } from 'react-router';

<NavLink to="/products">Products</NavLink>     {/* gets an "active" class */}

const navigate = useNavigate();
function handleSaved(id) {
  navigate(`/products/${id}`);
}
```

Use `<Link>` instead of `<a href>` so the browser doesn't reload the whole page.

## Reading URL parameters

```jsx
import { useParams, useSearchParams } from 'react-router';

function ProductDetails() {
  const { id } = useParams();                   // /products/42 → "42"
  const [params, setParams] = useSearchParams(); // ?tab=reviews
  const tab = params.get('tab') ?? 'overview';
  // …
}
```

Storing UI state such as the current tab or search query in the URL makes it survive reloads and lets users share it.

See the attached `routes.jsx`.
