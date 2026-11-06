// A component that uses JavaScript expressions inside JSX.
export default function Greeting() {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const user = { first: 'Ada', last: 'Lovelace' };

  return (
    <section className="greeting" style={{ padding: 16, borderRadius: 8, background: '#eef' }}>
      <h2>Good {part}, {user.first}!</h2>
      <p>
        Your full name has {user.first.length + user.last.length} letters.
      </p>
    </section>
  );
}
