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

On first run the server imports (once) the categories and tags in `server/Seed/catalog.json`, and the courses in `server/Seed/courses/*/course.json`, owned by `dan.tincu.work@gmail.com`:

- **Learn React: From Components to Complete Apps**: 5 chapters (plus a sub-chapter), 18 pages, sample `.jsx`/`.js` files.
- **Learn Rust: Safe, Fast and Fearless**: 9 chapters, 22 pages, sample `.rs` programs (all compile with `rustc --edition 2024`).

If the course notes already exist on disk (for example after the database was deleted), the import skips them rather than duplicating them.
