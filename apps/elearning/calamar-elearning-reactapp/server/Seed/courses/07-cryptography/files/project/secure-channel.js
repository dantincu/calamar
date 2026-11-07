// secure-channel.js: a small authenticated, encrypted channel between Alice and Bob, built from standard primitives
// the way real protocols (TLS 1.3, Signal, WireGuard, Noise) are:
//   - Ed25519 identity keys, whose public halves are known in advance (like pinned certificates)
//   - ephemeral X25519 key exchange, signed with the identity keys: authentication and forward secrecy
//   - HKDF-SHA256 to derive separate keys for each direction from the shared secret and the handshake transcript
//   - AES-256-GCM with counter nonces (never repeated), the message number in the AAD, and replay rejection
//
//   node secure-channel.js
//
// It's a teaching model: real protocols add version negotiation, key rotation, padding, and careful handling of many more cases.
import crypto from 'node:crypto';

const raw = (pub) => pub.export({ format: 'der', type: 'spki' });

function party(name) {
  return { name, identity: crypto.generateKeyPairSync('ed25519') };
}

/** step 1: a fresh ephemeral X25519 key, signed with the long-term identity key */
function hello(p) {
  p.ephemeral = crypto.generateKeyPairSync('x25519');
  const ephPub = raw(p.ephemeral.publicKey);
  return { from: p.name, ephPub, sig: crypto.sign(null, ephPub, p.identity.privateKey) };
}

/** step 2: verify the peer's signature, compute the shared secret, derive the session keys */
function finish(me, myHello, peerHello, peerIdentityPub, iAmInitiator) {
  if (!crypto.verify(null, peerHello.ephPub, peerIdentityPub, peerHello.sig)) {
    throw new Error(`${me.name}: the peer's key exchange is not signed by ${peerHello.from}'s identity key: possible man in the middle`);
  }
  const peerEph = crypto.createPublicKey({ key: peerHello.ephPub, format: 'der', type: 'spki' });
  const shared = crypto.diffieHellman({ privateKey: me.ephemeral.privateKey, publicKey: peerEph });

  // The transcript (both hellos, in a fixed order) goes into the key derivation: any tampering gives different keys.
  const [first, second] = iAmInitiator ? [myHello, peerHello] : [peerHello, myHello];
  const transcript = crypto.createHash('sha256').update(Buffer.concat([first.ephPub, first.sig, second.ephPub, second.sig])).digest();
  const okm = Buffer.from(crypto.hkdfSync('sha256', shared, transcript, 'secure-channel demo v1', 64));
  const [k1, k2] = [okm.subarray(0, 32), okm.subarray(32)];
  // One key per direction, so the two sides never encrypt with the same key and nonce
  me.sendKey = iAmInitiator ? k1 : k2;
  me.recvKey = iAmInitiator ? k2 : k1;
  me.sendCounter = 0n;
  me.recvCounter = 0n;
  delete me.ephemeral;                            // forward secrecy: forget the ephemeral private key
}

const nonceOf = (counter) => { const n = Buffer.alloc(12); n.writeBigUInt64BE(counter, 4); return n; };

function send(me, text) {
  const counter = me.sendCounter++;
  const header = Buffer.alloc(8);
  header.writeBigUInt64BE(counter);
  const cipher = crypto.createCipheriv('aes-256-gcm', me.sendKey, nonceOf(counter));
  cipher.setAAD(header);
  const ct = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return Buffer.concat([header, ct, cipher.getAuthTag()]);
}

function receive(me, packet) {
  const counter = packet.readBigUInt64BE(0);
  if (counter < me.recvCounter) throw new Error(`${me.name}: replayed or out-of-order message #${counter} rejected`);
  const decipher = crypto.createDecipheriv('aes-256-gcm', me.recvKey, nonceOf(counter));
  decipher.setAAD(packet.subarray(0, 8));
  decipher.setAuthTag(packet.subarray(packet.length - 16));
  const text = Buffer.concat([decipher.update(packet.subarray(8, packet.length - 16)), decipher.final()]).toString('utf8');
  me.recvCounter = counter + 1n;
  return text;
}

// ---- A normal session ------------------------------------------------------------------------------------
const alice = party('Alice'), bob = party('Bob');
const helloA = hello(alice), helloB = hello(bob);
finish(alice, helloA, helloB, bob.identity.publicKey, true);
finish(bob, helloB, helloA, alice.identity.publicKey, false);
console.log('Handshake done. Same key for Alice->Bob on both sides?', alice.sendKey.equals(bob.recvKey));

const m1 = send(alice, 'Hi Bob, the launch code is 0000. Just kidding.');
const m2 = send(alice, 'Second message');
console.log('Bob reads:', receive(bob, m1));
console.log('Bob reads:', receive(bob, m2));
console.log('Alice reads:', receive(alice, send(bob, 'Got both, thanks!')));

// ---- Attacks the design stops ---------------------------------------------------------------------------------
const attempt = (label, fn) => { try { fn(); console.log(`${label}: NOT detected (bug!)`); } catch (e) { console.log(`${label}: ${e.message}`); } };

attempt('Replay of message 1', () => receive(bob, m1));

const m3 = send(alice, 'Pay 10 EUR');
const forged = Buffer.from(m3); forged[10] ^= 0x01;
attempt('One flipped bit', () => receive(bob, forged));

// Mallory replaces Alice's ephemeral key with her own, keeping Alice's signature (or signing with her own key)
const carol = party('Alice'), dave = party('Bob'), mallory = party('Mallory');
const hC = hello(carol), hD = hello(dave), hM = hello(mallory);
attempt('Man in the middle', () => finish(dave, hD, { ...hM, from: 'Alice' }, carol.identity.publicKey, false));
