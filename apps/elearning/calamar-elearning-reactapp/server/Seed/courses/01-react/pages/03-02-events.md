React event handlers are functions you pass as props such as `onClick`, `onChange`, `onSubmit` or `onKeyDown`.

## Passing a handler

```jsx
function Toolbar() {
  function handleSave() {
    console.log('Saving…');
  }
  return <button onClick={handleSave}>Save</button>;
}
```

Pass the function itself — **don't call it**:

```jsx
<button onClick={handleSave}>   // ✅ called on click
<button onClick={handleSave()}> // ❌ called during render!
```

To pass arguments, wrap the call in an arrow function:

```jsx
<button onClick={() => remove(item.id)}>Delete</button>
```

## The event object

Handlers receive a *synthetic event* that works the same in all browsers:

```jsx
<input onChange={(e) => setQuery(e.target.value)} />

<a href="/help" onClick={(e) => {
  e.preventDefault();     // stop the browser's default action
  openHelpDialog();
}}>Help</a>
```

## Propagation

Events bubble up from the element that was clicked through its ancestors. Call `e.stopPropagation()` to stop that:

```jsx
<div onClick={() => console.log('row clicked')}>
  <button onClick={(e) => { e.stopPropagation(); edit(); }}>Edit</button>
</div>
```

## Naming conventions

- Handlers inside a component: `handleClick`, `handleSubmit`.
- Props that accept handlers: `onSelect`, `onAddToCart` — mirroring the built-in `on…` names.

## Exercise

Build a component with a text input and a list. Pressing **Enter** in the input (`onKeyDown`, check `e.key === 'Enter'`) adds the text to the list and clears the input.
