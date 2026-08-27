# E01 — visual strategy

> Index tồn tại nhưng planner không dùng · 80s · vertical

Written after the semantic model replayed and the collation facts were verified, and
before any composition exists. Constrained by one line in `semantics.yaml`:

```yaml
mechanism_priority:
  primary:   "giá trị của lower(email) không nằm trong index — planner xử lý hàm như hộp đen"
  secondary: "kể cả suy luận theo thứ tự cũng không cứu được"
```

Everything below serves that ordering. Broken ordering is evidence; it is never the
argument.

---

## The one image this video needs

Sargability is a question about **shape**, and that turns out to be literally true:

```
   index chứa            predicate hỏi
   ──────────            ─────────────
     email          ≠      lower( email )        →  không khớp, quét toàn bảng
```

and the fix moves the parenthesis to the other side:

```
   CREATE INDEX ... ( lower(email) )
   ──────────────────────────────
   lower( email )     =     lower( email )       →  khớp, index dùng được
```

This is not a metaphor. An index serves a predicate when the index's expression
matches the predicate's expression. The same picture also explains all three edge
cases in the package without a new drawing:

| trường hợp | hình dạng | kết quả |
|---|---|---|
| `WHERE email = lower($1)` | cột trần ở vế trái | khớp index gốc → **dùng được** |
| `WHERE lower(email) = $1` | hàm bọc quanh cột | không khớp → **seq scan** |
| `upper(email)` sau khi có index `lower(email)` | khớp sai biểu thức | không khớp → **seq scan** |

A single visual idea that survives contact with the edge cases is the one to build on.

---

## Representation journey

```
implementation        hai câu WHERE gần như giống hệt, một nhanh một chậm
        ↓
inside the structure  MỞ index ra — nó chứa gì, thật sự
        ↓
state                 planner từ chối; 2 triệu dòng bị đọc
        ↓
implementation        CREATE INDEX trên chính biểu thức
        ↓
system                pg_stat_user_indexes — index nào chưa từng được dùng
```

The turn is not from one component to another. It is **into a data structure**. The
previous four benchmarks all moved between actors, stores and code; none of them ever
opened something up to look at what was inside it. That is this video's spatial move.

## Hero mechanism

**Narration 6–12** — from *"Nhìn vào bên trong index"* to *"Bọc một hàm quanh cột là
hỏi một giá trị chưa từng nằm trong danh sách đó."*

If the viewer does not get this, nothing else in the video matters. Three directions
for it in Step 3.

## Visual rhythm — deliberately unlike the last four

A01 had a collision, C01 an accumulation, D01 a runaway loop. All three had *rising*
energy, and reaching for that again here would be habit.

This mechanism has no escalation in it. It is **a failed lookup**: you go to the
right place, you read carefully, and the thing is not there. The rhythm is
*deliberate, then still*:

```
  hai câu query        ~8s   đối chiếu, tĩnh
  mở index ra          ~6s   một động tác, rồi dừng để đọc
  DÒ TÌM               ~14s  chậm. Đây là hero. Sự dừng lại LÀ nội dung.
  từ chối + hậu quả    ~12s  đơn điệu lặp lại — 2 triệu lần cùng một việc
  aha (mô hình sai)    ~8s   tĩnh hoàn toàn
  fix                  ~12s  một động tác: dấu ngoặc đổi vế
  giá phải trả         ~10s  đường ghi
  detection + câu hỏi  ~10s  tĩnh
```

The hero shot's job is to make the viewer *wait* while a scan finds nothing. Rushing
it would destroy the only feeling the mechanism has.

## Typography role — the subject, not the label

Forced by the mechanism, not by a habit list. `cv recall` says 4/4 previous videos use
dots or marks as the unit and typography only as labels. Here the unit of information
is **a sorted string**. A dot cannot show that `Bob@corp.com` sorts before
`alice@corp.com`; a mark cannot be looked up.

So the email strings are the physical objects of this video. They have position, they
have order, and `lower()` is a transformation applied *to the glyphs themselves* —
`Bob@corp.com` → `bob@corp.com`, the capital visibly falling. That is kinetic
typography where the motion is the function under discussion, which is the only
justification for it.

## State representation — resist the mark grid

Final state is `rows_examined = 2000000`. Two million is not a quantity to draw. C01
drew 101 marks because 101 is countable and the count *was* the argument; here the
argument is "the thing wasn't in the list", and the two million is only the price.

So: **no grid of two million anything.** The cost is expressed as *monotony* — the
executor doing the same small thing over and over, computing `lower()` on row after
row — and as a single figure. Repetition over volume.

## Code representation

Real SQL from the package, as plain type on the ground. No panel, no window chrome, no
syntax-highlight theatre.

The one transformation: the `lower( )` wrapper is a **movable object**. In the broken
query it sits around the column on the left of the comparison. In the fix it moves into
the index definition. The viewer should be able to watch the parenthesis change sides.

This is distinct from C01's `code_becomes_execution`, where a statement *emitted* its
cost. Here nothing is emitted — a piece of syntax **relocates**, and the relocation is
the entire fix.

## Camera philosophy

Two levels of description of one object: *index-as-a-thing-you-created* versus
*index-as-a-list-of-values*. Moving between them is a genuine reveal, and it is the
only place a camera is obviously earned.

Everywhere else, provisional and to be decided per shot in Step 4:

- The hypothesis-elimination beat (run ANALYZE, nothing changes) **must** hold its
  frame — `preserve_comparison_geometry`. If the frame moves, "nothing changed" stops
  being visible.
- The scan beat wants stillness, not movement. The camera watching patiently while
  nothing is found is the point.

No camera gets into the shot plan without a `semantic_function`. `cv gate` reports
`UNDECLARED` in red.

## Transition philosophy

The story's spine is **hypothesis elimination**: guess → evidence → guess dies →
mechanism. Transitions between a guess and its refutation are hard cuts on an
*unchanged frame*, so the viewer can see that nothing moved. Transitions into a new
level of description (opening the index) are the only ones that may carry motion.

## Colour semantics — extending, not redefining

The channel's tokens keep their existing meanings:

| token | meaning here |
|---|---|
| `--authoritative` ochre | a value that really is stored in the index |
| `--stale` vermilion | an expression the index cannot answer |
| `--boundary` teal | expressions matching — sargable |
| `--pressure` burnt orange | the cost: rows read to find one |
| `--lost` grey | rows examined and discarded |
| `--counterfactual` | what a working lookup would have cost |

No new colour is introduced, and none is given a second meaning.

## What this video must not become

Checked against `cv recall` and against the four shots in the gallery:

- **not a grid of marks** — the unit here is a string, not a count
- **not boxes and arrows** — query → planner → index is exactly the diagram that
  explains nothing about *why* the index fails
- **not an EXPLAIN screenshot** — `Seq Scan` as text is the symptom the package's
  viewer has already seen and not understood
- **not a B-tree diagram** — the package explicitly reduces the tree to a sorted list,
  because ordering-over-stored-values is the property that decides this. Drawing tree
  levels would add structure that carries no part of the argument.
- **not a rising-energy shot** — that is the shape of the last four, and this
  mechanism has no escalation in it
