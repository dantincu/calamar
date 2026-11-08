# The structure of the syllable

## Onset, nucleus, coda

Everyone can count syllables, by tapping or clapping, even though defining them is surprisingly hard. Linguists describe a syllable as having up to three parts:

```
           syllable
          /        \
     onset          rhyme
                   /     \
              nucleus    coda
   s t r         e        n g th s        English "strengths"
   m             a                         "ma"
```

- the **nucleus**, the peak of the syllable, almost always a vowel, and the only obligatory part;
- the **onset**, the consonants before it;
- the **coda**, the consonants after it.

The nucleus and coda together form the **rhyme**, which is what rhymes in poetry: *cat* and *hat*. A syllable without a coda is **open** (*ma*, *si*), one with a coda is **closed** (*mas*, *sit*).

Linguists write syllable shapes with C for consonant and V for vowel: *ma* is CV, *art* is VCC, *strengths* [stɹɛŋkθs] is CCCVCCCC, one of the most complex syllables of English.

## CV is universal

Every language known has **CV** syllables, and children everywhere begin babbling with them (*ba-ba*, *ma-ma*: chapter 3). Beyond that, languages differ enormously in what they allow:

| Language | Typical syllable | Example |
|---|---|---|
| Hawaiian | (C)V only | *a-lo-ha* |
| Japanese | (C)(y)V, plus a final *n* or the first half of a double consonant | *to-o-kyo-o*, *ni-p-po-n* |
| Mandarin | (C)(G)V(N), with only *n* or *ng* in the coda | *zhōng*, *guó* |
| Spanish | up to CCVCC, but a coda is usually one consonant | *trans-por-te* |
| English | up to CCCVCCCC | *strengths* |
| Georgian | onsets of six or more consonants | *gvprtskvni* (გვფრცქვნი), "you peel us" |

Some languages even have syllables whose nucleus is a consonant. English has syllabic [n] in *button* [ˈbʌtn̩]. Czech has the tongue-twister *Strč prst skrz krk*, "stick a finger through the throat", four syllables without a single vowel letter: the [r] is the nucleus each time.

## Why loanwords change shape

When a language borrows a word, it reshapes it into syllables it allows, usually by adding vowels:

| Original | Borrowed as | Language |
|---|---|---|
| Christmas | *kurisumasu* | Japanese |
| McDonald's | *makudonarudo* | Japanese |
| Merry Christmas | *Mele Kalikimaka* | Hawaiian |
| strike | *sutoraiku* | Japanese |
| Stalin | *Sīdàlín* (斯大林) | Mandarin |

Spanish has a rule of its own: no syllable starts with *s* plus a consonant. So Latin words beginning with *s* + consonant gained a vowel in front: *schola* → *escuela*, *stella* → *estrella*, and Spanish speakers often say *espeak* and *estop* in English.

## The sonority principle

Within a syllable, consonants aren't ordered at random. Sounds can be ranked by **sonority**, roughly their loudness or openness:

$$
\text{stops} < \text{fricatives} < \text{nasals} < \text{liquids} < \text{glides} < \text{vowels}
$$

The **sonority sequencing principle**: sonority rises from the start of the syllable to the nucleus, and falls after it. *plan* is possible (stop, liquid, vowel: rising), *lpan* is not, in English or almost any language. And *help* (vowel, liquid, stop: falling) is fine, while *hepl* would not be one syllable. The main exception is *s*: *stop*, *spin* and *sky* have a fricative before a stop, against the principle, in many languages.

## Splitting words into syllables

Where does one syllable end and the next begin, in *constructor*? Many languages follow the **maximal onset principle**: give the following syllable as many consonants as can begin a syllable in that language. So the answer depends on the language's allowed onsets:

```bash
node syllabify.js es constructor astronomía pasta perro país
```

```
constructor    cons-truc-tor        3 syllables
astronomía     as-tro-no-mí-a       5 syllables
pasta          pas-ta               2 syllables
perro          pe-rro               2 syllables
país           pa-ís                2 syllables
```

```bash
node syllabify.js it costruttore finestra pasta tutto
```

```
costruttore    co-strut-to-re       4 syllables
finestra       fi-ne-stra           3 syllables
pasta          pa-sta               2 syllables
tutto          tut-to               2 syllables
```

```bash
node syllabify.js en constructor astronomy extra letter
```

```
constructor    con-struc-tor        3 syllables
astronomy      a-stro-no-my         4 syllables
extra          ex-tra               2 syllables
letter         let-ter              2 syllables
```

Spanish (and Romanian) won't start a syllable with *s* plus a consonant, so they split *cons-truc-tor* and *pas-ta*; Italian and English allow *st-*, so *pa-sta* and *con-struc-tor*. Double consonants split between syllables (*tut-to*, *let-ter*). In *país*, the accent on the *í* breaks the vowel pair into two syllables (*pa-ís*), while in *ciudad* the *iu* is one.

English dictionaries often split differently (*as·tron·o·my*), because they also follow word structure and stress, which this simple model ignores. Syllable boundaries inside a word are one of the open debates of phonology; the onset rules are not.

## Check yourself

1. Write the CV shape of *spring*, *Romania*, *eat* and *texts*.
2. Run `node syllabify.js ro constructor castravete mâine`. How does Romanian compare with Spanish and Italian?
3. Why can't *ngak* be an English word, although it is a fine Vietnamese syllable? (Hint: where can [ŋ] appear in English?)
