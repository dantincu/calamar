React is a JavaScript library for building user interfaces. It was created at Facebook and is today one of the most widely used tools for web front-ends.

## The core idea: UI as a function of state

With plain DOM code, you describe *how* to change the page step by step:

```js
const button = document.querySelector('#like');
let likes = 0;
button.addEventListener('click', () => {
  likes++;
  button.textContent = `Likes: ${likes}`; // you must remember to update the DOM
});
```

With React you describe *what* the UI should look like for a given state, and React figures out the DOM changes:

```jsx
function LikeButton() {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(likes + 1)}>Likes: {likes}</button>;
}
```

When `likes` changes, React calls `LikeButton` again, compares the new result with the previous one and updates only what changed.

## Components

A React app is a tree of **components**. A component is a JavaScript function that returns markup. Components can contain other components, just like HTML elements contain other elements:

```jsx
function App() {
  return (
    <main>
      <Header />
      <ProductList />
      <Footer />
    </main>
  );
}
```

## Key vocabulary

| Term | Meaning |
|------|---------|
| Component | A function returning UI |
| JSX | The HTML-like syntax used inside components |
| Props | Inputs passed from a parent to a child component |
| State | Data a component remembers between renders |
| Hook | A function starting with `use` that adds React features (`useState`, `useEffect`, …) |
| Render | React calling your component to find out what to show |

You will meet each of these in detail in the next chapters.
