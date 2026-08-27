# E01 — hero directions

**Hero question:** tại sao index trên `email` không trực tiếp trả lời được predicate
trên `lower(email)`?

Three prototypes, same semantics, same 14s, same three marker timestamps
(`probe` 2.55s · `reject` 8.91s · `seqscan` 11.88s), snapshotted at the same six
times. All three pass `cv gate`. All three are authored with no content stage and
with typography as the material, because the unit of information is a sorted string.

Silhouette distance: **A↔B 0.89 · B↔C 0.89 · A↔C 0.40.**

---

## The wording correction changed the design

The constraint was narrowed before any code:

> ~~planner treats the function as a black box~~
> A plain index on `email` indexes the expression `email`, while the predicate asks
> for `lower(email)`. Without a matching expression index on `lower(email)`, the
> existing index cannot directly satisfy that predicate.

That narrowing killed a claim I had already written down. **"The value isn't in the
index" is false as stated** — in this data `carol@corp.com` *is* one of the stored
values. What is actually true is about expressions, and the physical consequence is
about *ranges*:

```
ordered by  email                    ordered by  lower(email)
  0  CAROL@corp.com   <- matches       0  alice@corp.com
  1  Carol@corp.com   <- matches       1  bob@corp.com
  2  Dan@corp.com                      2  carol@corp.com   <- matches
  3  Eve@corp.com                      3  carol@corp.com   <- matches
  4  alice@corp.com                    4  carol@corp.com   <- matches
  5  bob@corp.com                      5  dan@corp.com
  6  carol@corp.com   <- matches       6  eve@corp.com

  matches at [0,1,6]  SCATTERED        matches at [2,3,4]  CONTIGUOUS
  no range to descend to               one range, one descent
```

Recomputed under C collation by `tools/verify-index-facts.mjs`, which fails the build
if the two shapes are not scattered-vs-contiguous.

### A second correction, after review — and this one inverted a causality

The first pass then let Direction A imply a NEW wrong rule:

> ~~matching rows are scattered → the smallest range is the whole table → that is why
> Postgres seq scans~~

That is backwards. **Even if the matching rows happened to be contiguous** — say every
address in the column were already lowercase — a plain index on `email` still would not
serve `WHERE lower(email) = $1`, because the indexed expression is not the one the
predicate evaluates. Postgres documents the fix as building the index on `lower(col)`
itself, and a B-tree does equality and range lookups on *its own* indexed expression.

So the two are now separated in `semantics.yaml`, and neither may stand in for the other:

| | |
|---|---|
| **`primary`** — the cause | plain index is built on the expression `email`; the predicate needs `lower(email)`. With no matching expression index, there is no direct indexed lookup. True regardless of the data. |
| **`demo_specific`** — a consequence | for *this* dataset and collation, ordering by `email` does not group the matching rows into a useful range. Intuition for why the raw key ordering does not rescue this predicate. **Not** a general proof of non-sargability. |

`never_say` now carries both traps explicitly, including the inverted one.

---

## Direction A — the index as the values it actually holds

**Concept.** Open the index. It is seven strings in an order. Ask which rows satisfy
the predicate, walk them one at a time, then try to draw the smallest range that
contains every match. The bracket reaches row 6. The range is the whole table.

**Semantic explanation — deliberately narrow.** An index scan is a saving only when the
matching rows sit together, because the saving *is* descending to one range instead of
reading everything. In this dataset they do not sit together. That is a concrete
consequence the viewer can watch, not the general cause — the shot says so out loud in
its own closing line.

**Key objects** — the seven strings; the lowered value beside each; a reading head;
the bracket that fails to bound.

**Camera** `expand` · `object_to_its_contents` (1.10–2.20s). Opens from the one line
you typed when you created the index to the seven values it actually holds. Without
it, the viewer never learns that this list *is* the index.

**Motion** `locate_then_fail_to_bound`. One row per 0.62s, deliberately slow: each row
has to be lowered and compared before it can be judged, which is exactly what the
executor does.

**Mute test — passes.** Three rows marked KHỚP at positions 0, 1 and 6; a bracket
spanning all seven; `7 / 7` `khoảng phải đọc`; `2.000.000`. No narration needed.

**Closing line, rewritten after review** — it had been reading as a general verdict:

> TRONG VÍ DỤ NÀY · THỨ TỰ THEO EMAIL **KHÔNG GOM CÁC DÒNG THOẢ LẠI**
> và dù chúng có liền nhau hay không — index này vẫn xây trên email, không phải lower(email)

The second line exists specifically to block the inference the first line invites.

**Edge cases**

| | reads correctly? |
|---|---|
| `email = lower($1)` | yes — one constant is one point in this order, so the range is one row |
| `lower(email) = $1` | yes — this is the drawing |
| index `lower(email)`, query `upper(email)` | yes — same picture, relabelled: matches scatter through *that* order |

**Failure modes.** The viewer could read "vì chữ hoa/chữ thường" instead of "vì thứ tự
theo `email` không gom nhóm theo `lower(email)`" — mitigated by the standing
`SẮP XẾP THEO email` label, which names what the order is *on*. Second: densest of the
three; seven rows × two columns is a lot to hold.

## Direction B — the expression is the object

**Concept.** Stack the two expressions and align them on the substring they share.
`email` lines up with `email`. `lower(` and `)` have nothing above them.

**Semantic explanation.** An index serves a predicate when the index's expression
matches the predicate's expression. Drawn literally: what sticks out past the shared
column is what makes them different expressions.

**Key objects** — two expressions; the shared column; teal ties where they agree;
vermilion connectors that reach up into nothing.

**Camera** `static` · `preserve_comparison_geometry`. A two-sided comparison needs both
sides to stay put.

**Motion** `wrap_then_fail_to_match`. The predicate is shown *identical* to the index
expression first; then `lower(` and `)` arrive from outside and clamp onto the column.
The mismatch is something that happens, not a fact handed over.

**Mute test — partial.** You see two expressions that are not the same, and which part
differs. You do **not** see why that costs anything.

**Edge cases** — the strongest of the three here, because the wrapper's *position* is
the whole question:

| | reads correctly? |
|---|---|
| `email = lower($1)` | **best of the three** — the wrapper is around the parameter, not the column, so the left side still reads `email` and still matches |
| `lower(email) = $1` | yes |
| index `lower(email)`, query `upper(email)` | **best of the three** — two different wrappers, visibly not the same shape |

**Failure modes.** It states a rule beautifully and never shows a consequence. Also the
sparsest frame of the three: two lines of type in a 1080×1920 canvas leaves a lot of
nothing.

## Direction C — work already done vs work done again, every row

**My own third model.** Not a combination of A and B: neither of them is about *when*
a value gets computed.

**Concept.** An index is work paid for at write time and kept. Two times share one
space, split by a rule. Left: values computed at write time, present from frame one.
Right: values computed at read time — they appear, get compared, and **vanish**,
because nothing stores them. The next row pays again.

**Semantic explanation.** You can only reuse work somebody already did. Depth here is
*permanence*, not blur: one layer persists, the other cannot.

**Camera** `static` · `two_times_one_place`.

**Motion** `absent_then_recomputed_per_row` — appear, compare, discard, seven times.

**Mute test — passes.** Left column never changes; right column keeps producing and
losing values; `KHÔNG GIỮ LẠI GÌ`.

**Edge cases**

| | reads correctly? |
|---|---|
| `email = lower($1)` | yes — `lower($1)` is computed once before the scan, not per row |
| `lower(email) = $1` | yes |
| index `lower(email)`, query `upper(email)` | yes — lower is stored, upper is not |

**Failure modes — and one is disqualifying for the hero.** It implies **precomputing is
sufficient**, when an index is precomputed *and ordered*. A viewer could conclude that
a stored generated column with no index would fix this. It would not. Also the highest
cognitive load: fourteen strings in two columns, and the right-hand values are on
screen for 0.56s each — easy to miss entirely.

---

## Scores

Novelty deliberately not weighted above correctness or clarity.

| | technical correctness | mechanism clarity | mute test | cognitive load (low=good) | specificity | memorability | fits Step 2 | wrong-rule risk (low=good) |
|---|---|---|---|---|---|---|---|---|
| **A** | 5 | **5** | **5** | 3 | 4 | 4 | 4 | **4** |
| **B** | 5 | 3 | 3 | **5** | 5 | **5** | 5 | 3 |
| **C** | 4 | 4 | 4 | 2 | 4 | 4 | 3 | **2** |

## Selected: a SEQUENCE, B then A

The review changed this from "A is the hero" to an ordered pair, because the two
directions carry different halves of the explanation and the order between them is
load-bearing.

**B goes first, and B carries the cause.** `email` and `lower(email)` are two different
indexed-expression spaces. This is the rule that holds no matter what is in the table,
and it is the only one of the three that states it. It also explains both edge cases
cleanly, which is how you can tell it is the general statement.

**A goes second, and A carries the consequence.** Now that the viewer knows the index
is built on `email`, opening it and watching the matching rows land at 0, 1 and 6 shows
what that costs *here*. Arriving after B, A can no longer be misread as the cause —
and its closing line says so anyway.

**Then the fix**: build the index on `lower(email)`, and the same lookup becomes a
direct descent in the matching expression space. Merging B and A into one diagram was
considered and rejected: the merged frame would have to assert the rule and demonstrate
the consequence simultaneously, which is how a mechanism turns back into a schematic.

**C is rejected as the hero** for the disqualifying reason above: precomputation
without ordering is not an index, and the shot cannot say so. Its one strong image —
the right-hand column producing and losing values, `KHÔNG GIỮ LẠI GÌ` — is exactly
right for the **trade-off** beat, where the fix moves that work to the write path.
Kept for Step 4, not thrown away.

## The R&D question

> Can "the indexed expression must match the expression being searched" become a
> visual mechanism rather than a textual rule?

**Yes, but not in one image, and the order matters.** B turns the *rule* into a physical
shape — a wrapper with nothing above it — and does it very well. What B cannot do is
make the rule *cost* anything; it explains matching, not scanning. A supplies the
missing half.

The review sharpened this further: A cannot lead, because a consequence shown before
its cause gets adopted AS the cause. Run alone, A teaches "scattered rows cause seq
scans", which is false. Run after B, the same footage teaches "and here is what that
mismatch costs in this table".

So the concept splits into two visual mechanisms in a fixed order — rule, then
consequence, then fix. Forcing both into one shot is what would produce a diagram.
