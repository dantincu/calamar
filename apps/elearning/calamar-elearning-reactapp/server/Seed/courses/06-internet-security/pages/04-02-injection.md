# Injection

**Injection** happens when untrusted input is mixed into something that gets **interpreted**: a SQL query, a shell command, an LDAP filter, HTML. If the input can change the *structure* of the command rather than just being data, the attacker writes part of your program.

## SQL injection, step by step

The attached `sqli-demo.js` creates an in-memory database and builds a query by string concatenation:

```js
const sql = `SELECT item FROM orders WHERE user_email = '${email}'`;
```

With a normal input, it works. Now the attacker types `x' OR '1'='1`:

```sql
SELECT item FROM orders WHERE user_email = 'x' OR '1'='1'
```

The quote closed the string early, and `OR '1'='1'` made the condition true for **every row**: everyone's orders come back. A `UNION` pulls data from other tables entirely:

```sql
SELECT item FROM orders WHERE user_email = 'x'
UNION SELECT email || ':' || password_hash FROM users --'
```

The demo's output shows the user table's e-mails and hashes coming back as "orders". Real attacks go further: reading any table, sometimes writing files or running commands, depending on the database and its permissions.

## The fix: parameterized queries

```js
const stmt = db.prepare('SELECT item FROM orders WHERE user_email = ?');
stmt.all(email);
```

The SQL text is **fixed**, and the input travels separately as a value. Whatever it contains, it can only ever be compared with `user_email`. In the demo, both attacks return `[]`.

Every database library supports parameters (`?`, `$1`, `@name`). ORMs use them for you, but most ORMs also have a "raw SQL" escape hatch, where the same rule applies.

**Don't** try to fix injection by escaping quotes or filtering "bad" characters yourself. There are too many edge cases: encodings, numeric contexts, database-specific syntax.

## When parameters can't help

Table and column names, and `ORDER BY` directions, can't be parameters. Use an **allow-list**:

```js
const SORTABLE = new Set(['item', 'id']);
if (!SORTABLE.has(column)) throw new Error(`Can't sort by ${column}`);
```

## Command injection

```js
exec(`convert ${filename} out.png`);                        // filename = "a.jpg; rm -rf ~"
execFile('convert', [filename, 'out.png']);                 // arguments, no shell: safe
```

Avoid shells. Pass arguments as an array, so no shell ever parses the input. Validate inputs against what you expect (for example `^[\w.-]+$` for a file name), and put `--` before user-supplied file names, so they can't be taken for options.

## Defense in depth for databases

- The application's database user gets **only the permissions it needs**: no `DROP`, no access to other schemas, no file functions.
- Validate input types and ranges early. An ID is an integer, so reject anything else.
- Show generic error messages: database errors displayed to users help attackers refine an injection.
