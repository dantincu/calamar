// sqli-demo.js: SQL injection, shown safely on an in-memory database, and the fix.
//   node sqli-demo.js            (Node 22.5 or later: uses the built-in node:sqlite)
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password_hash TEXT, is_admin INTEGER);
  INSERT INTO users (email, password_hash, is_admin) VALUES
    ('admin@example.com', 'not-a-real-hash-1', 1),
    ('ada@example.com',   'not-a-real-hash-2', 0);
  CREATE TABLE orders (id INTEGER PRIMARY KEY, user_email TEXT, item TEXT);
  INSERT INTO orders (user_email, item) VALUES ('ada@example.com', 'Keyboard'), ('admin@example.com', 'Server rack');
`);

// ---------------------------------------------------------------------------------------------
// VULNERABLE: the input becomes part of the SQL text, so it can change the query's structure.
// ---------------------------------------------------------------------------------------------
function ordersOfVulnerable(email) {
  const sql = `SELECT item FROM orders WHERE user_email = '${email}'`;
  console.log('   SQL:', sql);
  return db.prepare(sql).all().map((r) => r.item);
}

// ---------------------------------------------------------------------------------------------
// SAFE: a parameterized query. The SQL text is fixed, and the input is sent separately as data:
// whatever it contains, it can only ever be compared with user_email.
// ---------------------------------------------------------------------------------------------
const ordersStmt = db.prepare('SELECT item FROM orders WHERE user_email = ?');
function ordersOfSafe(email) {
  return ordersStmt.all(email).map((r) => r.item);
}

const inputs = [
  ['a normal user', 'ada@example.com'],
  ['an injection that makes the condition always true', "x' OR '1'='1"],
  ['an injection that appends a second query (UNION)', "x' UNION SELECT email || ':' || password_hash FROM users --"],
];

for (const [label, input] of inputs) {
  console.log(`\nInput: ${label}\n   ${JSON.stringify(input)}`);
  console.log('   vulnerable ->', ordersOfVulnerable(input));
  console.log('   safe       ->', ordersOfSafe(input));
}

// Identifiers (table and column names) can't be parameters. When they must vary, use an allow-list:
const SORTABLE = new Set(['item', 'id']);
function ordersSorted(email, column) {
  if (!SORTABLE.has(column)) throw new Error(`Can't sort by ${column}`);
  return db.prepare(`SELECT item FROM orders WHERE user_email = ? ORDER BY ${column}`).all(email).map((r) => r.item);
}
console.log('\nSorted by an allowed column:', ordersSorted('ada@example.com', 'item'));
try {
  ordersSorted('ada@example.com', 'item; DROP TABLE users');
} catch (e) {
  console.log('Rejected:', e.message);
}
