// quantum.js: the formulas of early quantum physics, with real constants.
//
//   node quantum.js blackbody 5772             temperature (K): Wien peak and the Planck spectrum
//   node quantum.js photoelectric 400 2.28     wavelength (nm), work function (eV): electron energy (sodium: 2.28 eV)
//   node quantum.js photon 550                 wavelength (nm): frequency, energy, momentum
//   node quantum.js hydrogen                   hydrogen energy levels and the Balmer lines
//   node quantum.js debroglie electron 100     particle (electron/proton/neutron), accelerating voltage: wavelength
//   node quantum.js debroglie 0.145 40         or mass (kg), speed (m/s): a baseball
//   node quantum.js box 1                      width (nm): an electron's energy levels in an infinite well
//   node quantum.js tunnel 1 2 0.5             electron energy, barrier height (eV), barrier width (nm): transmission
//   node quantum.js uncertainty 0.1            position uncertainty (nm): minimum momentum and speed spread of an electron

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const h = 6.62607015e-34, hbar = h / (2 * Math.PI);
const c = 299792458, e = 1.602176634e-19, kB = 1.380649e-23;
const me = 9.1093837e-31, mp = 1.67262192e-27, mn = 1.67492750e-27;
const HC_EV_NM = (h * c) / e * 1e9;          // 1239.84 eV nm
const HBAR2_2M = (hbar * hbar) / (2 * me) / e * 1e18;   // 0.0381 eV nm^2, for an electron

const [cmd, ...a] = process.argv.slice(2);
const n = a.map(Number);

if (cmd === 'blackbody') {
  const T = n[0];
  const peak = 2.897771955e-3 / T;
  console.log(`Wien's law: peak wavelength = b / T = 2.898e-3 / ${T} = ${(peak * 1e9).toFixed(0)} nm`);
  console.log(`Stefan-Boltzmann: power radiated per m² = sigma T^4 = ${(5.670374e-8 * T ** 4).toExponential(3)} W/m²\n`);
  // Planck's law: spectral radiance B(lambda, T)
  const B = (l) => (2 * h * c * c) / l ** 5 / (Math.exp((h * c) / (l * kB * T)) - 1);
  const max = B(peak);
  console.log('wavelength   relative intensity');
  for (const f of [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 5]) {
    const l = peak * f;
    console.log(`${(l * 1e9).toFixed(0).padStart(8)} nm   ${(B(l) / max).toFixed(3)}  ${'#'.repeat(Math.round((40 * B(l)) / max))}`);
  }
} else if (cmd === 'photoelectric') {
  const [lnm, W] = n;
  const E = HC_EV_NM / lnm;
  console.log(`photon energy hc/lambda = 1239.8 / ${lnm} = ${E.toFixed(3)} eV; work function ${W} eV`);
  if (E <= W) console.log(`no electrons: the photon energy is below the work function (threshold wavelength ${(HC_EV_NM / W).toFixed(0)} nm), however bright the light`);
  else {
    const K = E - W;
    console.log(`maximum electron kinetic energy = hf - W = ${K.toFixed(3)} eV; stopping voltage ${K.toFixed(3)} V; electron speed ${(Math.sqrt((2 * K * e) / me) / 1000).toFixed(0)} km/s`);
  }
} else if (cmd === 'photon') {
  const l = n[0] * 1e-9;
  console.log(`f = c / lambda = ${(c / l).toExponential(4)} Hz; E = hf = ${((h * c) / l).toExponential(4)} J = ${(HC_EV_NM / n[0]).toFixed(3)} eV; p = h / lambda = ${(h / l).toExponential(4)} kg m/s`);
} else if (cmd === 'hydrogen') {
  console.log('level   energy (eV)');
  for (let k = 1; k <= 6; k++) console.log(`n = ${k}   ${(-13.6057 / (k * k)).toFixed(3).padStart(9)}`);
  console.log('\nBalmer lines (down to n = 2), from 1/lambda = R (1/2² - 1/n²):');
  const R = 1.0967758e7;   // Rydberg constant for hydrogen, per m (with the reduced-mass correction)
  const names = { 3: 'H-alpha (red)', 4: 'H-beta (blue-green)', 5: 'H-gamma (violet)', 6: 'H-delta (violet)', 7: '(near ultraviolet)' };
  for (let k = 3; k <= 7; k++) {
    const l = 1 / (R * (1 / 4 - 1 / (k * k)));
    console.log(`  n = ${k} -> 2   ${(l * 1e9).toFixed(1)} nm (in vacuum)   ${names[k]}`);
  }
  console.log(`series limit: ${(4 / R * 1e9).toFixed(1)} nm; ionization energy from n = 1: 13.606 eV`);
} else if (cmd === 'debroglie') {
  let lambda, desc;
  if (isNaN(n[0])) {
    const m = { electron: me, proton: mp, neutron: mn }[a[0]];
    if (!m) throw new Error('particle must be electron, proton or neutron');
    const V = n[1];
    const p = Math.sqrt(2 * m * e * V);   // non-relativistic: fine below about 10 kV for electrons
    lambda = h / p;
    desc = `${a[0]} accelerated through ${V} V: speed ${(p / m / 1000).toFixed(0)} km/s`;
  } else {
    lambda = h / (n[0] * n[1]);
    desc = `mass ${n[0]} kg at ${n[1]} m/s`;
  }
  console.log(`${desc}\nde Broglie wavelength lambda = h / p = ${lambda.toExponential(3)} m${lambda > 1e-15 ? ` = ${(lambda * 1e9).toPrecision(4)} nm` : ''}`);
} else if (cmd === 'box') {
  const L = n[0];
  const E1 = (HBAR2_2M * Math.PI ** 2) / (L * L);
  console.log(`electron in an infinite well of width ${L} nm: E_n = n² pi² hbar² / (2 m L²) = n² x ${E1.toFixed(4)} eV\n`);
  for (let k = 1; k <= 5; k++) console.log(`  n = ${k}: ${(k * k * E1).toFixed(3)} eV`);
  const dE = 3 * E1;
  console.log(`\nphoton for the jump 2 -> 1: ${dE.toFixed(3)} eV, wavelength ${(HC_EV_NM / dE).toFixed(0)} nm`);
} else if (cmd === 'tunnel') {
  const [E, V0, w] = n;
  let T;
  if (E < V0) {
    const kappa = Math.sqrt((V0 - E) / HBAR2_2M);   // per nm
    T = 1 / (1 + (V0 * V0 * Math.sinh(kappa * w) ** 2) / (4 * E * (V0 - E)));
    console.log(`decay constant kappa = sqrt(2m(V0 - E)) / hbar = ${kappa.toFixed(3)} per nm (the wave falls by 1/e every ${(1 / kappa).toFixed(3)} nm)`);
    console.log(`exact transmission T = ${T.toExponential(3)}; rough estimate e^(-2 kappa a) = ${Math.exp(-2 * kappa * w).toExponential(3)}`);
  } else {
    const k2 = Math.sqrt((E - V0) / HBAR2_2M);
    T = 1 / (1 + (V0 * V0 * Math.sin(k2 * w) ** 2) / (4 * E * (E - V0)));
    console.log(`above the barrier: transmission T = ${T.toFixed(4)} (classically it would be 1)`);
  }
  console.log(`\nwidth (nm)   transmission`);
  for (const ww of [0.1, 0.2, 0.5, 1, 2]) {
    if (E >= V0) break;
    const kappa = Math.sqrt((V0 - E) / HBAR2_2M);
    const t = 1 / (1 + (V0 * V0 * Math.sinh(kappa * ww) ** 2) / (4 * E * (V0 - E)));
    console.log(`${ww.toFixed(1).padStart(8)}     ${t.toExponential(3)}`);
  }
} else if (cmd === 'uncertainty') {
  const dx = n[0] * 1e-9;
  const dp = hbar / (2 * dx);
  console.log(`dx = ${n[0]} nm: dp >= hbar / (2 dx) = ${dp.toExponential(3)} kg m/s; for an electron, dv >= ${(dp / me / 1000).toFixed(0)} km/s`);
  console.log(`kinetic energy of that momentum spread: ${((dp * dp) / (2 * me) / e).toFixed(3)} eV`);
} else {
  console.log('usage: node quantum.js blackbody|photoelectric|photon|hydrogen|debroglie|box|tunnel|uncertainty ... (see the top of the file)');
}
