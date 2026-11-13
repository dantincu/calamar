# Calamar Multiverse

Explorable 3D worlds ("multiverse engines") seen from a small first-person drone that can hover, creep at a snail's pace or fly at up to the speed of light.

React 19 + TypeScript + Vite, rendering with three.js. No server: everything is generated in the browser, from code plus one static world-map file.

```
npm install
npm run dev      # http://localhost:5174
npm run build    # type-check + production bundle in dist/
```

## Deploying on HTTPS

The production bundle is a static site: `npm run build` writes everything to `dist/` (`index.html`, `favicon.svg` and the
hashed files in `assets/`). No Node.js or other runtime is needed on the server; any web server that can serve files over
HTTPS will do, as long as it does three things:

1. **Falls back to `index.html`** for any path that isn't a file. The app uses real URLs (`/engines/bucharest-ilfov`), so
   reloading or opening such a link must return `index.html`, not a 404.
2. **Caches correctly**: files in `/assets/` have a content hash in their names and can be cached forever
   (`Cache-Control: public, max-age=31536000, immutable`); `index.html` must not be (`Cache-Control: no-cache`), so a new
   deployment is picked up on the next visit.
3. **Compresses** JavaScript and CSS (gzip or Brotli): the main bundle is about 860 kB, 235 kB gzipped.

The app expects to live at the root of its domain (`https://multiverse.example.com/`). To serve it from a sub-path
(`https://example.com/multiverse/`), set `base: '/multiverse/'` in `vite.config.ts` and `basename="/multiverse"` on the
`BrowserRouter` in `src/App.tsx`, then rebuild.

To deploy, build, then copy the **contents** of `dist/` to the server's web root, replacing what was there (old hashed
files can be deleted; `index.html` only references the new ones):

```
npm ci
npm run build
# e.g. to a Linux server:
rsync -av --delete dist/ user@server:/var/www/calamar-multiverse/
```

### Option A: Caddy (simplest; certificates are automatic)

[Caddy](https://caddyserver.com/) gets and renews a Let's Encrypt certificate by itself and redirects HTTP to HTTPS.
The domain's DNS must point at the server, and ports 80 and 443 must be open. `/etc/caddy/Caddyfile`:

```
multiverse.example.com {
	root * /var/www/calamar-multiverse
	encode zstd gzip

	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"
	@pages not path /assets/*
	header @pages Cache-Control "no-cache"

	try_files {path} /index.html
	file_server
}
```

Then `sudo systemctl reload caddy`.

**HTTPS on your own machine:** replace the first line with `localhost:8443 {` and point `root` at the `dist` folder
(`root * C:/A/T/calamar/apps/multiverse/calamar-multiverse/dist`), then run `caddy run` in the Caddyfile's folder and open
<https://localhost:8443>. Caddy uses its own local certificate authority. Run `caddy trust` once to add it to the system's
trusted roots, so the browser doesn't warn.

### Option B: nginx + Let's Encrypt (certbot)

`/etc/nginx/sites-available/calamar-multiverse`:

```nginx
server {
    listen 80;
    server_name multiverse.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;   # on nginx 1.25.1+ you can write "listen 443 ssl;" plus "http2 on;"
    server_name multiverse.example.com;

    ssl_certificate     /etc/letsencrypt/live/multiverse.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/multiverse.example.com/privkey.pem;

    root  /var/www/calamar-multiverse;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ /index.html;
    }
}
```

Get the certificate **before** enabling the site, since nginx won't start with a certificate file that doesn't exist yet.
certbot answers Let's Encrypt's check through nginx's default site on port 80 and also sets up automatic renewal:

```
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot certonly --nginx -d multiverse.example.com
sudo ln -s /etc/nginx/sites-available/calamar-multiverse /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option C: IIS on Windows

1. Install the [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) module.
2. Create a site whose physical path holds the contents of `dist/`, with an **https** binding on port 443 and a
   certificate. For a public domain, [win-acme](https://www.win-acme.com/) gets a Let's Encrypt certificate, adds the binding
   and renews it automatically.
3. Put this `web.config` next to `index.html` (copy it in after every build, or keep it in `public/` so Vite copies it
   into `dist/`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="HTTP to HTTPS" stopProcessing="true">
          <match url="(.*)" />
          <conditions><add input="{HTTPS}" pattern="off" /></conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
        </rule>
        <rule name="SPA fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
    </staticContent>
    <urlCompression doStaticCompression="true" />
  </system.webServer>
  <location path="index.html">
    <system.webServer>
      <staticContent><clientCache cacheControlMode="DisableCache" /></staticContent>
    </system.webServer>
  </location>
</configuration>
```

The one-year cache applies to every file; `index.html` is exempted. `favicon.svg` is the only other file without a hash,
so a changed favicon may take a while to show up.

### Option D: a static hosting service

Netlify, Cloudflare Pages, Vercel and similar give you HTTPS automatically. Use `npm run build` as the build command and
`dist` as the output folder, and add the fallback to `index.html`. For example, a `public/_redirects` file containing
`/*  /index.html  200` works on Netlify and Cloudflare Pages. GitHub Pages has no such fallback (deep links would 404) and
serves from a sub-path unless you use a custom domain, so it is a poor fit.

### Checking a deployment

- Open `https://<host>/engines/bucharest-ilfov` directly and reload it: you should get the engine, not a 404.
- In the browser's developer tools (Network tab), files under `/assets/` should show `cache-control: …immutable` and a
  `content-encoding` of `gzip`, `br` or `zstd`; `index.html` should show `no-cache`.
- Settings and the remembered drone positions are stored per origin (scheme + host + port). Moving the site to a new
  address, or from `http://` to `https://`, starts with defaults.

## Deploying to this machine (Windows, HTTPS on localhost)

This puts the app next to the other Calamar apps and serves it at **<https://localhost:5191>**. Opening
<http://localhost:5190> redirects there. The web server is [Caddy](https://caddyserver.com/), a single executable.
The certificate is the ASP.NET Core development certificate (`CN=localhost`) that this machine already trusts, the same
one the e-learning app uses, so the browser shows no warning and no new certificate authority needs to be trusted.

| What | Where |
|---|---|
| Deployment folder | `%LOCALAPPDATA%\Calamar\Apps\Bin\calamar-multiverse\` |
| The built app | `…\calamar-multiverse\site\` (the contents of `dist/`) |
| Certificate and key | `…\calamar-multiverse\certs\localhost.pem`, `localhost.key` |
| Server configuration | `…\calamar-multiverse\Caddyfile` |
| Ports | 5191 (HTTPS), 5190 (redirect only). The e-learning app uses 5180/5181. |

All commands are PowerShell, run from the project folder.

### One-time setup

**1. Install Caddy**, then open a new terminal so `caddy` is on the `PATH`:

```powershell
winget install --id CaddyServer.Caddy --exact
caddy version
```

**2. Check the development certificate** is there and trusted. If it isn't, the second command creates and trusts it
(Windows asks for confirmation):

```powershell
dotnet dev-certs https --check --trust
dotnet dev-certs https --trust     # only if the check found no trusted certificate
```

**3. Create the deployment folder and export the certificate** as PEM files that Caddy can read:

```powershell
$Target = "$env:LOCALAPPDATA\Calamar\Apps\Bin\calamar-multiverse"
New-Item -ItemType Directory -Force "$Target\site", "$Target\certs" | Out-Null
dotnet dev-certs https --export-path "$Target\certs\localhost.pem" --format Pem --no-password
```

This writes `localhost.pem` and `localhost.key`. The key isn't password-protected, so it is protected only by your
user profile's permissions. It only works for `localhost`, so it is useless for impersonating any real site. The
certificate expires after a year (the current one on 2027-09-01). After `dotnet dev-certs https --clean` / `--trust`
creates a new one, run the export again and restart Caddy.

**4. Write the Caddyfile.** `{$LOCALAPPDATA}` is filled in by Caddy from the environment, so the file has no
user-specific paths:

```powershell
@'
{
	# no automatic redirect on port 80; the block at the end redirects 5190 instead
	auto_https disable_redirects
}

https://localhost:5191 {
	tls {$LOCALAPPDATA}/Calamar/Apps/Bin/calamar-multiverse/certs/localhost.pem {$LOCALAPPDATA}/Calamar/Apps/Bin/calamar-multiverse/certs/localhost.key
	root * {$LOCALAPPDATA}/Calamar/Apps/Bin/calamar-multiverse/site
	encode zstd gzip

	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"
	@pages not path /assets/*
	header @pages Cache-Control "no-cache"

	try_files {path} /index.html
	file_server
}

http://localhost:5190 {
	redir https://localhost:5191{uri} permanent
}
'@ | Set-Content -Encoding ascii "$Target\Caddyfile"   # ASCII: Windows PowerShell's utf8 would add a byte-order mark

caddy fmt --overwrite "$Target\Caddyfile"      # converts the CRLF line endings to LF, or Caddy warns "not formatted"
caddy validate --config "$Target\Caddyfile"    # should end with "Valid configuration"
```

If Caddy isn't found right after installing it with winget, open a new terminal so it picks up the updated `PATH`.

What each part of the Caddyfile does:

- **Global block `{ … }`**: by default Caddy also listens on port 80 to redirect to HTTPS. `disable_redirects`
  turns that off, so Caddy uses only the two ports below.
- **`https://localhost:5191`**: the site itself.
  - `tls <cert> <key>` uses the exported .NET development certificate. Because a certificate is given, Caddy
    doesn't try to issue its own.
  - `root` points at the `site` folder that `robocopy` mirrors `dist` into.
  - `encode` compresses responses.
  - The two `header` lines set caching. Files in `/assets` have hashed names, so browsers can keep them for a year.
    Everything else, which is mainly `index.html`, is checked again on every visit, so a new deploy shows up
    immediately.
  - `try_files {path} /index.html` serves `index.html` for any path that isn't a real file. This is the fallback
    a single-page app needs, so reloading a page like `/engines/bucharest-ilfov` doesn't return a 404.
- **`http://localhost:5190`**: sends plain-HTTP visits to the HTTPS address, keeping the same path.

> **If `caddy validate` rejects the paths:** Caddy replaces `{$LOCALAPPDATA}` with a Windows path such as
> `C:\Users\<you>\AppData\Local`, so each path mixes backslashes with forward slashes. If Caddy doesn't accept that,
> write the three paths out in full with forward slashes instead:
>
> ```caddyfile
> tls C:/Users/<you>/AppData/Local/Calamar/Apps/Bin/calamar-multiverse/certs/localhost.pem C:/Users/<you>/AppData/Local/Calamar/Apps/Bin/calamar-multiverse/certs/localhost.key
> root * C:/Users/<you>/AppData/Local/Calamar/Apps/Bin/calamar-multiverse/site
> ```

### Build and deploy (also how to update)

```powershell
$Target = "$env:LOCALAPPDATA\Calamar\Apps\Bin\calamar-multiverse"
npm ci
npm run build
robocopy dist "$Target\site" /MIR /NJH /NJS /NDL   # mirror: copies new files, deletes old ones
```

`robocopy` reports success with exit codes 0–7, so a non-zero code there isn't an error. Updating is just these three
lines: Caddy serves files straight from `site\`, so it doesn't need restarting.

### Start and stop the server

```powershell
caddy start --config "$env:LOCALAPPDATA\Calamar\Apps\Bin\calamar-multiverse\Caddyfile"   # in the background
caddy stop
caddy reload --config "$env:LOCALAPPDATA\Calamar\Apps\Bin\calamar-multiverse\Caddyfile"  # after editing the Caddyfile
```

Use `caddy run --config …` instead of `start` to keep it in the foreground with its log in the terminal (Ctrl+C stops it).
Windows may ask once whether Caddy may use the network; allowing **private** networks is enough. The site is only
reachable as `localhost` anyway, since the certificate isn't valid for any other name.

### Start it automatically when you log in (optional)

```powershell
$caddy  = (Get-Command caddy).Source
$config = "$env:LOCALAPPDATA\Calamar\Apps\Bin\calamar-multiverse\Caddyfile"
Register-ScheduledTask -TaskName 'Calamar Multiverse (Caddy)' `
    -Action (New-ScheduledTaskAction -Execute $caddy -Argument "start --config `"$config`"") `
    -Trigger (New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME) `
    -Settings (New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries)
```

A console window may flash briefly at logon while `caddy start` launches the server in the background. To undo:
`Unregister-ScheduledTask -TaskName 'Calamar Multiverse (Caddy)' -Confirm:$false`.

### Check it

- <https://localhost:5191> opens the app with a padlock and no warning (Chrome and Edge use the Windows certificate
  store. Firefox does too, as long as `security.enterprise_roots.enabled` is `true` in `about:config`).
- <https://localhost:5191/engines/bucharest-ilfov> survives a reload (the fallback to `index.html` works).
- <http://localhost:5190> redirects to HTTPS.
- Settings and saved drone positions are separate from the development server's (`http://localhost:5174` is another
  origin), so the deployed app starts with defaults.

**If something fails:** "address already in use" means another program holds 5190/5191 (or 2019, Caddy's local admin
port). Find it with `Get-NetTCPConnection -LocalPort 5191 -State Listen`, or change the ports in the Caddyfile. A
certificate warning usually means the export is older than the current development certificate: export it again.

## Layout

- **Top bar** (hidden in full screen; Escape exits): home, engine picker, settings.
- **Settings** (saved in `localStorage`): time of day, traffic, labels, quality, field of view, mouse sensitivity / invert Y, HUD, units.
- **Engine page** `/engines/:id`: click to take the mouse, then fly.

## Drone controls

| Input | Action |
|---|---|
| Mouse | look |
| W A S D / arrows | fly where you look / strafe |
| Space, E / C, Q | rise / sink |
| Wheel, + / − | cruise speed ×1.25 per notch, from 1 mm/s to the speed of light |
| Speed box (HUD) | type a cruise speed in any unit (mm/s, m/s, km/h, mph, Mach, c); ÷10 / ×10 change it by an order of magnitude |
| 1 … 0 | presets: snail, ant, walk, city car, highway, airliner, Mach 1, Mach 5, Mach 100, Mach 1000 |
| Shift / Alt | boost ×5 / creep ×0.2 (never past light speed) |
| X | stop; with no keys pressed the drone brakes and hovers |
| P / L | pin this place / the list of saved places |
| V | next viewpoint · R back to start · F full screen · H help |

The viewpoints include three on the globe: low orbit over the Black Sea, the Alps from 120 km, and the whole Earth from 25,000 km.

Keys pressed with Ctrl or ⌘ are left to the browser. For example, Ctrl+R reloads the page and you carry on from where you were; it doesn't also send you back to the start.

**Speed box:** release the mouse (Esc), then click the box. Its unit follows the speed ("auto") until you pick one. Enter applies the value and Escape cancels it.

**Saved places (pins):**
- P drops a pin where the drone is, facing the way it looks. It's named after the place, which you can change.
- The pin button (or L) opens the list, where you can rename a pin, fly to it with Go, or remove it.
- Pins show as markers in the world, even when labels are off, and are hidden behind the Earth's horizon. Click a marker to go there.
- Pins are saved per engine, in this browser's `localStorage`.

## The whole world (coarse)

Around the detailed scene, the whole Earth is there at a coarse level of detail, so the fast speeds have somewhere to go. Mach 1000 crosses Romania in about two seconds and circles the planet in about two minutes. Light speed circles it in about 0.13 s and reaches the Moon's distance in 1.3 s, where there's no Moon yet, only the receding Earth.

- **A real-sized globe** (radius 6,371 km). It touches the flat local scene at the south end of Magheru (44.44°N, 26.0975°E). The drone flies over the curve: "up" always points away from the Earth's centre, and level flight follows a great circle, including over the poles. Away from the detailed scene, the floor is the Earth's surface.
- **The map** is painted in the browser when the engine starts:
  - land, countries, borders and coastlines from Natural Earth;
  - climate colours: deserts, rainforests, steppe, tundra and ice sheets;
  - about 60 major mountain ranges with snow on the high ones;
  - the big lakes and sea ice.
  
  The painted texture is 2048, 4096 or 8192 px wide for the low, medium and high Quality settings, which is 20, 10 or 5 km per pixel. Changing the quality takes effect the next time you open the engine.
- **The sun follows the drone.** Wherever you are, the sun stands where it would on that place's summer solstice, at the time of day in Settings:
  - the solstice is June in the northern hemisphere and December in the southern; within 5° of the equator the two are blended, so crossing it doesn't make the sun jump;
  - the time of day is local solar time + 1 h, so solar noon is about 13:06, as in summer time in most of Europe.
  
  Some consequences:
  - The day/night line on the globe moves with you. From orbit, the place under you always has the chosen time, and the lit half of the Earth turns as you fly.
  - Beyond the polar circles, the summer sun never sets, so "night" there is a low midnight sun.
  - Bucharest's lit windows follow the sun over Bucharest. If you fly away at night towards where the sun stands higher, the city's windows go dark.
- **Night side:** city and town lights. The sky fades to black and the stars come out as you climb past about 15–90 km.
- **Labels and the HUD:** countries, about 250 cities, and seas and oceans are labelled, shown according to distance and hidden behind the horizon. Away from Bucharest, the HUD names the country or sea below you, with its coordinates.
- **The detailed scene:** the Ilfov fields reach 60 km and curve with the Earth, fading into the globe's map at their edge. The city is hidden when it's behind the horizon.

**Data:** the country shapes are Natural Earth 1:50m admin-0 (public domain), via the [`world-atlas`](https://github.com/topojson/world-atlas) package. They load as a separate 240 KB (gzipped) file when the engine starts. Everything else is placed by hand, roughly to within a degree: the climate zones, mountain ranges, lakes, sea names and areas of dense lights, in `src/engines/core/earth/data/terrain.ts`, and the cities with approximate metro populations, in `src/engines/core/earth/data/cities.ts`. There is no elevation data: mountains are painted, and the surface is a smooth sphere.

## Code map

- `src/engines/registry.ts`: the list of engines (lazy-loaded modules).
- `src/engines/core/`: engine-independent parts: `EngineViewport` (renderer, loop, HUD with the cruise-speed box, pin markers and the saved-places panel), `DroneController` (flight model, collisions on a spatial grid, flight over a planet's curve), `savedPose.ts` (where you left each engine), `pins.ts` (saved places), `types.ts` (the `EngineModule` / `EngineWorld` / `Planet` contract), `util.ts`.
- `src/engines/core/earth/`: the coarse globe, reusable by any engine set on Earth:
  - `geo.ts`: `EarthFrame`, which ties an engine's flat local frame to a latitude and longitude and converts between them.
  - `paint.ts`: decodes the Natural Earth shapes and paints the day, night and water maps.
  - `Earth.ts`: the globe and atmosphere shaders, map labels, and "what's below me".
  - `data/`: cities and hand-placed terrain.
- `src/engines/bucharest-ilfov/`: the Bucharest & Ilfov engine:
  - `layout.ts`: the map: streets, every Magheru building spec (landmarks plus generated blocks), Bălcescu / Lascăr Catargiu.
  - `facade.ts`: procedural facade textures per architectural style (interwar ribbon windows, punched, Art Deco verticals, 1960s grids, curtain walls, eclectic/classic) plus a night "lit windows" map.
  - `buildings.ts`: massing, setback tiers, rounded corners, cornices, balconies, shop signs, awnings, neon roof signs, blade signs, cinema marquees, rooftop clutter.
  - `street.ts`: carriageway, sidewalks, crossings, lamps, trees, trolleybus wires, traffic lights, STB shelters.
  - `traffic.ts`: cars, buses and trolleybuses that follow each other and stop at red lights; pedestrians.
  - `landmarks.ts`: ASE (portico and dome), InterContinental, National Theatre, Biserica Amzei, Casa Sturdza, the Capitoline Wolf, metro entrances.
  - `city.ts`: the generated city around the boulevard, parks (Grădina Icoanei, Cișmigiu with its lake, Grădina Ioanid), and the Ilfov fields out to 60 km, curving with the Earth.
  - `environment.ts`: sky (turned to the local up anywhere on the globe and fading out in space), stars, the sun's position for Bucharest's latitude, fog, day/night.

## Accuracy notes (Magheru)

The landmarks are real and so are their dates, e.g. Lido 1930, ARO/Patria 1929–31 by Horia Creangă, Scala 1937, Ambasador 1937–39, Ciclop 1923 by Constantin Iotzu, and ITB/Eva/ONT 1959–61. These are modelled from their character, not from surveys. Their order along the street, which side each one is on, the side-street positions and the blocks in between are best approximations. Correct them in `layout.ts` (`magheruBuildings`), where each building is one entry.
