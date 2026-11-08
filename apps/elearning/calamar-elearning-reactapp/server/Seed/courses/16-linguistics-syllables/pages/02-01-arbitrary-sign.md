# The arbitrary sign and homophony

## Saussure's arbitrary sign

Why is a horse called *horse* in English, *cal* in Romanian, *caballo* in Spanish, *Pferd* in German, *uma* in Japanese and *mǎ* in Mandarin? Nothing about the animal demands any of these sounds. Ferdinand de Saussure, in his *Course in General Linguistics* (1916), called this the **arbitrariness of the sign**: the link between a word's sound (the *signifier*) and its meaning (the *signified*) is a convention of each language, not a natural fact.

Even imitations of sounds, **onomatopoeia**, are conventional. A dog barks:

| Language | Dog | Rooster |
|---|---|---|
| English | woof woof | cock-a-doodle-doo |
| Romanian | ham ham | cucurigu |
| French | ouaf ouaf | cocorico |
| Spanish | guau guau | quiquiriquí |
| Japanese | wan wan | kokekokkō |
| Korean | meong meong | kkokkio |
| Mandarin | wāng wāng | wō wō |

They are similar enough to be recognizable, but each fits its own language's syllables. (Chapter 3 shows that arbitrariness has more exceptions than Saussure thought.)

## The same syllable, different meanings

If the sign is arbitrary, nothing stops two languages from using the same syllable for completely different things. And with only a few hundred common short syllables in the world, and many thousands of meanings, they must overlap constantly. The dataset of this course shows it:

```bash
node syllables.js --stats
```

```
151 entries, 15 syllables, 28 languages

per syllable:  ma 26, mi 15, na 14, da 13, si 13, ne 11, la 11, pa 9, ba 7, ka 7, no 6, ta 6, shi 6, to 5, ga 2
per language:  Mandarin 35, Japanese 19, Vietnamese 11, Swahili 9, Hindi 7, Spanish 7, Romanian 6, Cantonese 6, Italian 5, French 5, Russian 5, Turkish 4, Korean 4, Thai 3, Bengali 3, Arabic 3, Persian 3, Polish 3, Hebrew 2, Greek 2, Czech 2, Portuguese 1, Serbo-Croatian 1, Georgian 1, German 1, Hungarian 1, Tagalog 1, Estonian 1
per kind:      word 121, particle 17, prefix 4, stem 6, suffix 3
```

Inside a single language, two words with the same sound and different meanings are **homophones**: English *right*, *write* and *rite*; French *ver* "worm", *vert* "green", *verre* "glass", *vers* "toward" and *vair* "squirrel fur", all [vɛʁ].

## Why some languages have more homophones

Homophony depends on how many distinct syllables a language has, and how much it relies on single syllables:

- **Mandarin** has about 400 syllables if you ignore tones, and about 1,300 with them. Tens of thousands of morphemes (units of meaning, each written with one character) share those syllables, so homophones are everywhere. The data shows it:

```bash
node syllables.js --homophones
```

```
syllable  language     meanings in the data
  ma      Vietnamese   6
  si      Cantonese    6
  ma      Mandarin     5
  ba      Mandarin     5
  da      Mandarin     4
  shi     Mandarin     4
  ma      Thai         3
  na      Mandarin     3
  mi      Mandarin     3
  mi      Japanese     3
  si      Mandarin     3
```

- **Japanese** has few distinct morae (around a hundred), and many homophones too, especially among words borrowed from Chinese: *kōkō* can mean "high school" (高校), "filial piety" (孝行), "sailing" (航行) or "the mouth cavity" (口腔), among others.
- **English** has thousands of possible syllables, thanks to its complex onsets and codas, so it has fewer homophones per syllable.

A toy calculation shows the difference. If every syllable were equally likely, one syllable would carry $\log_2 n$ bits of information, where $n$ is the number of possible syllables:

$$
\log_2 1300 \approx 10.3\ \text{bits (Mandarin, with tones)}, \qquad \log_2 110 \approx 6.8\ \text{bits (Japanese morae)}
$$

Real values are lower, because syllables aren't equally common, and context makes many predictable. But the trade-off is real: a study of 17 languages (Coupé and colleagues, 2019) found that languages with more information per syllable are spoken with fewer syllables per second, so that they all convey information at a broadly similar rate, about 39 bits per second.

## How languages cope

Homophones rarely cause confusion, for three reasons:

1. **Context**: *I'd like a pair of shoes* is never heard as *a pear of shoes*.
2. **Compounds**: Modern Mandarin builds most words from two syllables. *Shī* alone could mean "poem", "lion", "teacher", "wet" and more; but *shīrén* 诗人 is "poet", *shīzi* 狮子 "lion", and *lǎoshī* 老师 "teacher".
3. **Writing**: Chinese characters distinguish what speech merges. The linguist Yuen Ren Chao wrote a famous text, *The Lion-Eating Poet in the Stone Den*, in which every one of its 90-odd characters is pronounced *shi*, in different tones. It begins: 石室诗士施氏，嗜狮，誓食十狮。*Shíshì shīshì Shī Shì, shì shī, shì shí shí shī*: "In a stone den was a poet called Shi, who was a lion addict, and had resolved to eat ten lions." Read aloud, it is gibberish; written, it is perfectly clear. (It is a deliberate tour de force, in the old literary language, not a sample of everyday speech.)

## Check yourself

1. Find three sets of English homophones with three or more members.
2. Why does a language with complex syllables, like English, tend to have fewer homophones than one with simple syllables, like Japanese?
3. Look up the onomatopoeia for a cat's meow in three languages. How similar are they? Why might cats be more consistent than roosters?
