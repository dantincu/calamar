// collide.js: one-dimensional collisions, with any coefficient of restitution.
//
//   node collide.js 1 2 1 0           m1 (kg), v1 (m/s), m2, v2: elastic (e = 1)
//   node collide.js 1 2 1 0 0         perfectly inelastic: the bodies stick together (e = 0)
//   node collide.js 0.17 3 0.17 0 0.9 two billiard balls, e = 0.9
//   node collide.js 1000 20 1500 -10 0.1    two cars, head on
//
// Momentum is always conserved; e = (separation speed) / (approach speed) decides how much kinetic energy is lost.

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const [m1, v1, m2, v2, eArg] = process.argv.slice(2).map(Number);
if ([m1, v1, m2, v2].some((x) => !Number.isFinite(x))) {
  console.log('usage: node collide.js m1 v1 m2 v2 [e]');
  process.exit(0);
}
const e = Number.isFinite(eArg) ? eArg : 1;
const M = m1 + m2;
const u1 = (m1 * v1 + m2 * v2 + m2 * e * (v2 - v1)) / M;
const u2 = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) / M;
const p = (a, b) => m1 * a + m2 * b;
const K = (a, b) => 0.5 * m1 * a * a + 0.5 * m2 * b * b;

console.log(`coefficient of restitution e = ${e}${e === 1 ? ' (elastic)' : e === 0 ? ' (perfectly inelastic)' : ''}\n`);
console.log('           v1 (m/s)   v2 (m/s)   momentum (kg m/s)   kinetic energy (J)');
console.log(`before    ${v1.toFixed(3).padStart(8)}   ${v2.toFixed(3).padStart(8)}   ${p(v1, v2).toFixed(3).padStart(14)}   ${K(v1, v2).toFixed(3).padStart(16)}`);
console.log(`after     ${u1.toFixed(3).padStart(8)}   ${u2.toFixed(3).padStart(8)}   ${p(u1, u2).toFixed(3).padStart(14)}   ${K(u1, u2).toFixed(3).padStart(16)}`);
let lost = K(v1, v2) - K(u1, u2);
if (Math.abs(lost) < 1e-9 * K(v1, v2)) lost = 0;   // rounding noise in an elastic collision
console.log(`\nkinetic energy lost: ${lost.toFixed(3)} J (${(100 * lost / K(v1, v2)).toFixed(1)} %), turned into heat, sound and deformation`);
const vcm = p(v1, v2) / M;
console.log(`center of mass velocity: ${vcm.toFixed(3)} m/s, unchanged by the collision`);
const dv1 = Math.abs(u1 - v1);
console.log(`velocity change of body 1: ${dv1.toFixed(3)} m/s; of body 2: ${Math.abs(u2 - v2).toFixed(3)} m/s`);
