export default function App() {
  const today = new Date().toLocaleDateString();
  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Hello, React!</h1>
      <p>Today is {today}.</p>
    </main>
  );
}
