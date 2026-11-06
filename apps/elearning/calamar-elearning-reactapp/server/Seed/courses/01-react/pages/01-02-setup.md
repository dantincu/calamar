We will use **Vite**, a fast build tool with an excellent React template.

## Prerequisites

Install a current LTS version of [Node.js](https://nodejs.org). Check it from a terminal:

```bash
node --version
npm --version
```

## Create the project

```bash
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
```

Open the address Vite prints (usually `http://localhost:5173`). Edit `src/App.jsx`, save, and watch the page update instantly.

## The project structure

```
my-react-app/
  index.html        <- the single HTML page; it loads src/main.jsx
  package.json
  src/
    main.jsx        <- mounts React into the page
    App.jsx         <- your root component
```

The attached files show minimal versions of `index.html`, `main.jsx` and `App.jsx`.

`main.jsx` is where React takes control of a DOM element:

```jsx
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
```

## Useful tools

- **React Developer Tools** browser extension: inspect components, their props and state.
- An editor with JSX support, for example VS Code.

## Exercise

Change `App.jsx` so that it shows your name in a heading and today's date in a paragraph (hint: `new Date().toLocaleDateString()`).
