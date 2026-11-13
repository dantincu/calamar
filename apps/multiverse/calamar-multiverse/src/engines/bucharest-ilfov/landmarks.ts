import * as THREE from 'three';
import { canvasTexture, fitText, makeCanvas } from '../core/util';
import { addBuilding, type BuildKit } from './buildings';
import { FRONT_X, ROMANA_HALF, ROMANA_Z, UNIVERSITATE_Z } from './layout';

/** Buildings and objects that need more than a facade: porticoes, domes, towers, statues, metro entrances. */
export function buildLandmarks(kit: BuildKit) {
  const g = kit.group;
  const stone = new THREE.MeshStandardMaterial({ color: '#e2d8c3', roughness: 0.8 });
  const copper = new THREE.MeshStandardMaterial({ color: '#5f8f7c', roughness: 0.6, metalness: 0.3 });
  const bronze = new THREE.MeshStandardMaterial({ color: '#6b4f2a', roughness: 0.45, metalness: 0.75 });
  const brick = new THREE.MeshStandardMaterial({ color: '#9c4a33', roughness: 0.9 });
  const slate = new THREE.MeshStandardMaterial({ color: '#3f4448', roughness: 0.7, flatShading: true });

  // ---------- Academia de Studii Economice, NE of Piața Romană ----------
  const aseSetback = 8;
  addBuilding(kit, {
    id: 'ase', name: 'Academia de Studii Economice', subtitle: 'Piața Romană', side: 'E', zSouth: -892, zNorth: -1000, depth: 60,
    floors: 5, floorH: 4.4, groundH: 5.5, style: 'classic', wall: '#ddd2bc', trim: '#f3ecdc', ppm: 12, shops: false, setback: aseSetback, entrance: 'ASE',
  });
  const aseFront = FRONT_X + aseSetback;
  const aseZ = (-892 - 1000) / 2;
  const colH = 17;
  // podium and steps
  const podium = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 34), stone);
  podium.position.set(aseFront - 2.5, 0.6, aseZ);
  kit.addMesh(podium);
  for (let i = 0; i < 8; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, colH, 16), stone);
    col.position.set(aseFront - 3.5, 1.2 + colH / 2, aseZ - 14 + i * 4);
    kit.addMesh(col, false);
  }
  const entablature = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.6, 34), stone);
  entablature.position.set(aseFront - 2.7, 1.2 + colH + 0.8, aseZ);
  kit.addMesh(entablature);
  // triangular pediment facing the street
  const ped = new THREE.Shape();
  ped.moveTo(-17, 0);
  ped.lineTo(17, 0);
  ped.lineTo(0, 5.5);
  ped.closePath();
  const pediment = new THREE.Mesh(new THREE.ExtrudeGeometry(ped, { depth: 5.5, bevelEnabled: false }), stone);
  pediment.rotation.y = Math.PI / 2;
  pediment.position.set(aseFront - 5.45, 1.2 + colH + 1.6, aseZ);
  kit.addMesh(pediment, false);
  // the dome over the centre
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 5, 32), stone);
  drum.position.set(aseFront + 22, 5.5 + 4 * 4.4 + 0.9 + 2.5, aseZ);
  kit.addMesh(drum);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(9.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), copper);
  dome.position.set(aseFront + 22, drum.position.y + 2.5, aseZ);
  kit.addMesh(dome);
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3, 12), stone);
  lantern.position.set(aseFront + 22, dome.position.y + 9.2 + 1.5, aseZ);
  kit.addMesh(lantern, false);

  // ---------- Hotel InterContinental, Piața Universității ----------
  addBuilding(kit, {
    id: 'intercontinental', name: 'Hotel InterContinental', subtitle: '1971 · Piața Universității', side: 'E', zSouth: 690, zNorth: 655, depth: 26,
    floors: 23, floorH: 3.1, groundH: 6, style: 'grid', wall: '#d2cdc2', accent: '#8a97a3', balconies: 0.85, setback: 10, ppm: 10,
    signs: [{ text: 'INTERCONTINENTAL', kind: 'roof', color: '#f4f1e8' }], entrance: 'INTERCONTINENTAL',
  });
  // the wider podium
  const podiumIC = new THREE.Mesh(new THREE.BoxGeometry(44, 7, 50), new THREE.MeshStandardMaterial({ color: '#b8b2a6', roughness: 0.8 }));
  podiumIC.position.set(FRONT_X + 8 + 22, 3.5, 672);
  kit.addMesh(podiumIC);

  // ---------- Teatrul Național, Piața Universității ----------
  addBuilding(kit, {
    id: 'tnb', name: 'Teatrul Național București', subtitle: 'Piața Universității', side: 'E', zSouth: 765, zNorth: 645, depth: 120,
    floors: 6, floorH: 4, groundH: 6, style: 'curtain', wall: '#c7bfae', accent: '#3b4a55', shops: false, setback: 72, ppm: 8, entrance: 'TNB',
    tiers: [{ floors: 2, inset: 25, sideInset: 25 }],
  });

  // ---------- Biserica Amzei ----------
  {
    const cx = -128, cz = -214;
    const nave = new THREE.Mesh(new THREE.BoxGeometry(26, 12, 12), brick);
    nave.position.set(cx, 6, cz);
    kit.addMesh(nave);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 12, 4, 4, 1).rotateY(Math.PI / 4), slate);
    roof.scale.set(1.55, 1, 0.72);
    roof.position.set(cx, 14, cz);
    kit.addMesh(roof, false);
    const apse = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 11, 20, 1, false, 0, Math.PI), brick);
    apse.rotation.y = Math.PI / 2;
    apse.position.set(cx - 13, 5.5, cz);
    kit.addMesh(apse, false);
    // bell tower over the entrance (east end, towards Magheru) and a drum with a dome over the crossing
    const tower = new THREE.Mesh(new THREE.BoxGeometry(7, 22, 7), brick);
    tower.position.set(cx + 14, 11, cz);
    kit.addMesh(tower);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(4, 9, 8), slate);
    spire.position.set(cx + 14, 26.5, cz);
    kit.addMesh(spire, false);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 0.2), bronze);
    cross.position.set(cx + 14, 32, cz);
    g.add(cross);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 5, 8), brick);
    drum.position.set(cx - 2, 16, cz);
    kit.addMesh(drum, false);
    const cupola = new THREE.Mesh(new THREE.SphereGeometry(3.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), slate);
    cupola.position.set(cx - 2, 18.5, cz);
    g.add(cupola);
    // white string courses, typical of Romanian brick churches
    for (const y of [3, 8]) kit.trim.add(cx, y, cz, 26.2, 0.35, 12.2, 0, '#efe8da');
    kit.label('Biserica Amzei', 'Str. Biserica Amzei', new THREE.Vector3(cx, 36, cz));
  }

  // ---------- Casa Dimitrie Sturdza, on Str. Pictor Arthur Verona ----------
  {
    const cx = 60, cz = -220;
    const house = new THREE.Mesh(new THREE.BoxGeometry(24, 9, 16), new THREE.MeshStandardMaterial({ color: '#e6d9bd', roughness: 0.85 }));
    house.position.set(cx, 4.5, cz);
    kit.addMesh(house);
    const mansard = new THREE.Mesh(new THREE.CylinderGeometry(6, 13.5, 5, 4, 1).rotateY(Math.PI / 4), slate);
    mansard.scale.set(1.25, 1, 0.84);
    mansard.position.set(cx, 11.5, cz);
    kit.addMesh(mansard, false);
    // windows drawn as dark insets
    const winMat = new THREE.MeshStandardMaterial({ color: '#2a3440', roughness: 0.2 });
    for (let i = 0; i < 6; i++) {
      for (const y of [2.6, 6.4]) {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), winMat);
        w.position.set(cx - 9.5 + i * 3.8, y, cz + 8.02);
        g.add(w);
      }
    }
    kit.trim.add(cx, 9.1, cz, 24.6, 0.4, 16.6, 0, '#f5efe1');
    kit.label('Casa Dimitrie Sturdza', 'Str. Pictor Arthur Verona', new THREE.Vector3(cx, 20, cz));
  }

  // ---------- Statuia Lupoaicei (Capitoline Wolf), Piața Romană ----------
  {
    const z = ROMANA_Z;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 2.2), stone);
    plinth.position.set(0, 0.85, z);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 5.5, 16), stone);
    column.position.set(0, 4.2, z);
    const capital = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.8), stone);
    capital.position.set(0, 7.15, z);
    [plinth, column, capital].forEach((m) => kit.addMesh(m));
    const wolf = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 1.1, 4, 8).rotateZ(Math.PI / 2), bronze);
    body.position.y = 0.85;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8).rotateZ(Math.PI / 2), bronze);
    head.position.set(-1.0, 1.15, 0);
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.3, 4, 8).rotateZ(-0.8), bronze);
    neck.position.set(-0.7, 1.0, 0);
    wolf.add(body, head, neck);
    for (const [lx, lz] of [[-0.5, -0.18], [-0.5, 0.18], [0.5, -0.18], [0.5, 0.18]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.6, 6), bronze);
      leg.position.set(lx, 0.3, lz);
      wolf.add(leg);
    }
    for (const tx of [-0.15, 0.25]) {
      // the twins
      const twin = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), bronze);
      twin.position.set(tx, 0.15, 0);
      wolf.add(twin);
    }
    wolf.position.set(0, 7.35, z);
    wolf.rotation.y = Math.PI / 2;
    wolf.traverse((o) => (o.castShadow = true));
    g.add(wolf);
    kit.label('Statuia Lupoaicei', 'Piața Romană', new THREE.Vector3(0, 11, z));
  }

  // ---------- metro entrances (Bucharest M2 line runs under the boulevard) ----------
  const mTex = (() => {
    const [c, ctx] = makeCanvas(128, 128);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#0055a5';
    ctx.fillRect(8, 8, 112, 112);
    ctx.fillStyle = '#ffffff';
    fitText(ctx, 'M', 64, 68, 100, 100, 'Arial', '900');
    return canvasTexture(c);
  })();
  const mMat = new THREE.MeshStandardMaterial({ map: mTex, emissiveMap: mTex, emissive: 0xffffff, emissiveIntensity: 0.2 });
  kit.neonMaterials.push(mMat);
  const darkMat = new THREE.MeshStandardMaterial({ color: '#111', roughness: 1 });
  const wallMat = new THREE.MeshStandardMaterial({ color: '#8a8780', roughness: 0.8 });
  const metro = (x: number, z: number, along: boolean) => {
    const w = along ? 3.4 : 7, d = along ? 7 : 3.4;
    const hole = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), darkMat);
    hole.position.set(x, 0.16, z);
    g.add(hole);
    // low parapet walls on three sides, with railings
    kit.trim.add(x - w / 2, 0.6, z, 0.25, 1.0, d, 0, '#8a8780');
    kit.trim.add(x + w / 2, 0.6, z, 0.25, 1.0, d, 0, '#8a8780');
    if (along) kit.trim.add(x, 0.6, z - d / 2, w, 1.0, 0.25, 0, '#8a8780');
    else kit.trim.add(x, 0.6, z + d / 2, w, 1.0, 0.25, 0, '#8a8780');
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8), wallMat);
    post.position.set(x + w / 2 + 0.4, 1.6, z + d / 2);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.12), [mMat, mMat, mMat, mMat, mMat, mMat]);
    sign.position.set(x + w / 2 + 0.4, 3.4, z + d / 2);
    sign.rotation.y = along ? Math.PI / 2 : 0;
    g.add(post, sign);
  };
  for (const sx of [-1, 1]) {
    metro(sx * 15.8, ROMANA_Z + ROMANA_HALF + 14, true);
    metro(sx * 15.8, UNIVERSITATE_Z - 30, true);
  }
  metro(-40, ROMANA_Z - ROMANA_HALF + 10, false);
  metro(40, ROMANA_Z + ROMANA_HALF - 12, false);
  kit.label('Metrou Piața Romană', 'M2', new THREE.Vector3(15.8, 7, ROMANA_Z + ROMANA_HALF + 14));
  kit.label('Metrou Universitate', 'M2', new THREE.Vector3(15.8, 7, UNIVERSITATE_Z - 30));
}
