# Block ciphers and modes of operation

## AES

A **block cipher** is a keyed permutation of fixed-size blocks: $E_K: \{0,1\}^{128} \to \{0,1\}^{128}$ for AES. Without the key, it should be indistinguishable from a random permutation.

**AES** (Rijndael, standardized in 2001 after an open competition) has 128-bit blocks, keys of 128, 192 or 256 bits, and 10, 12 or 14 **rounds**. The 16-byte state is a $4 \times 4$ matrix of bytes, and each round applies:

| Step | Does | Provides |
|---|---|---|
| `SubBytes` | replaces each byte through an S-box (inversion in the field $\mathrm{GF}(2^8)$, then an affine map) | non-linearity (**confusion**) |
| `ShiftRows` | rotates row $i$ left by $i$ bytes | spreads bytes across columns |
| `MixColumns` | multiplies each column by a fixed matrix over $\mathrm{GF}(2^8)$ | spreads bits within a column (**diffusion**) |
| `AddRoundKey` | XORs in a round key derived from $K$ | key dependence |

After two rounds, every output bit depends on every input bit. Modern CPUs have AES instructions (AES-NI, ARMv8 crypto extensions) that run a round in a few cycles, in constant time.

No practical attack on full AES is known after more than 20 years of analysis. The best academic attacks shave only a couple of bits off the brute-force cost.

## Modes: encrypting more than one block

A block cipher alone encrypts 16 bytes. **Modes of operation** extend it to messages.

### ECB: never

Electronic codebook encrypts each block independently: $C_i = E_K(P_i)$. **Equal plaintext blocks give equal ciphertext blocks**, so structure shows through. The famous "ECB penguin" (an image encrypted with ECB) is still recognizable. ECB is never acceptable for data.

### CBC: legacy

Cipher block chaining XORs each block with the previous ciphertext:

$$
C_i = E_K(P_i \oplus C_{i-1}), \qquad C_0 = \text{IV (random, unpredictable)}
$$

CBC needs **padding**, and without a MAC it's vulnerable to **padding oracle attacks** (Vaudenay, 2002; Lucky 13 and POODLE in TLS): a server that reveals whether the padding was valid lets an attacker decrypt everything, one byte at a time. TLS 1.3 removed CBC entirely.

### CTR: a stream cipher from a block cipher

Counter mode encrypts a counter, and XORs the result with the plaintext:

$$
C_i = P_i \oplus E_K(\text{nonce} \,\|\, i)
$$

It's parallelizable, needs no padding, and decryption is the same operation. But:

- the (nonce, counter) pair **must never repeat** under one key, or $C_1 \oplus C_2 = P_1 \oplus P_2$;
- it's **malleable**: flipping a ciphertext bit flips the same plaintext bit. Changing "pay 100" into "pay 900" takes a single XOR, if the attacker knows where the digit is.

## The lesson

**Encryption alone doesn't protect integrity**, and attackers who can modify ciphertexts and watch how the receiver reacts can often recover plaintexts too. The answer is authenticated encryption, in the next lesson. In practice, you should never pick a mode yourself: use an AEAD.
