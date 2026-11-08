# Syllabaries, abugidas and Hangul

## Kinds of writing systems

Writing systems differ in which unit of language each symbol stands for:

| Type | Each symbol stands for | Examples |
|---|---|---|
| **logographic** | a morpheme (a unit of meaning), which is usually also a syllable | Chinese characters |
| **syllabary** | a syllable or mora | Japanese hiragana and katakana, Cherokee, Linear B (Mycenaean Greek) |
| **abugida** | a consonant with a built-in vowel, changed by marks | Devanagari (Hindi, Marathi, Nepali), Bengali, Tamil, Thai, Ethiopic |
| **abjad** | a consonant; most vowels are not written | Arabic, Hebrew |
| **alphabet** | a consonant or a vowel | Greek, Latin, Cyrillic, Georgian |
| **featural** | a sound, with shapes that reflect how it is made, grouped into syllable blocks | Korean Hangul |

Real systems mix types: Japanese combines Chinese characters (*kanji*) with two syllabaries; English spelling has many logographic quirks (*two*, *too* and *to* sound alike but are spelled apart, like Chinese characters).

## Syllabaries: Japanese kana

Japanese has two parallel syllabaries of 46 basic symbols each: **hiragana** for native words and grammar, **katakana** for foreign words and emphasis. Both developed around the 9th century from simplified Chinese characters chosen for their sound: あ *a* from 安, か *ka* from 加. Each kana is one mora:

```bash
node scripts.js kana ひらがな さくら きって とうきょう がっこう しゃしん
```

```
ひらがな     hiragana     4 morae: hi|ra|ga|na
さくら      sakura       3 morae: sa|ku|ra
きって      kitte        3 morae: ki|t|te
とうきょう    toukyou      4 morae: to|u|kyo|u
がっこう     gakkou       4 morae: ga|k|ko|u
しゃしん     shashin      3 morae: sha|shi|n
```

Two small marks change the sound: a double dash (*dakuten*) voices the consonant, か *ka* → が *ga*; a small つ (*sokuon*, っ) doubles the next consonant, き・っ・て *ki-t-te* "stamp". A small や/ゆ/よ fuses with the kana before it: し + ゃ = しゃ *sha*. The writing counts time exactly as speakers do.

**Cherokee** has a syllabary of 85 symbols, created by Sequoyah in about 1821, one of the rare cases of a person inventing a writing system for their own language. Within a few years, a large part of the Cherokee Nation could read and write it.

## Abugidas: Devanagari

In **Devanagari**, used for Hindi, Marathi, Nepali and Sanskrit, each consonant letter includes an inherent vowel *a*: क is *ka*. Other vowels are marks attached to it: कि *ki*, की *kī*, कु *ku*, के *ke*, को *ko*. A special mark (*virāma*) removes the vowel, and consonant clusters join into combined letters (क + ष = क्ष *kṣa*). Most scripts of South and Southeast Asia, from Bengali to Thai, descend from the ancient Brahmi script and work this way.

## Hangul: a featural alphabet in syllable blocks

**Hangul** was created in 1443 by King Sejong of Korea and his scholars, and published in 1446 in the *Hunminjeongeum*, "the correct sounds for instructing the people". Before it, Koreans wrote with Chinese characters, which few could learn. Its design is unusually scientific:

- the basic consonant shapes **draw the speech organs**: ㄱ [k] shows the tongue's back touching the soft palate, ㄴ [n] the tongue tip touching the ridge behind the teeth, ㅁ [m] the closed mouth, ㅅ [s] a tooth, ㅇ the open throat;
- extra strokes add features: ㄱ [k] → ㅋ [kʰ] (aspirated); ㄴ [n] → ㄷ [t] → ㅌ [tʰ];
- vowels are built from three symbols for heaven (a dot, now a short stroke), earth (ㅡ) and human (ㅣ);
- letters are grouped into **syllable blocks**: an initial consonant, a vowel, and optionally a final consonant (written ㅇ when the syllable starts with a vowel).

```bash
node scripts.js hangul 한국어 안녕하세요 사랑 김치
```

```
한국어: 한 (ㅎ+ㅏ+ㄴ)  국 (ㄱ+ㅜ+ㄱ)  어 (ㅇ+ㅓ)  ->  han-guk-eo
안녕하세요: 안 (ㅇ+ㅏ+ㄴ)  녕 (ㄴ+ㅕ+ㅇ)  하 (ㅎ+ㅏ)  세 (ㅅ+ㅔ)  요 (ㅇ+ㅛ)  ->  an-nyeong-ha-se-yo
사랑: 사 (ㅅ+ㅏ)  랑 (ㄹ+ㅏ+ㅇ)  ->  sa-rang
김치: 김 (ㄱ+ㅣ+ㅁ)  치 (ㅊ+ㅣ)  ->  gim-chi
```

### The arithmetic of Hangul

Unicode encodes every possible block, in order, and the code of a block can be computed from its letters:

$$
\text{code} = \text{AC00}_{16} + (21\,L + V) \times 28 + T
$$

where $L$ is the number of the initial consonant (0 to 18), $V$ of the vowel (0 to 20), and $T$ of the final (0 for none, up to 27):

```bash
node scripts.js compose ㅎ ㅏ ㄴ
node scripts.js compose ㄱ ㅡ ㄹ
node scripts.js count
```

```
initial ㅎ = 18, vowel ㅏ = 0, final ㄴ = 4
code = 0xAC00 + (18 x 21 + 0) x 28 + 4 = 54620 = U+D55C  ->  한

initial ㄱ = 0, vowel ㅡ = 18, final ㄹ = 8
code = 0xAC00 + (0 x 21 + 18) x 28 + 8 = 44544 = U+AE00  ->  글

19 initial consonants x 21 vowels x 28 finals (27 + none) = 11172 possible blocks, U+AC00 to U+D7A3
built from 24 basic letters (14 consonants, 10 vowels), which are combined into the 19, 21 and 27 above
```

*Han* and *geul* together make **Hangeul**, 한글, the name of the script. From 24 basic letters, the system builds 11,172 possible blocks, of which a couple of thousand are common in practice. The formula also works backwards: dividing a block's code by 28 and by 21 recovers its letters, which is how `scripts.js hangul` splits blocks.

Korea celebrates Hangul Day on 9 October (in South Korea; 15 January in North Korea).

## Check yourself

1. Decompose 글 (*geul*) and 말 (*mal*, "language") by hand, then check with `scripts.js hangul`.
2. Compute the code of 마 (ㅁ + ㅏ, with ㅁ as initial number 6 and no final). Check with `scripts.js compose ㅁ ㅏ`.
3. Why is a syllabary practical for Japanese but would be impractical for English? (Think of the number of possible syllables in each, from chapter 1.)
