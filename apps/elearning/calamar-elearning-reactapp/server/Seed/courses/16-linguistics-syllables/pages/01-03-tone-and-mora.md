# Tone, pitch accent and morae

## Tone: pitch that changes meaning

In English, pitch carries emotion and intonation: *Really?* rises, *Really.* falls, but the word is the same. In a **tone language**, the pitch pattern on a syllable is part of the word, just like its consonants and vowels. In the *World Atlas of Language Structures*, about four in ten of the 527 languages sampled have tones; they are common in East and Southeast Asia, sub-Saharan Africa, and parts of the Americas.

**Mandarin** has four tones plus a light, "neutral" one. On the syllable *ma*:

| Tone | Pitch | Pinyin | Character | Meaning |
|---|---|---|---|---|
| 1 | high and level | mā | 妈 | mother |
| 2 | rising | má | 麻 | hemp; numb |
| 3 | low, dipping | mǎ | 马 | horse |
| 4 | falling | mà | 骂 | to scold |
| neutral | short and light | ma | 吗 | question particle |

So *māma mà mǎ ma?* (妈妈骂马吗?) means "Is mother scolding the horse?". Pinyin writes the tone with a mark over a vowel; when typing, people use numbers, and the rule for where the mark goes is simple enough for a script:

```bash
node scripts.js pinyin ma1 ma2 ma3 ma4 ma5
node scripts.js pinyin ni3 hao3 lv4 xue2 gui4 liu2 zhou1
```

```
ma1 -> mā   ma2 -> má   ma3 -> mǎ   ma4 -> mà   ma5 -> ma
ni3 -> nǐ   hao3 -> hǎo   lv4 -> lǜ   xue2 -> xué   gui4 -> guì   liu2 -> liú   zhou1 -> zhōu
```

The mark goes on *a* or *e* if there is one; on the *o* of *ou*; otherwise on the last vowel (*guì*, *liú*).

Other tone languages have more:

- **Cantonese** has six contrasting tones (nine, in traditional counts that include short syllables ending in *p*, *t*, *k*): *si1* 詩 "poem", *si2* 史 "history", *si3* 試 "try", *si4* 時 "time", *si5* 市 "market", *si6* 事 "matter".
- **Vietnamese** has six: *ma* "ghost", *mà* "but", *má* "cheek", *mả* "tomb", *mã* "horse", *mạ* "rice seedling". Its alphabet marks every tone.
- **Thai** has five: *maa* (mid) "come", *máa* (high) "horse", *mǎa* (rising) "dog".
- **Yoruba**, in Nigeria, has three level tones: *ọkọ* "husband", *ọkọ̀* "vehicle", *ọkọ́* "hoe".

Tone sounds exotic to English speakers, but every human voice can do it: tone languages are learned by children as easily as any other.

## Pitch accent

Some languages use pitch on only part of a word, or with fewer contrasts: **pitch accent**. In Tokyo Japanese, *hashi* can be:

- 箸 *há-shi* (high-low): "chopsticks";
- 橋 *ha-shí* (low-high, then a drop on a following particle): "bridge";
- 端 *ha-shi* (low-high, with no drop): "edge".

Swedish and Norwegian have two word accents: Swedish *anden* means "the duck" with one accent and "the spirit" with the other. Even English uses **stress** to tell words apart: *a RE-cord* and *to re-CORD*, *a PRE-sent* and *to pre-SENT*.

## Morae: counting time

Japanese counts not syllables but **morae** (singular *mora*), units of timing. A short syllable like *ka* is one mora; a long vowel, the moraic *n*, and the first half of a double consonant each add one. Each mora takes roughly the same time to say, and each is written with one kana (or a kana plus a small *ya*, *yu* or *yo*):

```bash
node syllabify.js ja Tōkyō Nippon Hokkaidō kitte sensei arigatō
```

```
Tōkyō        morae: to|o|kyo|o            4    syllables: too.kyoo       2
Nippon       morae: ni|p|po|n             4    syllables: nip.pon        2
Hokkaidō     morae: ho|k|ka|i|do|o        6    syllables: hok.kai.doo    3
kitte        morae: ki|t|te               3    syllables: kit.te         2
sensei       morae: se|n|se|i             4    syllables: sen.sei        2
arigatō      morae: a|ri|ga|to|o          5    syllables: a.ri.ga.too    4
```

(Long vowels are written doubled in the output: *too* is *tō*.) *Tōkyō* has two syllables but four morae: と・う・きょ・う (*kyo* is written with a full-size き and a small ょ, but it is one mora). Japanese poetry counts morae: a **haiku** has 5, 7 and 5 of them. The famous frog poem by Bashō begins *fu-ru-i-ke-ya*, "an old pond": five morae.

Ancient Greek and Latin also distinguished long and heavy syllables, and their poetry was built on patterns of long and short, not on stress.

## Check yourself

1. Write *Hokkaidō* and *Ōsaka* in morae, and check with `node syllabify.js ja`.
2. Convert these to tone marks, then check with `scripts.js pinyin`: *zhong1 guo2*, *bei3 jing1*, *xie4 xie5*.
3. Why would a word list of a tone language be ambiguous if it were written without tone marks? How do Chinese characters avoid the problem?
