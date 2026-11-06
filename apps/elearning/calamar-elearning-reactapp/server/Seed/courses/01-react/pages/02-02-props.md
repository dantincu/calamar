Props are how a parent component passes data to a child. They work like function arguments.

## Passing and reading props

```jsx
function Avatar({ name, size = 48 }) {
  return <img src={`/avatars/${name}.png`} alt={name} width={size} height={size} />;
}

function Profile() {
  return (
    <div>
      <Avatar name="ada" size={96} />
      <Avatar name="grace" />   {/* size falls back to 48 */}
    </div>
  );
}
```

React collects all attributes into a single `props` object; destructuring (`{ name, size = 48 }`) picks out what you need and gives defaults.

## Props are read-only

A component must never change its own props. If something needs to change over time, that's **state** (next chapter).

## The `children` prop

Whatever you put *between* a component's tags arrives as `children`. This makes wrapper components easy:

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

<Card title="Shipping">
  <p>Free over $50.</p>
</Card>
```

## Passing functions

Props can be functions too — this is how children talk back to parents:

```jsx
<ProductCard product={p} onAddToCart={() => addToCart(p.id)} />
```

The attached `ProductCard.jsx` puts all of this together.

## Exercise

Create a `Badge` component that takes `label` and `color` props, and use it three times with different values.
