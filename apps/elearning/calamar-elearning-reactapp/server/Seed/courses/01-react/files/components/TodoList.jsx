const todos = [
  { id: 'a1', text: 'Learn JSX', done: true },
  { id: 'b2', text: 'Understand props', done: true },
  { id: 'c3', text: 'Master state', done: false },
  { id: 'd4', text: 'Build an app', done: false },
];

function TodoItem({ todo }) {
  return (
    <li style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
      {todo.done && '✔ '}
      {todo.text}
    </li>
  );
}

export default function TodoList({ showDone = true }) {
  const visible = showDone ? todos : todos.filter((t) => !t.done);
  const remaining = todos.filter((t) => !t.done).length;

  if (visible.length === 0) return <p>Nothing to do. Enjoy your day!</p>;

  return (
    <section>
      <h2>Todos</h2>
      <ul>
        {visible.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      {remaining > 0 ? <p>{remaining} left</p> : <p>All done!</p>}
    </section>
  );
}
