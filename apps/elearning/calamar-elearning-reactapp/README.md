# Calamar e-learning

An e-learning app: a React client (`client/`) and an ASP.NET Core server (`server/`), storing everything in two configurable folders. The requirements are in [CLAUDE.md](CLAUDE.md).

## Running

**Deployed** (see `deploy.ps1`): `%LOCALAPPDATA%\Calamar\Apps\Bin\calamar-elearning-reactapp\server\Calamar.ELearning.Server.exe`, then open <https://localhost:5181>. The server also serves the client (http://localhost:5180 redirects to HTTPS).

**Development:**

```powershell
cd server; dotnet run --environment Development   # API on https://localhost:5181, data in .dev-data/
cd client; npm install; npm run dev                # http://localhost:5173, proxies /api to the server
```

**Deploying:** `./deploy.ps1` builds the client, publishes the server and copies both into the deployment folder. It never touches the data folders.

## Configuration (`server/appsettings.json`)

| Setting | Default | Meaning |
|---|---|---|
| `Kestrel:Endpoints` | `https://localhost:5181` (+ `http://localhost:5180`, redirect only) | where the server listens, and the HTTPS certificate |
| `App:LocalDataFolder` | `../local-data` | the SQLite database (`calamar-elearning.sqlite`), cookie keys, and the e-mail outbox |
| `App:RemoteDataFolder` | `../remote-data` | the course content (the notes notebook `c/`) |
| `App:ClientFolder` | `../client` | the built React client |
| `App:AdminEmail`, `SeedCreatorEmail`, `SeedEndUserEmail` | see the spec | the three accounts that exist from the start |
| `Smtp:*` | empty | the SMTP server for "forgot password" codes |

Relative folders are resolved against the server's binaries folder, so by default the two data folders sit next to `client` and `server`.

**E-mail:** until `Smtp:Host` is set, e-mails are not sent but written as text files to `<LocalDataFolder>/outbox/`. For Gmail, use `smtp.gmail.com`, port 587, SSL on, and an [app password](https://myaccount.google.com/apppasswords).

## Accounts

- **Admin** (`tincuvd@gmail.com`) manages the category hierarchy and the tags, and sees the list of accounts. It can't be created through sign-up.
- **Content creators** create courses: chapters, sub-chapters, pages (Markdown), and files attached to pages. They can only edit and delete their own courses. They create tags by tagging their courses.
- **Learners** browse the category tree or search, subscribe to courses and read them.

The three starting accounts have no password: the first sign-in asks for one. Creators and learners can sign up on their own. Anyone can choose a new password with *Forgot password* (also linked as *Change password* in the header): a random 6-digit code is e-mailed, valid 15 minutes, 5 attempts.

Passwords are stored in the SQLite database as salted PBKDF2-SHA512 hashes (210,000 iterations), which can't be turned back into the password. That is the standard way to store passwords, and it is how this app meets the spec's "store passwords encrypted".

## Writing pages

Pages are Markdown with GitHub extensions (tables, task lists, strikethrough), syntax-highlighted code blocks, and **math**: `$…$` inline and `$$…$$` (or a ` ```math ` block) for display formulas, rendered with KaTeX. An invalid formula is shown in red instead of breaking the page. A lone `$` (a price) is left alone; write `\$` if two of them on one line pair up by accident.

## Storage

**SQLite** (`local-data/calamar-elearning.sqlite`): users, reset codes, categories, tags, courses (catalog data plus a pointer to their notes), course tags, subscriptions.

**Notes** (`remote-data/c/`) use the *folder pairs* and *notes* strategies from ayran csdrive-webhost-v2 (`docs/strategies/`):

```
remote-data/c/                                   <- notebook root: [note-book].json, [note-children].json
  999/  999-dan.tincu.work@gmail.com/            <- one note item per content creator (title = e-mail)
    999/  999-Learn React From Components…/      <- one note item per course: its markdown is the description + table of contents
      999/  999-Welcome to the course/           <- a page (note item, 999→401)
      399/  399-Getting Started/                 <- a chapter (ternary note section, 399→301)
        999/  999-What is React/                 <- pages inside the chapter
        998/  998-Setting up a project with Vite/
          0-Setting up a project with Vite[note].md
          [note].json  [note-children].json
          01/  01-[note-files]/                  <- the page's files (sample code)
```

- Each pair is a short folder `NNN` (the data) plus a marker folder `NNN-<name>` that holds only a `.keep` file containing `-`.
- New indexes are "after the largest", going down from the start of the interval. Pages and chapters use separate intervals, so inside a parent the pages come first, then the chapters.
- Names are made from titles by dropping the characters `< > : " \ | ? *`, turning `/` into `%` and `%` into `%%`, and keeping at most 100 characters.
- Reordering (↑ ↓ in the studio) swaps two indexes in two phases through the `t_` temporary prefix.
- Renaming a page updates its marker folder, markdown file name, heading, `[note].json` and the parent's `[note-children].json`. If a page's heading is edited directly in its markdown file, the studio applies that rename the next time it opens the course.
- If `[note-children].json` is missing, it is rebuilt from the children's `[note].json` files.
- The course root markdown is regenerated after every change to the structure. Its table of contents links each chapter's and page's markdown file.

The notes are the source of truth for course content. The database holds the catalog data and points to each course's notes by their path (e.g. `999/998`).

## Starter content

On first run the server imports the categories and tags in `server/Seed/catalog.json`. At every start it imports any course in `server/Seed/courses/*/course.json` that it hasn't imported before (each is remembered in the database's `meta` table as `seed.course.<folder>`), owned by `dan.tincu.work@gmail.com`. So a course added to `Seed/courses` reaches an existing installation on its next deployment, while a starter course its creator deleted doesn't come back.

- **Learn React: From Components to Complete Apps**: 5 chapters (plus a sub-chapter), 18 pages, sample `.jsx`/`.js` files.
- **Learn Rust: Safe, Fast and Fearless**: 9 chapters, 22 pages, sample `.rs` programs (all compile with `rustc --edition 2024`).
- **UX Design: From Research to Accessible Color Palettes**: 6 chapters (plus 2 sub-chapters), 26 pages. Its color chapter derives a web app palette mathematically (sRGB, HSL, OKLab/OKLCH, WCAG contrast). The sample files are `color.js`, `scale.js`, `build-palette.js` (which generates `palette.css` and checks its contrast), `palette-demo.html` and `ux-math.js`.
- **Linux Fundamentals: From the Shell to System Administration**: 7 chapters, 22 pages. Bash scripts (`hello.sh`, `disk-report.sh`, `log-report.sh` with a sample `access.log`, and the project's `backup.sh`), plus a systemd service and timer and a crontab example.
- **Advanced Linux: Security and Hardening**: 7 chapters, 17 pages. Commented configuration files (sshd drop-in, fail2ban jail, sudoers, nftables, a sandboxed systemd unit, auditd rules, sysctl, an AppArmor profile) and `audit-host.sh`, a read-only host audit.
- **Internet Security Essentials: Protecting Users and Web Applications**: 6 chapters, 18 pages. Node.js demos (no dependencies): SQL injection with `node:sqlite`, XSS and CSP, scrypt and Argon2id, a server with security headers, CSRF tokens and rate limiting (`--selftest`), password entropy, a TLS checker, and an nginx configuration.
- **Applied Cryptography: The Math and Practice of Internet Security**: 7 chapters, 18 pages, heavy on formulas. Node.js: modular arithmetic and Miller-Rabin, toy RSA, Diffie-Hellman, a 19-point elliptic curve with ECDSA nonce-reuse key recovery, AEAD and nonce reuse, birthday collisions, and a forward-secret secure channel (Ed25519 + X25519 + HKDF + AES-GCM).
- **Windows Security: Hardening, Monitoring and Auditing Windows**: 6 chapters, 14 pages. PowerShell 5.1+ scripts: `Get-SecurityPosture.ps1`, `Find-WeakPermissions.ps1` and `Get-LogonActivity.ps1` (read-only), `Set-FirewallBaseline.ps1` and `Enable-AsrRules.ps1` (support `-WhatIf`), and a Sysmon configuration.

- **Nutrition Fundamentals: Eating Well, Backed by Evidence**: 6 chapters, 15 pages, with formulas (Atwater factors, Mifflin-St Jeor, BMI, glycemic load, the dynamic weight-change rule). Node.js: `nutrition-calc.js` (personal targets), `weight-change.js`, `label-check.js` (EU nutrition declarations) and `meal-plan.js` with `foods.json` and `day-plan.json`.
- **Healthy Cooking on a Budget in Bucharest**: 5 chapters, 16 pages: markets and supermarkets, the Romanian seasons, unit prices, the pantry, batch cooking, legumes, and 13 Romanian recipes with their cost and nutrients per portion. Node.js: `recipe-cost.js` (recipes, a costed week, its shopping list), `unit-price.js`, with `pantry-bucharest.json` (approximate autumn 2026 prices in lei and nutrients, meant to be updated from receipts), `recipes.json` and `week-menu.json`.
- **Biology Essentials: From Molecules to Ecosystems**: 7 chapters, 15 pages, ending with a project on the sickle-cell mutation. Node.js: `dna.js` (transcription, translation, mutations, ORFs), `genetics.js` (crosses, Hardy-Weinberg, selection, Wright-Fisher drift), `enzymes.js` (Michaelis-Menten) and `population.js` (logistic growth, Lotka-Volterra, diversity indices).
- **Chemistry Fundamentals: Atoms, Bonds and Reactions**: 7 chapters, 16 pages. Node.js: `chem.js` (molar masses, composition, empirical formulas, configurations) with `elements.js`, `balance.js` (exact balancing by linear algebra, limiting reagent, yield), `ph.js` (weak acids, buffers, titration curves) and `physchem.js` (gas law, Arrhenius, half-lives, equilibrium ICE tables, cells and the Nernst equation).
- **Classical Mechanics: Motion, Forces and Energy**: 7 chapters, 11 pages. Node.js: `motion.js` (projectiles with air drag, exact pendulum periods, damped springs, the rocket equation, and Euler vs Verlet vs RK4 on an orbit), `collide.js` and `gravity.js` (Kepler, orbits, Hohmann transfers).
- **Electricity and Magnetism: From Charges to Circuits**: 7 chapters, 12 pages. Node.js: `circuit.js`, a modified-nodal-analysis circuit simulator for DC, AC and frequency sweeps, with six netlists, and `em.js` (fields, capacitors, RC and RL transients, induction, waves).
- **Quantum Physics: From Photons to Qubits**: 6 chapters, 13 pages. Node.js: `quantum.js` (blackbody, photoelectric effect, hydrogen, de Broglie, tunneling), `schrodinger.js` (a finite-difference Schrödinger solver for wells, oscillators and double wells) and `qubits.js` (a state-vector simulator, the CHSH test and Grover search; the project runs Deutsch's algorithm and teleportation).
- **Linguistics: The Syllables of the World's Languages**: 6 chapters, 13 pages: phonetics, syllable structure, tone and morae, the meanings of basic syllables across languages, mama/papa, sound symbolism, Indo-European and Semitic roots, and syllabic writing. Node.js: `syllables.js` with `syllables.json` (over 150 meanings in 28 languages), `syllabify.js` (syllables by each language's onset rules, and Japanese morae) and `scripts.js` (Hangul blocks, pinyin tones, kana).

The scripts were run while writing the courses: the Node.js and PowerShell samples on Windows, and the bash scripts in Git Bash, apart from `audit-host.sh`, which needs a real Linux host and was only syntax-checked. The Linux configuration files (sshd, nftables, AppArmor, auditd, systemd) couldn't be validated by their own tools (`sshd -t`, `nft -c`…) on this Windows machine. Check them on a test system before relying on them.

If the course notes already exist on disk (for example after the database was deleted), the import skips them rather than duplicating them.
