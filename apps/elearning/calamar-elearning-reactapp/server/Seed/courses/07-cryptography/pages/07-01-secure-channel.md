# Building and attacking a secure channel

`secure-channel.js` implements, in about 100 lines, the same structure as TLS 1.3, Noise and Signal's initial handshake, using only Node's built-in crypto.

## The design

**Long-term identities.** Alice and Bob each have an **Ed25519** key pair. Each knows the other's public key in advance, as if pinned, or verified through a certificate or a safety number.

**Handshake.**

1. Each side generates a fresh **X25519** key pair, and signs its ephemeral public key with its identity key: $\sigma_A = \operatorname{Sign}(sk_A^{\text{id}}, \text{eph}_A)$.
2. Each side verifies the peer's signature, then computes the shared secret $s = \operatorname{X25519}(a, \text{eph}_B) = \operatorname{X25519}(b, \text{eph}_A)$.
3. Keys are derived from $s$ and the **transcript**:

$$
\text{th} = \operatorname{SHA\text{-}256}(\text{eph}_A \,\|\, \sigma_A \,\|\, \text{eph}_B \,\|\, \sigma_B)
$$

$$
k_{A \to B} \,\|\, k_{B \to A} = \operatorname{HKDF}(\text{IKM} = s,\ \text{salt} = \text{th},\ \text{info} = \texttt{"secure-channel demo v1"},\ L = 64)
$$

4. Both sides **delete** the ephemeral private keys: forward secrecy.

**Messages.** Each direction has its own key and a 64-bit counter $i$, starting at 0:

$$
\text{packet}_i = i \,\|\, \operatorname{AES\text{-}256\text{-}GCM}\big(k,\ \text{nonce} = 0^{32} \,\|\, i,\ P,\ \text{AAD} = i\big)
$$

The receiver rejects any counter below the next expected one, so replays fail.

## Why each piece is there

| Piece | Without it |
|---|---|
| Signatures on the ephemeral keys | a man in the middle substitutes their own keys (`dh-toy.js` part 4) |
| Ephemeral X25519 keys, deleted after use | a later theft of the identity keys decrypts recorded sessions |
| Transcript in the HKDF salt | the keys aren't bound to the exact handshake that both sides saw |
| One key per direction | both sides would encrypt with the same key and counter 0: a nonce collision |
| Counter nonces | random 96-bit nonces would be fine too, but would need a birthday-bound limit |
| Counter in the AAD, and replay check | old packets could be replayed or reordered |
| AEAD | any modification goes undetected |

## Run it

```
$ node secure-channel.js
Handshake done. Same key for Alice->Bob on both sides? true
Bob reads: Hi Bob, the launch code is 0000. Just kidding.
Bob reads: Second message
Alice reads: Got both, thanks!
Replay of message 1: Bob: replayed or out-of-order message #0 rejected
One flipped bit: Unsupported state or unable to authenticate data
Man in the middle: Bob: the peer's key exchange is not signed by Alice's identity key: possible man in the middle
```

## Exercises

1. **Break it on purpose.** Make both directions use the same key (`me.sendKey = me.recvKey = k1`). Then use `aead.js`'s XOR trick to show that Alice's first message and Bob's first message leak each other.
2. **Remove the signature check** in `finish`, and show that the man-in-the-middle attempt now "succeeds": Mallory completes a handshake with Bob while posing as Alice.
3. **Unknown-key-share.** The signatures cover only the ephemeral keys, not the parties' **names**. Explain why including both identities in the signed data (as TLS 1.3 does by signing the whole transcript) is safer, and implement it.
4. **Key rotation.** After every 1,000 messages, derive a new key with $k' = \operatorname{HKDF}(k, \texttt{"ratchet"})$, and erase the old one. What does this add? (Hint: a key stolen at message 5,000 shouldn't decrypt message 10.)
5. **Post-quantum hybrid.** Node 24 can't do ML-KEM natively yet. Sketch where an ML-KEM encapsulation would go, and how its shared secret would be combined with X25519's: concatenate both secrets as the HKDF input, as X25519MLKEM768 does.
6. **Compare with Noise.** Read the Noise Protocol Framework's `XX` pattern, and map its steps onto this script. Which properties does Noise add?

## Final words

You've seen the math (modular arithmetic, groups, curves, lattices), the primitives built on it, and the protocols built from those. Remember the structure of the failures: very few came from broken math, and almost all came from reused nonces, missing authentication, bad randomness, side channels or skipped checks.

Use high-level, well-reviewed libraries; understand what they guarantee; and keep a list of your keys. Congratulations on finishing the course.
