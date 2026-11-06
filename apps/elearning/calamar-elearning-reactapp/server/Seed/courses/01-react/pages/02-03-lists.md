Real UIs show collections of things and hide or show parts depending on data.

## Rendering lists with `map`

```jsx
const fruits = ['apple', 'banana', 'cherry'];

<ul>
  {fruits.map((fruit) => (
    <li key={fruit}>{fruit}</li>
  ))}
</ul>
```

### Keys

Every item in a list needs a `key` that is **unique among its siblings** and **stable** over time. React uses keys to match items between renders. Database ids are ideal. Avoid using the array index when items can be reordered, inserted or deleted — it leads to subtle bugs with state and inputs.

## Filtering before rendering

```jsx
const done = todos.filter((t) => t.done);
return <p>{done.length} of {todos.length} done</p>;
```

## Conditional rendering

Three common patterns:

```jsx
// 1. if before return
if (!user) return <p>Please sign in.</p>;

// 2. the ternary operator
{isLoading ? <Spinner /> : <Results items={items} />}

// 3. && for "show or nothing"
{errors.length > 0 && <ErrorList errors={errors} />}
```

> Watch out: `{count && <p>…</p>}` renders `0` when `count` is `0`. Use `{count > 0 && …}` instead.

Returning `null` from a component renders nothing.

The attached `TodoList.jsx` combines lists, keys, filtering and conditions.
