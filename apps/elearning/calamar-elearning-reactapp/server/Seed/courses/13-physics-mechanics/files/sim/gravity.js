// gravity.js: Newton's gravitation, Kepler's laws, orbits and escape speeds.
//
//   node gravity.js kepler                  Kepler's third law checked on the planets
//   node gravity.js bodies                  surface gravity and escape speed of the Sun, planets and Moon
//   node gravity.js orbit 400               a circular orbit around the Earth at 400 km altitude
//   node gravity.js geo                     the geostationary orbit
//   node gravity.js hohmann 400 35786       transfer between two circular Earth orbits (altitudes in km)

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const G = 6.674e-11;
// mass (kg), radius (m)
const BODIES = {
  Sun: [1.989e30, 6.957e8], Mercury: [3.301e23, 2.440e6], Venus: [4.867e24, 6.052e6], Earth: [5.972e24, 6.371e6],
  Moon: [7.342e22, 1.737e6], Mars: [6.417e23, 3.390e6], Jupiter: [1.898e27, 6.9911e7], Saturn: [5.683e26, 5.8232e7],
};
// semi-major axis (AU), orbital period (years)
const PLANETS = {
  Mercury: [0.387, 0.241], Venus: [0.723, 0.615], Earth: [1.0, 1.0], Mars: [1.524, 1.881],
  Jupiter: [5.203, 11.86], Saturn: [9.537, 29.46], Uranus: [19.19, 84.01], Neptune: [30.07, 164.8],
};
const [ME, RE] = BODIES.Earth;
const MU = G * ME;   // GM of the Earth, m^3/s^2

const [cmd, ...args] = process.argv.slice(2);
const n = args.map(Number);

function circular(r) {
  const v = Math.sqrt(MU / r);
  return { v, T: (2 * Math.PI * r) / v };
}

if (cmd === 'kepler') {
  console.log('planet     a (AU)   T (years)   T^2 / a^3');
  for (const [name, [a, T]] of Object.entries(PLANETS)) {
    console.log(`${name.padEnd(9)} ${a.toFixed(3).padStart(7)}  ${T.toFixed(3).padStart(9)}   ${(T * T / a ** 3).toFixed(4).padStart(8)}`);
  }
} else if (cmd === 'bodies') {
  console.log('body       surface g (m/s²)   escape speed (km/s)');
  for (const [name, [M, R]] of Object.entries(BODIES)) {
    console.log(`${name.padEnd(9)} ${(G * M / R ** 2).toFixed(2).padStart(12)}   ${(Math.sqrt(2 * G * M / R) / 1000).toFixed(2).padStart(15)}`);
  }
} else if (cmd === 'orbit') {
  const h = n[0] * 1000, r = RE + h;
  const { v, T } = circular(r);
  console.log(`altitude ${n[0]} km, radius ${(r / 1000).toFixed(0)} km`);
  console.log(`speed v = sqrt(GM/r) = ${(v / 1000).toFixed(3)} km/s`);
  console.log(`period T = 2 pi r / v = ${(T / 60).toFixed(1)} min`);
  console.log(`gravity there: ${(MU / r ** 2).toFixed(2)} m/s² (${(100 * (RE / r) ** 2).toFixed(0)} % of the surface value)`);
  console.log(`escape speed from there: ${(Math.sqrt(2) * v / 1000).toFixed(3)} km/s (sqrt 2 times the orbital speed)`);
} else if (cmd === 'geo') {
  const T = 86164.1;   // one sidereal day, s
  const r = Math.cbrt((MU * T * T) / (4 * Math.PI ** 2));
  console.log(`period: one sidereal day = ${T} s`);
  console.log(`radius r = (GM T^2 / 4 pi^2)^(1/3) = ${(r / 1000).toFixed(0)} km, altitude ${((r - RE) / 1000).toFixed(0)} km`);
  console.log(`speed ${(circular(r).v / 1000).toFixed(3)} km/s`);
} else if (cmd === 'hohmann') {
  const r1 = RE + n[0] * 1000, r2 = RE + n[1] * 1000;
  const a = (r1 + r2) / 2;
  const v1 = Math.sqrt(MU / r1), v2 = Math.sqrt(MU / r2);
  const vp = Math.sqrt(MU * (2 / r1 - 1 / a)), va = Math.sqrt(MU * (2 / r2 - 1 / a));   // vis-viva
  console.log(`from a circular orbit at ${n[0]} km to one at ${n[1]} km, through an ellipse with a = ${(a / 1000).toFixed(0)} km\n`);
  console.log(`burn 1 at ${n[0]} km: ${(v1 / 1000).toFixed(3)} -> ${(vp / 1000).toFixed(3)} km/s, delta-v ${((vp - v1) / 1000).toFixed(3)} km/s`);
  console.log(`coast for half an ellipse: ${(Math.PI * Math.sqrt(a ** 3 / MU) / 3600).toFixed(2)} h`);
  console.log(`burn 2 at ${n[1]} km: ${(va / 1000).toFixed(3)} -> ${(v2 / 1000).toFixed(3)} km/s, delta-v ${((v2 - va) / 1000).toFixed(3)} km/s`);
  console.log(`total delta-v: ${((vp - v1 + v2 - va) / 1000).toFixed(3)} km/s`);
} else {
  console.log('usage: node gravity.js kepler|bodies|orbit|geo|hohmann ... (see the top of the file)');
}
