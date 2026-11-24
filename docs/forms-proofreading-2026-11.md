# Liturgical forms: source corrections (November 2026)

A proofread of the 30 liturgical forms and readings in `public/documents/` (synced from
`Aussie-App-Studio/crca-forms-and-documents`). These need fixing **in that repo**, not here:
synced files are never edited by hand.

The website already hides some of these on screen (`src/lib/crcaDocs/liturgy.ts`): sentences split
across paragraphs, `*` before footnotes, stray digits after footnote markers, ALL-CAPS headings.
They should still be fixed at source so the PDF, extension and copy/paste output are right.

Line numbers refer to the files as synced on 22/11/2026.

## Patterns across many files

1. **Placeholders** have a space before punctuation or runs of spaces ("Full Name ,", "Names      ,", "Address      ,"), and the labels vary (Name / Full Name / Names of Parents / Name of Parents). Affects Baptism I–IV, Adults, Profession, all Discipline files, Marriage, Banns, Funerals and the Ordination forms.
2. **H1 headings** split over two lines and/or in Title Case ("Form For The Celebration / Of The Lord's Supper (I)"): Lord's Supper Preparation I–II, Celebration I–V, Alternatives, Marriage, all three Ordination forms, Funerals, Calls To Worship.
3. **Salutations end with a full stop instead of a comma** ("Congregation of our Lord Jesus Christ.", "Beloved in the Lord."): Excommunication, both Re-Admission files, Office Bearers, Ministers, Marriage, Funerals.
4. **Lower-case pronouns for God** inside Bible readings (him, his, my, mine, you), mostly in Readings of the Law, Assurances of Pardon and Calls to Worship line 577.
5. **American spellings** mixed with Australian (fulfill, fulfillment, offenses, recognize, "practice" as a verb).
6. **Lord's Prayer** differs: "Your Kingdom come" in most forms, "kingdom" and "yours" in Ministers; line breaks vary.
7. **Apostles' Creed**: identical in Lord's Supper I, II and Funerals, but Funerals drops the "descended into hell" footnote and words the "catholic" footnote differently. All three have "our Lord. / Who was conceived" (should be "our Lord, / who was conceived").
8. **Print page references** ("page 185/216/285/295") in Alternatives, LS Preparation I and the Ordination forms. They mean nothing online.
9. **Reading numbers overlap**: Calls to Worship 1–50 while Law runs 12–28, Assurances 29–57, Offerings 58–71. Heading levels differ ("## A." in Calls, "### i." in Assurances).
10. **Sentences split across paragraphs or hard line breaks**: Baptism II, Adults, Profession, LS I–III, all Ordination forms, Marriage, Banns.

## By file

### Baptism I
- line 59: "so that that he/she" → "so that he/she"
- line 39: "Name of child" → "Name of Child"
- line 53: "him/her … as their own" → "his/her own" (matches II and III)

### Baptism II
- line 27 (and 55): "Name of Parents" / "Name of Children" → "Names of Parents" / "Name of Child"
- line 17: "us. [^14]", "own. [^15]", "disciples. [^16]" → no space before the marker
- lines 3–5: sentence split across two paragraphs ("could also be" / "used for…")

### Baptism III
- H1: "Children of Believers (III)" → "the Children…" (match I, II, IV)
- line 108: "We praise You, for setting" → drop the comma (Adults line 196 too)
- line 150: "child, Full Name though … eternal death is by" → "child, Full Name, though … eternal death, is, by"
- line 174: runs of spaces around "Names of Parents"; double spaces after full stops

### Baptism IV
- line 17: "one Day be presented" → "one day"

### Baptism of Adults
- line 29: "serve the Lord" → "LORD" (Psalm 100); line 51: "name of the Lord" → "LORD"
- line 85: "we have deserved" vs III "we deserve" (pick one)
- line 153: "members who … now seeks" → "seek"
- line 190: "house-hold!" [^10]" → "household!"[^10]
- lines 224, 226: "his life", "cause him … lead him" → "his/her", "him/her"
- line 240: "both young and old in love" → "both young and old, in love,"
- line 276: "which your people" → "Your"
- line 278: "as a members" → "as a member"
- line 280: "Baptised members" → "Name(s) of Baptised Member(s)"
- lines 149–151: no full stop; runs into the "(c)" paragraph

### Public Profession of Faith
- H1 has "the Public Profession"; filename and cross-references drop "the"
- lines 9–10: hard line break mid-paragraph
- line 38: "covered substantially" → add ":" (as in Adults)
- line 68: "We ask this, in the name" → drop the comma; no "Amen." before the blessing

### Lord's Supper Preparation I
- line 36: "among us, He sent" → "among us: He sent"
- footnote 2: "one person designated by him read them" → "reads"
- footnote 1: print page references
- lines 34, 46, 74 "[^n] ]" vs lines 22, 58 "[^n]]" (pick one)

### Lord's Supper Preparation II
- H1 split and Title Case

### Lord's Supper Celebration I
- line 26: "ways of death[^4] [[^5] as He describes" → "ways of death[^4] [as He describes…[^5]"
- line 75: "true Man" vs line 57 "true man"
- footnote 8: stray "6." before "Jeremiah 31:33"
- footnote 24: replacement wording needs quotation marks
- lines 51–53, 77–79: split sentences

### Lord's Supper Celebration II
- line 210: "thanksgiving[^25] or which we give thanks" → "for which"
- footnote 19: "Corinthians 11:27-29" → "1 Corinthians"
- line 26: "Saviour, also binds" → drop the comma
- lines 8–10: split sentence

### Lord's Supper Celebration III
- line 22: comma splice "covenant, they call upon us" → semicolon
- line 120: "We humbly ask You, to accept us" → drop the comma
- lines 8–10: split sentence

### Lord's Supper Celebration IV
- line 216: "O my soul!1[^9]" → remove the stray "1"
- line 88: "Give that all who share" → "Grant that"
- lines 10, 182: spoken lines with no speaker letter → add "M"

### Lord's Supper Celebration V
- line 166: "Congregation in Christ," has no speaker letter → add "M"
- line 4: "The Lord be with you" → add a full stop

### Discipline: Public Exhortations
- H1 broken over "# Discipline:" and a separate paragraph → "# Discipline: Public Exhortations re Communicant Members"
- footnote 1: "the naming the delinquent" → "the naming of"

### Excommunication
- line 5: "announce-ments" → "announcements"
- line 45: "through Him, Our Lord" → "our"; "who taught us, thus to pray" → drop the comma
- line 19: "lead you. [^10]You" → "lead you.[^10] You"
- footnote 6: looks truncated

### Re-Admission (announcement)
- footnote 1 defined but never referenced
- footnote 2: "time lapsed" → "time elapsed"

### Re-Admission (form)
- line 45: "he/she was dead … he was lost" → "he/she was lost"; "found." [^9]" → no space
- lines 7, 15: comma needed after "Full Name"

### Baptised Members Living in Unbelief and Sin
- line 11: "Address      , has not given" → remove the comma

### Resignation, Erasure and Re-Admission
- line 11: "in        weeks' time" → "in Number weeks' time"
- line 15: comma after "Full Name"

### Ordination: Office Bearers
- line 82: "practice hospitality" → "practise"
- line 102 vs line 10: "Minister of the Word/Elder/Deacon" capitalisation differs
- lines 9–10: hard break after "Names"; "ordination/ installation" stray space
- line 170: print page reference

### Ordination: Ministers
- line 313: "By the grace God" → "By the grace of God"
- line 221: "Your holy Spirit" → "Holy Spirit"
- line 7: "says your God.⏎speak tenderly" → "Speak"
- line 17: "'what shall I cry?'" → "'What"
- line 193: "'Yes, Lord, you know" → "You"; line 181 "Yes Lord" (comma)
- lines 115–121: nested quotation marks broken
- line 83: "offenses" → "offences"
- line 155: "How then, can they" → drop the comma
- line 197: second "M" directly after line 195 → remove
- line 249: "a Ransom" → "ransom"
- line 361: "are yours" → "Yours"
- lines 241–243: split sentence
- footnote 1: "unity.This" (missing space); print page reference

### Ordination: Elders and Deacons
- line 223: "prophets,[^11]1 priests" → remove the stray "1"
- line 219: two different placeholder styles ("Names" and "____Names___")
- line 364: "take heed of yourselves" → "take heed to yourselves"
- line 285: "blessed by my Father" → "My"
- line 325: "I do" → add a full stop
- line 191: question ends with "." → "?"
- line 227: "a Ransom" → "ransom"
- lines 307–309, 313–315, 329–330, 336–338, 364–366: sentences split mid-phrase

### Funerals
- line 205: stray "Other Resources" line before the footnotes → remove
- line 191: "Comforter of your children" → "Your"
- line 45: broken placeholder "Husband / Wife / Children / or whoever … bereavement ."
- line 199: "EITHER" → "EITHER:"
- footnote 18: "3b-4,17-23" (space) and no full stop
- lines 139, 145: same verse punctuated differently

### Marriage Banns
- line 8: "Place on   Day the   Date ." hard break and space runs

### Solemnisation of Marriage
- line 109: "give you peace."1[^17]" → remove the stray "1"
- line 68: "uphold Name and Name their marriage" → "in their marriage"
- line 20: "wedding of Cana" → "wedding at Cana"
- line 86: "Bride's ring is handed" → "The bride's ring"
- line 109: second ("OR") prayer has no "Amen"; first prayer "any children given them, constantly" → drop the comma
- footnote 1 says first names are used, but lines 7, 10, 52, 80 say "Full Name"
- lines 115–120: "leaving and" / "cleaving" split

### Alternatives and Options
- line 16: "page192" → "page 192"; the whole file relies on print page numbers
- H1 drops "the" ("Use Of Liturgical Forms")

### Calls to Worship
- line 241: "No so with you" → "Not so"
- line 577: "you do not take pleasure" → "You"
- line 285: "Who, being in very nature" → "who"
- line 117: "get up on a high mountain" → "go up" (as in Ministers)
- lines 451–457, 467–469: prose wrapped as verse lines

### Readings of the Law
- line 177: Matthew 22 opens without a quotation mark but closes with one (line 191)
- line 195: "The LORD said "...Be holy" → comma after "said"; quote never closed
- line 379: "his sun" → "His"
- lines 891–903, 981: "his own blood", "to him", "he bore", "his name", "To him" → capitalise
- lines 471, 485, 493: "my Father's", "my friends", "my Father" → "My"
- line 545: "It is mine to avenge" → "Mine"
- lines 321, 665, 577: "fulfill", "fulfillment" → "fulfil", "fulfilment"
- lines 337, 521: "practices"/"Practice" (verb) → "practises"/"Practise"

### Assurances of Pardon
- line 379: extra closing quote after "declares the LORD Almighty."
- line 697: stray opening quote before "You will tread"
- line 135: quote never closed after line 155
- lines 137, 163, 297, 391, 685: "you are mine", "my Spirit", "esteemed him", "his reverent", "a God like you" → capitalise
- line 187: "recognize" → "recognise"; line 109: "offenses" → "offences"
- line 665: "the Lord's great love" → "LORD's"
- line 399: "who obey Him" → add a full stop

### Readings at the Offerings
- line 135: Colossians 3:23 ends with a comma → full stop
- line 55: "fulfill" → "fulfil" (LS Preparation I already has "fulfil")
- line 103: "the Lord Jesus himself" → "Himself"

### Clean
- Greetings and Benedictions
