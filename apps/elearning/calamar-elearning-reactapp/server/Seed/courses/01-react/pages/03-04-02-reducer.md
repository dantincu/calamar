When state updates get complicated — many event handlers changing the same data in different ways — `useReducer` lets you gather all the update logic in one pure function.

## The reducer

A reducer takes the current state and an **action** describing what happened, and returns the next state:

```js
function cartReducer(state, action) {
  switch (action.type) {
    case 'added':
      return [...state, { ...action.product, qty: 1 }];
    case 'removed':
      return state.filter((item) => item.id !== action.id);
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
```

Reducers must be **pure**: no side effects, no mutation, the same inputs always give the same output. That makes them very easy to test (see `cartReducer.js`).

## Using it in a component

```jsx
const [cart, dispatch] = useReducer(cartReducer, []);

<button onClick={() => dispatch({ type: 'added', product })}>Add</button>
<button onClick={() => dispatch({ type: 'removed', id: item.id })}>Remove</button>
```

Event handlers now only say **what happened**; the reducer decides **how the state changes**.

## useState or useReducer?

| | `useState` | `useReducer` |
|---|---|---|
| Simple values | ✅ ideal | overkill |
| Many related updates | handlers get messy | ✅ centralized |
| Testing the logic | via the component | ✅ plain function |

The attached `Cart.jsx` uses `cartReducer.js`.
