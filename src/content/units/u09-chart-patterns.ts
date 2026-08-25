import type { Unit } from '@core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Unit 09 — Chart Patterns
// The named formations, built directly on Unit 8's primitives: trend, levels,
// volume, volatility. Every pattern here is decomposed into the crowd situation
// that produces it, its measured move, its invalidation level, and an honest
// account of how often it fails. Terminology matches PATTERN_LABELS in
// src/content/drills/patterns.ts so the lessons and the drills speak one
// language.
// ─────────────────────────────────────────────────────────────────────────────

export const u09: Unit = {
  id: 'u09',
  title: 'Chart Patterns',
  order: 9,
  description:
    'Name the formations honestly. Double tops and bottoms, head and shoulders, triangles, flags, cups, wedges, breakouts and fakeouts, and one-to-three-bar candlestick reads — each decomposed into the crowd behaviour that builds it, its measured move, the level that says you are wrong, and its real failure rate.',
  unlockAfter: 'u08',
  lessons: [
    // ── L01 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l01',
      unitId: 'u09',
      order: 1,
      title: 'How Patterns Form',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **chart pattern** is a recurring arrangement of highs and lows that appears because a recurring *situation* appears. The shape is the symptom. The situation is the cause, and it is always about people and orders.

Three situations produce nearly every formation in this unit:

- **Trapped buyers.** People who bought into a rally and watched it fail hold a loss and a plan: *get out at breakeven*. Their resting sell orders become **overhead supply** — a real inventory of shares with a stated exit price.
- **Absorbed supply.** A large buyer working an order over weeks repeatedly stops declines at similar prices. The floor looks flat while the highs creep up, because the buyer keeps paying a little more.
- **Compressed disagreement.** Two groups with different horizons trade an ever-narrower range until one side gives up. Every triangle and wedge in this unit is a picture of that.

None of this requires anyone to believe in chart patterns. It requires only memory, clustered resting orders, and institutional positions too large to fill in an afternoon.`,
        },
        {
          kind: 'example',
          md: `**Counting the trapped.** A stock climbs from **$40** to **$52** over three weeks on roughly **3.0M** shares a day — call it **45M** shares changing hands, the bulk of them between **$46** and **$52**. Then guidance disappoints and it slides to **$38** over the following two months on lighter volume.

Every buyer in that $46–52 band is now down between **17%** and **27%**. That is not a mood; it is inventory.

Watch what happens on the recovery. Price returns to **$46.40** and stalls. Weeks later it reaches **$46.10** and stalls again. A third attempt tops at **$45.80**. Volume on the three attempts: **2.1M**, **1.4M**, **900k**.

Three lower highs into a band that took **45M** shares to build, on fading participation each time. Draw a line across those highs and you have named something. But the line did not stop the stock — the trapped inventory did, and the falling volume says the buyers arriving are far too few to clear it.`,
        },
        {
          kind: 'text',
          md: `**Context outranks shape, always.** The identical arrangement of pivots means different things in different places. Before naming anything, answer three questions in this order:

1. **What is the trend?** A tight sideways range after a 40% advance is a pause in a trend. The same range after a 70% collapse is a company being repriced, and the shape carries far less information.
2. **Where is it, relative to levels?** A base built directly under a well-tested resistance zone has a specific obstacle overhead. The same base in clear air does not.
3. **What is volume doing?** Contraction into the pattern and expansion out of it is the signature that the situation actually resolved. Without it you have a drawing.

This ordering is why Unit 8 came first. Trend, levels and volume are not accessories to pattern recognition — they are the evidence, and the shape is a shorthand for summarising them.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "The pattern causes the move."

Patterns cause nothing. They *describe a state* — where supply sits, who is trapped, whether participation is arriving or leaving. There is a modest self-fulfilling element (enough people watch the same neckline that orders cluster there), but it is small and it cuts both ways: crowded levels are also the easiest to sweep. When a pattern "works", the mechanism is the supply-and-demand situation underneath it, and when that situation is absent the shape is decoration.`,
        },
        {
          kind: 'callout',
          md: `**The apophenia problem.** Human vision is a pattern-finding machine that does not know how to return "nothing here". Generate 250 bars of pure random walk and you will find a head and shoulders, a double bottom and two credible triangles inside it — researchers have been demonstrating this since the 1960s, and beginners consistently rate simulated random charts as full of signals.

One test keeps you honest: **could you have drawn this before the last pivot printed?** If the pattern only became visible once the final swing completed it, you did not identify a pattern — you narrated one.`,
        },
        {
          kind: 'keypoint',
          md: `Patterns are pictures of three crowd situations: trapped buyers creating overhead supply, absorbed supply creating flat floors, and compressed disagreement creating converging ranges. Read trend, then location, then volume — the shape is a summary of those, never a substitute. And a shape only visible after the last pivot printed is a story, not a signal.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l01-q1',
          prompt:
            'A stock trades 45M shares between $46 and $52, then falls to $38. Why does the $46–52 band act as resistance on the way back up?',
          choices: [
            'Because charting software marks the band automatically',
            'Because moving averages are calculated from that range',
            'Because 45M shares are held at a loss there and those holders have sell orders near breakeven',
            'Because $46 and $52 are round numbers',
          ],
          answerIdx: 2,
          explain:
            'The band is an inventory of trapped positions: everyone who bought between $46 and $52 has a stated exit price, and those resting sell orders are literal supply the stock must absorb. The effect is behavioural and mechanical, not a property of the software or of the numbers themselves — neither $46 nor $52 is round, and the band would work identically at $47.30.',
        },
        {
          id: 'u09-l01-q2',
          prompt:
            'On three attempts to reclaim that band, the stock tops at $46.40, $46.10 and $45.80 on volume of 2.1M, 1.4M and 900k. What does the volume sequence add?',
          choices: [
            'Fewer buyers are arriving each time, against supply that has barely been dented',
            'Nothing — volume is unrelated to resistance',
            'The stock is being accumulated, since volume is falling into support',
            'A breakout is now guaranteed on the fourth attempt',
          ],
          answerIdx: 0,
          explain:
            'Participation is shrinking on each attempt while the overhead inventory is essentially untouched, so each rally has less fuel than the last — the lower highs and the fading volume tell the same story twice. Falling volume into *resistance* is weakness; the accumulation reading would require price holding up on shrinking supply, and nothing about a fourth attempt is guaranteed.',
        },
        {
          id: 'u09-l01-q3',
          prompt: 'In what order should you read a chart before naming a pattern?',
          choices: [
            'Name the shape first, then check whether the trend agrees',
            'Trend, then location relative to levels, then volume — the shape summarises those',
            'Volume first, since it is the only unsigned quantity',
            'Indicators first, since they remove subjectivity',
          ],
          answerIdx: 1,
          explain:
            'Trend sets the meaning, location sets the obstacles, and volume says whether the situation actually resolved; the pattern name is shorthand for that evidence. Naming the shape first is how confirmation bias enters — once you have said "bull flag" out loud, you will read the trend and volume to fit it.',
        },
        {
          id: 'u09-l01-q4',
          prompt:
            'You spot a textbook head and shoulders, but it only became visible once the final right-shoulder pivot completed. What does that tell you?',
          choices: [
            'It is a high-quality pattern, since all three pivots are confirmed',
            'It is invalid because head and shoulders requires a fourth pivot',
            'You narrated the pattern rather than identified it — the honest test is whether you could have drawn it beforehand',
            'Nothing; every pattern is only visible once complete',
          ],
          answerIdx: 2,
          explain:
            'If the shape only appeared after the last swing filled it in, your recognition carried no forward information — which is exactly how random walks generate convincing formations. It is true that patterns complete over time, but a usable one lets you mark the neckline and the invalidation level in advance and then watch price interact with them.',
        },
        {
          id: 'u09-l01-q5',
          prompt: 'Which best describes the self-fulfilling element in chart patterns?',
          choices: [
            'It is the primary reason patterns work, since most volume is pattern-driven',
            'It is real but modest — clustered orders help, and also make those levels the easiest to sweep',
            'It does not exist; markets ignore where retail traders place orders',
            'It guarantees a pattern works once enough people can see it',
          ],
          answerIdx: 1,
          explain:
            'Enough participants watch the same neckline that orders genuinely cluster there, which adds a little reality to the level — but crowded, obvious price points are also the ones most efficiently swept, so the effect cuts both ways. Treating self-fulfilment as the main engine ignores the trapped-supply and absorption mechanics that do most of the work.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l01-c1',
          kind: 'basic',
          front: 'Name the three crowd situations that produce most chart patterns.',
          back: 'Trapped buyers creating overhead supply; absorbed supply creating a flat floor while highs creep up; and compressed disagreement, where a narrowing range shows one side about to give up.',
        },
        {
          id: 'u09-l01-c2',
          kind: 'cloze',
          front:
            'Read a chart in this order: ____, then ____ relative to levels, then ____. The pattern name only summarises those three.',
          back: 'trend; location; volume',
        },
        {
          id: 'u09-l01-c3',
          kind: 'basic',
          front: 'What is the honest test that you identified a pattern rather than narrated one?',
          back: 'Could you have drawn it — neckline, boundaries, invalidation level — *before* the last pivot printed? If it only became visible afterwards, it carried no forward information.',
        },
        {
          id: 'u09-l01-c4',
          kind: 'basic',
          front: 'Why is a pattern found on random data still convincing?',
          back: 'Human vision is a pattern-finding machine with no way to report "nothing here". A 250-bar random walk reliably contains head and shoulders, double bottoms and triangles — which is why context and volume, not shape, carry the evidence.',
        },
      ],
    },

    // ── L02 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l02',
      unitId: 'u09',
      order: 2,
      title: 'Double Tops & Bottoms',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **Double Top** is a rally that fails twice at roughly the same price, with a meaningful trough in between. The app's drills label it exactly that; the mirror image is a **Double Bottom**.

The anatomy has four parts, and all four matter:

- **Two peaks** at a similar level — conventionally within about **3%** of each other. Much closer and it is one extended top; much further apart and the second peak is simply a lower high inside a decline.
- **A trough** between them, deep enough to be a real correction — a rough guide is **10–20%** of the preceding advance, over at least a few weeks.
- **The neckline**: the horizontal line drawn through the trough low. It is the only part of the pattern that carries a decision.
- **A break**: a *close* below the neckline. Until that happens there is no double top, only resistance tested twice.

The situation underneath: buyers pushed to a level, met the same supply twice, and could not clear it. The trough low is where the last committed buyers stepped in. Break that, and the people who bought both attempts *and* the dip are all offside at once.`,
        },
        {
          kind: 'example',
          md: `**A double top with the arithmetic.** A stock advances from **$44** to **$62.40** over four months, then:

| Stage | Price | Volume |
|---|---|---|
| First peak | $62.40 | 4.2M/day into the high |
| Trough low | $54.00 | 1.3M (quiet) |
| Second peak | $61.80 | 2.0M into the high |
| Neckline break (close) | $53.20 | 3.1M vs 1.2M average |

- The peaks are **$0.60** apart — under **1%**. That qualifies.
- The trough retraced **$8.40** of an **$18.40** advance: **46%**. Deep enough to be a genuine correction rather than a pause.
- Volume into the second peak was **less than half** the first. The same wall, fewer attackers.
- **Measured move:** pattern height = **$62.40 − $54.00 = $8.40**, projected down from the neckline: **$54.00 − $8.40 = $45.60**.
- **Invalidation:** a close back above the neckline zone, roughly **$55**, says the break failed. From an entry near $53.20 that is about **$1.80** of risk per share, against **$7.60** to the measured target — before you discount the target.`,
        },
        {
          kind: 'text',
          md: `**The Double Bottom** inverts everything: two lows at a similar price, a peak between them, a neckline through that peak, and confirmation on a *close above* it. One asymmetry is real, though: **downside breaks can happen on their own weight, upside breaks need fuel.** A double bottom that breaks its neckline on below-average volume is a much weaker proposition than a double top that breaks down quietly. Gravity is free; buying is not.

Two refinements worth carrying:

- A slightly **higher** second low in a double bottom (say $30.10 after $29.80) is generally healthier than an exactly equal one — it shows buyers stepped in earlier.
- A **failed** second peak that never even reaches the first (say $58 after $62.40) is not a double top; it is a lower high, which is a *stronger* piece of trend evidence but a different pattern.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Two peaks at the same price means a double top — sell."

Most price action that looks like a double top never becomes one. Resistance gets tested twice constantly, and the majority of those tests resolve by breaking *out* rather than breaking down. There is no pattern until the neckline gives way on a closing basis. Acting at the second peak means trading a level, not a pattern — a legitimate thing to do, but you should know which one you are doing, because the invalidation levels are completely different.`,
        },
        {
          kind: 'callout',
          md: `**How reliable, honestly?** The published survey figures — the widely cited pattern encyclopaedias put double-top failure rates in the region of **1 in 5 to 1 in 3** after a confirmed break, and measured targets being reached perhaps two-thirds of the time — come from hand-selected samples, tuned definitions and no trading costs. Treat them as **ceilings, not expectations**. The defensible version: after a confirmed neckline break, continuation is somewhat more likely than reversal, the target is a region rather than a price, and roughly a quarter of clean-looking breaks reverse straight back through the neckline.`,
        },
        {
          kind: 'keypoint',
          md: `Double Top = two failed attempts at a level, a trough between, and a **close below the neckline** — no break, no pattern. Measured move = peak-to-neckline height projected from the neckline. Watch for lower volume into the second peak. Double Bottom mirrors it, but upside breaks need volume where downside breaks do not.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l02-q1',
          prompt:
            'A stock peaks at $62.40, troughs at $54.00, peaks again at $61.80, and then closes at $53.20. What is the measured move target?',
          choices: [
            'About $61.80, the second peak',
            'About $45.60 — the $8.40 height projected down from the $54.00 neckline',
            'About $44.00, the origin of the advance',
            'About $49.80, half the pattern height below the neckline',
          ],
          answerIdx: 1,
          explain:
            'The measured move takes the pattern height — peak $62.40 minus neckline $54.00, so $8.40 — and projects it from the break level: $54.00 − $8.40 = $45.60. Halving the height is a made-up rule, and the origin of the advance has nothing to do with the projection; the convention is a full height, and even that is a region rather than a price.',
        },
        {
          id: 'u09-l02-q2',
          prompt: 'What single event turns "resistance tested twice" into a confirmed double top?',
          choices: [
            'The second peak coming in below the first',
            'RSI reaching 70 at the second peak',
            'A close below the neckline — the trough low between the peaks',
            'A gap down from the second peak',
          ],
          answerIdx: 2,
          explain:
            'The neckline break on a closing basis is the entire confirmation; before it you have a level that held twice, which resolves upward at least as often as it resolves down. A slightly lower second peak is normal but proves nothing on its own, and indicator readings or gaps are not part of the pattern definition.',
        },
        {
          id: 'u09-l02-q3',
          prompt:
            'In the example, volume into the second peak was 2.0M versus 4.2M into the first. Why does that matter?',
          choices: [
            'It means the stock is now illiquid and should be avoided',
            'It proves institutional selling, since volume always signals direction',
            'It guarantees the neckline will break',
            'The same overhead supply is being attacked by roughly half as many buyers',
          ],
          answerIdx: 3,
          explain:
            'Volume measures participation, so a second assault on the same wall with half the buyers is weaker evidence that the wall will fall — the classic double-top signature. It guarantees nothing, and volume is unsigned: it cannot prove selling any more than buying, since every share sold is a share bought.',
        },
        {
          id: 'u09-l02-q4',
          prompt:
            'Why does a Double Bottom breaking upward on below-average volume deserve more scepticism than a Double Top breaking downward on below-average volume?',
          choices: [
            'Because downside breaks can occur on an absence of buyers, while upside breaks require actual buying',
            'Because short sellers are legally required to cover on neckline breaks',
            'Because volume data is unreliable on down days',
            'Because double bottoms are rarer than double tops',
          ],
          answerIdx: 0,
          explain:
            'Price can fall simply because nobody is bidding, but it cannot rise without someone paying up — so participation is more diagnostic on upside breaks. The asymmetry is mechanical; nothing about short-covering rules, data quality or relative frequency is involved.',
        },
        {
          id: 'u09-l02-q5',
          prompt: 'How should published double-top success statistics be treated?',
          choices: [
            'As reliable, since they come from large historical databases',
            'As ceilings — they come from hand-selected samples, tunable definitions and no trading costs',
            'As irrelevant, since chart patterns cannot be studied at all',
            'As floors — real-world results usually beat them once you gain experience',
          ],
          answerIdx: 1,
          explain:
            'Pattern surveys select clean examples, define "valid" in ways that can be tightened or loosened after the fact, and quote gross results, so the published figures sit above anything you should plan around. They are not worthless — patterns can be studied — but experience does not push you past them; costs and messy real-time identification push you below.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l02-c1',
          kind: 'cloze',
          front:
            'Double Top measured move: height = ____ minus ____, projected ____ from the neckline.',
          back: 'the peak; the neckline (trough low); downward',
        },
        {
          id: 'u09-l02-c2',
          kind: 'basic',
          front: 'What are the four parts of a double top?',
          back: 'Two peaks within roughly 3% of each other; a genuine trough between them; the neckline drawn through the trough low; and a *close* beyond the neckline, which is the only part that confirms anything.',
        },
        {
          id: 'u09-l02-c3',
          kind: 'basic',
          front: 'Volume signature of a classic double top',
          back: 'Lower volume into the second peak than the first — the same overhead supply attacked by fewer buyers — then volume expansion on the neckline break.',
        },
        {
          id: 'u09-l02-c4',
          kind: 'basic',
          front: 'Why are upside neckline breaks judged more strictly than downside ones?',
          back: 'Price can fall on an absence of bids, but it can only rise if someone pays up. So a double bottom breaking out on thin volume is far weaker evidence than a double top breaking down on thin volume.',
        },
      ],
    },

    // ── L03 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l03',
      unitId: 'u09',
      order: 3,
      title: 'Head & Shoulders',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `**Head and Shoulders** — the app's drills use exactly that label — is three peaks: a **left shoulder**, a higher **head**, and a **right shoulder** that fails to reach the head. The **neckline** connects the two troughs.

Its real content is structural, and Unit 8 already gave you the vocabulary for it:

> A head and shoulders is **a failed higher high followed by a broken support level** — which is precisely the moment an uptrend becomes a downtrend.

That is why it is taken more seriously than most shapes. It is not a magic silhouette; it is the trend definition (lower high, then lower low) drawn out over three swings, with a specific level attached.

The **Inverse Head and Shoulders** is the same structure upside down: a failed lower low followed by a broken resistance level, marking a downtrend turning up.`,
        },
        {
          kind: 'example',
          md: `**Reading the pivots and the volume.** A stock in a year-long uptrend traces:

| Pivot | Price | Volume into the move |
|---|---|---|
| Left shoulder peak | $88.00 | 3.8M/day |
| Trough 1 | $80.20 | 1.6M |
| Head peak | $96.00 | 2.4M/day |
| Trough 2 | $79.40 | 2.0M |
| Right shoulder peak | $86.60 | 1.5M/day |
| Neckline break (close) | $78.10 | 5.2M |

Three things to notice:

1. **The volume signature.** The advance to the head came on **2.4M** against **3.8M** into the left shoulder — a new high on *less* participation. The right shoulder managed **1.5M**. Demand drained across the whole formation, and the break arrived on **5.2M**.
2. **The neckline slopes down slightly** ($80.20 to $79.40). Draw it through the actual trough lows; take the level under the second trough, about **$79.50**, as the decision line.
3. **Measured move:** height = head − neckline = **$96.00 − $79.50 = $16.50**. Target = **$79.50 − $16.50 = $63.00**, about **34%** below the head.

**Invalidation** is not the target's business: a close back above the right-shoulder peak (**$86.60**) says the structure failed. From an entry near $78.10 that is $8.50 of risk — wide, which is why many people size off a tighter level such as a close back above the neckline plus a volatility buffer, accepting more failed exits in exchange for smaller losses.`,
        },
        {
          kind: 'text',
          md: `**The retest.** After a neckline break, price very often returns to the neckline from below — that $79.50 area — and fails there. The mechanism is the role reversal from Unit 8: old support becomes resistance because the buyers trapped in the two troughs sell into the bounce. A retest that fails is the pattern's second, cleaner entry; a retest that *succeeds* in reclaiming the neckline on a closing basis is the pattern failing.

**Inverse head and shoulders has one extra requirement.** Because upside breaks need actual buying, the volume expansion on the neckline break is close to mandatory. A textbook inverse head and shoulders that breaks out on 70% of average volume is not a signal; it is a shape.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Head and shoulders is the most reliable pattern — it works almost every time."

The pattern's reputation rests on published surveys of *completed, confirmed* formations, which is a sample chosen after the fact. The real difficulty is live identification: while the right shoulder is forming, you cannot know whether it is a right shoulder or the start of another leg up, and a large fraction of promising formations simply never break the neckline. Even after a confirmed break, expect something in the region of one in four to reverse back through it.`,
        },
        {
          kind: 'callout',
          md: `**Neckline slope is not decoration.** A steeply *down*-sloping neckline means the second trough already broke the first — the damage started before the pattern completed, and the break comes so late that the measured move is often largely spent. A steeply *up*-sloping neckline usually means you have drawn a pattern across an ongoing uptrend. Mildly sloping or horizontal necklines are the ones worth trusting.`,
        },
        {
          kind: 'keypoint',
          md: `Head and Shoulders = a failed higher high plus a broken support level: the trend definition drawn over three swings. Volume should fall from left shoulder to head to right shoulder, then expand on the break. Measured move = head-to-neckline height projected from the neckline. Inverse H&S needs genuine volume on the upside break.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l03-q1',
          prompt: 'What makes head and shoulders structurally meaningful rather than merely a shape?',
          choices: [
            'It is a failed higher high followed by a broken support level — the moment an uptrend becomes a downtrend',
            'Its symmetry mirrors human anatomy, which markets subconsciously respect',
            'It is the only pattern with a measurable target',
            'It always forms over exactly three months',
          ],
          answerIdx: 0,
          explain:
            'The right shoulder is a lower high and the neckline break is a lower low, which together satisfy the structural definition of a downtrend from Unit 8 — the pattern is that definition drawn across three swings. Plenty of other patterns have measured moves, formation time varies widely, and the anatomical name is a coincidence of appearance.',
        },
        {
          id: 'u09-l03-q2',
          prompt:
            'Left shoulder peaks at $88.00, head at $96.00, right shoulder at $86.60, neckline about $79.50. What is the measured target?',
          choices: [
            'About $71.25, half the height below the neckline',
            'About $79.50, the neckline itself',
            'About $63.00 — the $16.50 head-to-neckline height projected down from $79.50',
            'About $67.10, the height projected from the right shoulder',
          ],
          answerIdx: 2,
          explain:
            'Height is head minus neckline ($96.00 − $79.50 = $16.50) and it is projected from the break level, giving $79.50 − $16.50 = $63.00. Measuring from the right shoulder or halving the height are both improvisations — and even the correct projection is a region, reached in published samples well under 100% of the time.',
        },
        {
          id: 'u09-l03-q3',
          prompt:
            'Volume into the left shoulder was 3.8M, into the head 2.4M, and into the right shoulder 1.5M. How should this be read?',
          choices: [
            'Bullish — declining volume means selling pressure is exhausted',
            'The new high was made on less participation, and demand drained across the whole formation',
            'It is meaningless because volume is unsigned',
            'It suggests the data is corrupted, since new highs require rising volume',
          ],
          answerIdx: 1,
          explain:
            'A higher high on materially lower volume says the advance is being made by fewer and fewer participants — the textbook head-and-shoulders signature, completed by the 5.2M break. Volume being unsigned does not make it meaningless: it still measures how many people cared, which is exactly the question here.',
        },
        {
          id: 'u09-l03-q4',
          prompt:
            'After the neckline break at $78.10, price rallies back to $79.40 and stalls. What is happening?',
          choices: [
            'The pattern has failed and the target is void',
            'A measuring gap is forming',
            'A random bounce with no mechanism behind it',
            'A retest — old support acting as resistance as buyers trapped in the troughs sell into the bounce',
          ],
          answerIdx: 3,
          explain:
            'This is role reversal from Unit 8: the trough buyers finally get a chance near breakeven and their orders sit right at the old neckline, so a failed retest is often the pattern’s cleaner second entry. The pattern would only be failing if price *closed* back above the neckline and held there.',
        },
        {
          id: 'u09-l03-q5',
          prompt: 'Why does an inverse head and shoulders demand volume expansion on the break more than a regular one?',
          choices: [
            'Because inverse patterns are statistically rarer',
            'Because upside breaks require actual buying, while downside breaks can occur on an absence of bids',
            'Because short sellers must cover at the neckline',
            'Because volume is reported differently on up days',
          ],
          answerIdx: 1,
          explain:
            'Rising prices need someone willing to pay up, so participation is the evidence that real demand cleared the overhead supply; falling prices need only an absence of buyers. An inverse formation that breaks out on 70% of average volume is a shape rather than a signal, whatever the silhouette looks like.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l03-c1',
          kind: 'cloze',
          front:
            'Structurally, a head and shoulders is a failed ____ high followed by a broken ____ level — the definition of a trend change.',
          back: 'higher; support (the neckline)',
        },
        {
          id: 'u09-l03-c2',
          kind: 'basic',
          front: 'Head and shoulders volume signature',
          back: 'Highest into the left shoulder, lower into the head (a new high on less participation), lowest into the right shoulder — then a clear expansion on the neckline break.',
        },
        {
          id: 'u09-l03-c3',
          kind: 'cloze',
          front:
            'H&S measured move: height = ____ minus ____, projected from the neckline in the direction of the break.',
          back: 'the head; the neckline',
        },
        {
          id: 'u09-l03-c4',
          kind: 'basic',
          front: 'What does neckline slope tell you?',
          back: 'A steep down-slope means the second trough already broke the first, so the break arrives late and much of the move is spent. A steep up-slope usually means you drew a pattern across an intact uptrend. Trust flat or mildly sloping necklines.',
        },
      ],
    },

    // ── L04 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l04',
      unitId: 'u09',
      order: 4,
      title: 'Triangles',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **triangle** is a contracting range: the highs and the lows converge, so each swing is smaller than the last. Volatility compresses, participation usually drains, and the pattern resolves when one boundary gives way.

The app's drills use three labels:

- **Ascending Triangle** — a roughly flat ceiling with **rising lows**. Sellers keep offering at one price; buyers keep raising their bids. Supply is fixed, demand is impatient.
- **Descending Triangle** — a roughly flat floor with **falling highs**. A buyer is absorbing at one price while sellers accept less and less. Demand is fixed, supply is impatient.
- **Symmetrical Triangle** — both boundaries converging on each other, with no flat side. Two groups tightening around a value neither can defend.

The convergence is the information: a market that needs a **$7** range to find balance and later needs only **$1** has run out of disagreement, and something has to give.`,
        },
        {
          kind: 'example',
          md: `**An ascending triangle, measured.** Over nine weeks a stock prints:

- **Highs:** $58.10, $57.90, $58.20, $58.00 — a ceiling within **$0.30**, call it the **$57.90–58.20** zone.
- **Lows:** $51.30, $53.70, $55.60, $56.90 — each higher than the last.
- **Range width:** first swing **$58.10 − $51.30 = $6.80**; last swing **$58.00 − $56.90 = $1.10**. The range has contracted by roughly **84%**.
- **Volume:** from **1.9M** a day early in the pattern to **600k** in the final week.

Then it closes at **$59.60** on **3.6M** shares — nearly **twice** the pattern's early-stage pace and **six times** the final week's.

- **Measured move:** take the height at the **widest** point, **$6.80**, and project it from the breakout level: **$58.00 + $6.80 ≈ $64.80**.
- **Invalidation:** a close back inside the triangle, below roughly **$57.80**. From $59.60 that is about **$1.80** of risk per share against **$5.20** to the measured target — call it a 2.9:1 target-to-risk ratio *if* the target is reached, which it frequently is not.

A **symmetrical** version of the same nine weeks would print highs of $44.60, $43.50, $42.70 against lows of $38.20, $39.40, $40.30 — converging on roughly **$41.50** with no flat side and no directional hint at all.`,
        },
        {
          kind: 'text',
          md: `**Breakout direction, honestly.** This is where triangles attract the most folklore.

- Published surveys put **ascending** triangles resolving upward in the region of **two-thirds to seven-in-ten** of cases, and **descending** triangles resolving downward at similar rates. That is a real tilt, and it is also drawn from curated samples with tunable definitions — treat it as a lean, not a rule.
- **Symmetrical** triangles are close to a coin flip, with a modest bias toward continuing the trend that preceded them. Anyone quoting a precise figure for symmetrical triangle direction is over-claiming.
- **Apex timing** matters more than most people expect. A break that occurs in the **last quarter** of the distance to the apex — where the range is a rounding error and volume has evaporated — tends to be feeble, because there is nothing left to compress. The useful window is roughly the **middle half** of the pattern's run to the apex.

**The practical stance:** do not predict the direction. Mark both boundaries, decide in advance what you will do on each break, and let price choose. A triangle is one of the few patterns that hands you a genuinely tight invalidation level, and that — not its directional forecast — is its value.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "A descending triangle is bearish, so you can short it before the break."

Two problems. First, the tilt is a tilt: something like three in ten descending triangles break *upward*, and shorting into the flat floor puts you on the wrong side of exactly those. Second, pre-positioning inside a contracting range means your invalidation is inside the noise — the range is at its tightest precisely where you would place the stop. The pattern's edge lives in waiting for the break and using the opposite boundary as the line that says you were wrong.`,
        },
        {
          kind: 'callout',
          md: `**Triangles are the easiest pattern to imagine.** Any choppy sideways period contains pivots that can be connected into converging lines if you choose which highs and lows to honour. Two disciplines help: require at least **two touches on each boundary** (so four pivots total, five is better), and require the **volume contraction** to be visible. A "triangle" with flat or rising volume and one touch per side is a range you have drawn lines on.`,
        },
        {
          kind: 'keypoint',
          md: `Triangles are contracting ranges: ascending = flat ceiling + rising lows, descending = flat floor + falling highs, symmetrical = both converging. Measured move = the widest height projected from the breakout. Ascending and descending lean toward their flat side about two-thirds of the time; symmetrical is near a coin flip. Demand two touches per boundary and visible volume contraction.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l04-q1',
          prompt: 'What defines an ascending triangle, and what does it say about participants?',
          choices: [
            'Rising highs and rising lows — buyers in complete control',
            'A roughly flat ceiling with rising lows — fixed supply at one price meeting increasingly impatient demand',
            'A flat floor with falling highs — fixed demand meeting impatient supply',
            'Any triangle that appears during an uptrend',
          ],
          answerIdx: 1,
          explain:
            'The flat ceiling is a seller repeatedly offering at one level while the rising lows show buyers willing to bid higher each time — supply fixed, demand impatient. Rising highs *and* rising lows is simply an uptrend with no ceiling at all, and the flat-floor description is the descending triangle; the label comes from the geometry, not from the surrounding trend.',
        },
        {
          id: 'u09-l04-q2',
          prompt:
            'A triangle has a ceiling near $58.00, a widest low of $51.30, and breaks out on a close at $59.60. What is the measured move target?',
          choices: [
            'About $62.65, half the height above the breakout',
            'About $66.40, the height projected from the breakout close',
            'About $64.80 — the $6.80 widest height projected from the $58.00 breakout level',
            'About $51.30, a full retrace to the pattern low',
          ],
          answerIdx: 2,
          explain:
            'The convention takes the widest part of the triangle ($58.10 − $51.30 ≈ $6.80) and projects it from the boundary that broke, giving roughly $64.80. Projecting from the closing price rather than the boundary inflates the target by however far price ran on the breakout day, and halving the height is not part of the convention.',
        },
        {
          id: 'u09-l04-q3',
          prompt: 'Which statement about triangle breakout direction is most defensible?',
          choices: [
            'Ascending and descending triangles lean toward their flat side about two-thirds of the time; symmetrical is near a coin flip',
            'All triangles break in the direction of the prior trend',
            'Symmetrical triangles break upward about 70% of the time',
            'Triangle direction is fully predictable from the volume pattern',
          ],
          answerIdx: 0,
          explain:
            'A genuine but moderate tilt toward the flat boundary is what the curated surveys support, while symmetrical triangles carry at most a mild continuation bias — precise figures for them are over-claims. "Always continues the prior trend" fails on the many reversal triangles, and volume tells you whether a break is real, not which way it will come.',
        },
        {
          id: 'u09-l04-q4',
          prompt: 'Why is a breakout in the final quarter of the distance to the apex usually weak?',
          choices: [
            'Because charting software stops updating trendlines near the apex',
            'Because the range and volume have already compressed to nothing — there is no stored energy left to release',
            'Because apex breakouts are always false by definition',
            'Because the measured move is calculated from the apex',
          ],
          answerIdx: 1,
          explain:
            'By the last quarter the swings are a rounding error and participation has evaporated, so the "coiled spring" the pattern is supposed to represent has already unwound — the useful window is roughly the middle half of the run to the apex. Such breaks are weak on average, not false by definition, and the measured move is always taken from the widest part of the pattern.',
        },
        {
          id: 'u09-l04-q5',
          prompt: 'What are the two minimum disciplines that separate a real triangle from lines drawn on chop?',
          choices: [
            'A round-number apex and a symmetrical shape',
            'At least five weeks of duration and an RSI reading below 50',
            'A gap into the pattern and a gap out of it',
            'At least two touches on each boundary, and visible volume contraction into the apex',
          ],
          answerIdx: 3,
          explain:
            'Two touches per boundary means the lines are describing repeated behaviour rather than convenient pivots, and contracting volume is the physical evidence that disagreement is actually narrowing. Duration, symmetry, round numbers and indicator readings are not part of the definition, and a "triangle" on flat volume with one touch per side is just a range with lines on it.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l04-c1',
          kind: 'cloze',
          front:
            'Ascending Triangle = flat ____ with ____ lows. Descending Triangle = flat ____ with ____ highs. Symmetrical = both boundaries ____.',
          back: 'ceiling; rising; floor; falling; converging',
        },
        {
          id: 'u09-l04-c2',
          kind: 'cloze',
          front:
            'Triangle measured move: take the height at the ____ point of the pattern and project it from the ____ that broke.',
          back: 'widest; boundary (breakout level)',
        },
        {
          id: 'u09-l04-c3',
          kind: 'basic',
          front: 'Honest base rates for triangle breakout direction',
          back: 'Ascending/descending lean toward their flat side roughly two-thirds to seven-in-ten of the time in curated samples; symmetrical is close to a coin flip with a mild continuation bias. Treat all of it as a lean, never a rule.',
        },
        {
          id: 'u09-l04-c4',
          kind: 'basic',
          front: 'Why does apex timing matter?',
          back: 'Breaks in the last quarter of the run to the apex tend to be feeble — range and volume have already compressed to nothing, so there is no stored energy to release. The useful window is roughly the middle half.',
        },
      ],
    },

    // ── L05 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l05',
      unitId: 'u09',
      order: 5,
      title: 'Flags & Pennants',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **flag** is the shortest and most trend-dependent pattern in the unit, and it has a prerequisite that most people skip: **the pole**.

- **The pole** is a sharp, near-vertical move — days, not months — on heavy volume. It is the whole reason the pattern exists.
- **The flag** is a tight, shallow drift *against* the pole on shrinking volume, usually one to three weeks.
- **The break** is a resumption in the pole's direction, ideally on volume expansion.

The app's drills label these **Bull Flag** (pole up, drift down) and **Bear Flag** (pole down, drift up).

The situation underneath is simple. A violent move leaves two groups: people who got in and are sitting on fast profits, and people who missed it. The first group takes some profit, which produces the drift; the second group's limit orders sit just below, which stops the drift from going far. When the profit-takers are done and the latecomers are still there, the trend resumes.

**No pole, no flag.** A quiet sideways range that was not preceded by a sharp move is a *Consolidation* — which is a legitimate drill label of its own, and a completely different proposition.`,
        },
        {
          kind: 'example',
          md: `**A bull flag with the numbers.** A stock that has been trading around **1.2M** shares a day runs from **$22.40** to **$31.20** in nine sessions — a **$8.80**, **39%** pole, on volume averaging **4.1M**.

Then it drifts for eleven sessions:

- Flag highs step down from **$31.20** to **$30.10**; flag lows from **$29.40** to **$28.60** — a narrow, gently down-sloping channel.
- The retracement is **$31.20 − $28.60 = $2.60**, which is **30%** of the $8.80 pole. Comfortably inside the healthy zone.
- Volume falls to about **1.1M** — a *quarter* of the pole's participation. Nobody is fighting; the sellers are simply the people booking profits.

It then closes at **$31.40** on **3.9M** shares.

- **Measured move:** add the pole height to the breakout point. From the flag's upper boundary near **$30.60**: **$30.60 + $8.80 = $39.40**. The conservative version projects from the flag *low*: **$28.60 + $8.80 = $37.40**. Quote the range, **$37–39**, and treat it as a region.
- **Invalidation:** a close back below the flag low, **$28.60**. From $31.40 that is **$2.80** of risk per share against roughly **$6–8** of target — the reason flags are popular is this tight, obvious invalidation level, not any special accuracy.`,
        },
        {
          kind: 'text',
          md: `**Rules that keep a flag a flag:**

- **Depth.** A retracement beyond roughly **half** the pole is not a flag. At 50%+ the "profit-taking" story stops fitting and you are looking at a genuine fight, or a reversal.
- **Duration.** One to three weeks. Past four or five weeks the tight drift becomes a base, the latecomers give up, and the urgency that defines the pattern is gone. It may still break out — as a Consolidation, on different logic.
- **Slope.** The drift should lean *against* the pole. A "flag" that drifts upward after an up-pole is just continued buying, and a flag that drifts sideways is a pause.
- **Volume.** Contracting through the flag, expanding on the break. A flag on rising volume is distribution wearing a flag's clothes.

A **pennant** is the same pattern with a small symmetrical triangle in place of the channel — converging boundaries rather than parallel ones. Everything above applies unchanged; the distinction is cosmetic, and the app's drill set treats the flag labels as the operative ones.

**Bear flags** invert it all: a sharp decline, then a tight *upward* drift on falling volume, then a break down. One caution specific to them — a bear flag in a violently oversold stock can be indistinguishable from the first leg of a genuine bottom, and the drift lasting more than a couple of weeks is the tell that it is becoming the latter.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Any sideways period after a rally is a bull flag."

The pole is the pattern. Without a sharp, high-volume move immediately before it, there is no group of fast-profit holders to produce the drift and no group of latecomers waiting underneath — so the mechanism that makes flags work is simply absent. Three checks: was the run sharp and on heavy volume; is the retracement under half the pole; is the drift under about three weeks? Fail any of them and the honest label is **Consolidation**.`,
        },
        {
          kind: 'callout',
          md: `**Why flags flatter backtests.** Flags are defined *relative to* a move that already happened, so any historical scan for them is scanning for stocks that had just risen sharply — and momentum means such stocks continued somewhat more often than chance regardless of the drift shape. A large part of the flag's apparent success is the pole's momentum, not the flag. This is not a reason to ignore them; it is a reason to attribute the edge to the trend and use the flag for its invalidation level.`,
        },
        {
          kind: 'keypoint',
          md: `Flag = pole (sharp, heavy-volume move) + tight counter-trend drift on falling volume + resumption. Retrace under half the pole, duration one to three weeks, volume contracting. Measured move = pole height added to the breakout. No pole means it is a Consolidation, not a flag — and much of the flag's edge belongs to the pole's momentum.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l05-q1',
          prompt: 'What is the prerequisite that distinguishes a bull flag from an ordinary consolidation?',
          choices: [
            'The pole — a sharp, high-volume move immediately before the drift',
            'A duration of at least four weeks',
            'A retracement of at least 60% of the prior move',
            'An RSI reading above 70 during the drift',
          ],
          answerIdx: 0,
          explain:
            'The pole creates the two groups the pattern depends on — fast-profit holders who produce the drift and latecomers whose bids stop it — so without it the mechanism is absent and the honest label is Consolidation. A deep retracement and a long duration are the two things that *disqualify* a flag, and indicator readings are no part of the definition.',
        },
        {
          id: 'u09-l05-q2',
          prompt:
            'A pole runs $22.40 to $31.20 and the flag bottoms at $28.60. What is the retracement, and is it acceptable?',
          choices: [
            '$2.60, which is 30% of the pole — deeper than a flag should be',
            '$8.80, a 100% retracement, so the flag has failed',
            '$2.60, which is 30% of the $8.80 pole — comfortably inside the healthy range',
            '$2.60, or 8% of the stock price, which is the relevant measure',
          ],
          answerIdx: 2,
          explain:
            'The retracement is measured against the pole, not the share price: $2.60 of an $8.80 pole is 30%, and the working limit is roughly 50%. Beyond half the pole the profit-taking story stops fitting and you are looking at a real fight or a reversal, which is a different pattern with a different invalidation level.',
        },
        {
          id: 'u09-l05-q3',
          prompt:
            'Pole $22.40 to $31.20; the flag breaks out over its upper boundary near $30.60. What is the measured move?',
          choices: [
            'About $31.20, a retest of the pole high',
            'About $35.00, half the pole above the breakout',
            'About $44.00, twice the pole above the flag low',
            'About $39.40 — the $8.80 pole height added to the $30.60 breakout point',
          ],
          answerIdx: 3,
          explain:
            'The flag convention adds the full pole height to the breakout level: $30.60 + $8.80 ≈ $39.40, with the conservative variant projecting from the flag low ($28.60 + $8.80 = $37.40). Quote the $37–39 band as a region rather than a price — halving or doubling the pole are inventions, and the pole high is not a target at all.',
        },
        {
          id: 'u09-l05-q4',
          prompt: 'What should the volume profile of a healthy flag look like?',
          choices: [
            'Heavy on the pole, contracting through the drift, expanding on the break',
            'Flat throughout, showing steady interest',
            'Light on the pole, heavy through the drift',
            'Rising steadily through the drift, showing accumulation',
          ],
          answerIdx: 0,
          explain:
            'Contraction through the drift is the evidence that the sellers are profit-takers rather than a motivated crowd, and expansion on the break says the latecomers finally paid up. Rising volume during the drift is the warning sign — that is distribution wearing a flag’s clothes, and it is exactly the version that fails.',
        },
        {
          id: 'u09-l05-q5',
          prompt: 'Why do flags tend to look better in backtests than they are?',
          choices: [
            'Because flag data is only available for successful stocks',
            'Because flags are defined relative to a sharp prior move, so the scan is really selecting momentum — much of the apparent edge belongs to the pole',
            'Because backtests cannot measure volume',
            'Because flags only formed before electronic trading',
          ],
          answerIdx: 1,
          explain:
            'Scanning for flags means scanning for stocks that just rose sharply, and cross-sectional momentum says those continued somewhat more often than chance regardless of the drift shape — so the pole is doing much of the work the flag gets credit for. That is a reason to attribute the edge correctly and use the flag for its tight invalidation level, not a reason to discard the pattern.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l05-c1',
          kind: 'cloze',
          front:
            'Flag anatomy: a sharp high-volume ____, then a tight counter-trend ____ on ____ volume, then a resumption.',
          back: 'pole; drift (flag); falling (contracting)',
        },
        {
          id: 'u09-l05-c2',
          kind: 'cloze',
          front:
            'Flag measured move = ____ height added to the ____ point. Retracement should stay under about ____ of the pole.',
          back: 'pole; breakout; half (50%)',
        },
        {
          id: 'u09-l05-c3',
          kind: 'basic',
          front: 'Three checks before calling something a bull flag',
          back: 'Was the prior run sharp and on heavy volume (the pole)? Is the retracement under half the pole? Is the drift under about three weeks? Fail any and the honest label is Consolidation.',
        },
        {
          id: 'u09-l05-c4',
          kind: 'basic',
          front: 'Flag vs pennant',
          back: 'A flag drifts inside a narrow parallel channel; a pennant drifts inside a small symmetrical triangle. The mechanism, the rules and the measured move are identical — the distinction is cosmetic.',
        },
      ],
    },

    // ── L06 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l06',
      unitId: 'u09',
      order: 6,
      title: 'Cup & Handle',
      minutes: 2,
      blocks: [
        {
          kind: 'text',
          md: `The **Cup and Handle** — the app's drills use that exact label — was popularised by **William O'Neil** in *How to Make Money in Stocks* (1988), and it is unusual among chart patterns in coming with explicit numeric criteria rather than a silhouette.

The shape is a base in two parts:

- **The cup.** A rounded decline and recovery, ideally **U-shaped** rather than V-shaped. O'Neil's working ranges: **7 weeks to 65 weeks** long, and **12% to 33%** deep from the left rim. The roundness matters because it says the selling exhausted gradually and new owners accumulated on the way back — a V-bottom means price snapped back before anyone changed hands at the lows.
- **The handle.** A short, shallow drift *down* after price returns near the left rim, forming in the **upper half** of the cup and retracing no more than about **a third** of the cup's depth. It is a deliberate shakeout: the last holders who bought at the old high and sat through the whole decline finally get back to breakeven and sell.

The **pivot** — the price that matters — is the high of the handle. A close above it on expanding volume is the pattern; everything before that is a base forming.`,
        },
        {
          kind: 'example',
          md: `**A cup and handle, priced out.** A stock tops at **$50.00**, then:

| Stage | Duration | Price | Volume |
|---|---|---|---|
| Left rim → cup low | 14 weeks | $50.00 → $36.00 | fading to 900k |
| Cup low → right rim | 12 weeks | $36.00 → $49.40 | rebuilding to 1.8M |
| Handle | 3 weeks | $49.40 → $46.30 | falling to 700k |
| Breakout close | — | $50.20 | 3.1M |

Check it against the criteria:

- **Cup depth:** $50.00 − $36.00 = **$14.00**, which is **28%** of $50.00 — inside the 12–33% band.
- **Cup duration:** 14 + 12 = **26 weeks**, inside the 7–65 week band.
- **Handle retracement:** $49.40 − $46.30 = **$3.10**, which is **22%** of the $14.00 cup depth — under the one-third limit ($4.67).
- **Handle location:** it forms between $46.30 and $49.40, entirely in the upper half of the $36–50 cup.
- **Breakout volume:** 3.1M against the 1.8M base — about **72%** above average, clearing O'Neil's 40–50% threshold.
- **Pivot:** the handle high, **$49.40**. The buy point is a close above it.
- **Measured move:** cup depth added to the rim: **$50.00 + $14.00 = $64.00**.
- **Invalidation:** a close back below the handle low, **$46.30** — about **$3.90** of risk from a $50.20 entry, roughly **7.8%**.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "The cup and handle is a proven pattern because O'Neil's research found it in the biggest winners."

That research selected on the outcome. O'Neil studied stocks that had already produced enormous gains and catalogued what their charts looked like beforehand — which tells you nothing about how many stocks formed the same base and went nowhere. The base rate you actually need is *of all cup-and-handles, how many worked*, and that number is not what the study measured. The pattern is a reasonable, well-specified description of accumulation; it is not evidence of an edge.`,
        },
        {
          kind: 'callout',
          md: `**Why the handle earns its name.** A handle is a **shakeout**, and its absence is a real warning. A stock that runs straight from the cup low through the old high without pausing has not given the trapped rim holders a chance to sell — so their supply is still overhead, untouched, waiting at exactly the level the breakout has to clear. The three-week drift on 700k shares is the pattern quietly disposing of that inventory.`,
        },
        {
          kind: 'keypoint',
          md: `Cup and Handle = a rounded U-shaped base (7–65 weeks, 12–33% deep) plus a shallow handle in the upper half retracing under a third of the cup depth, then a close above the handle high on volume 40%+ above average. Measured move = cup depth added to the rim. Its published pedigree comes from studying winners after the fact — treat the shape as a description of accumulation, not proof of an edge.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l06-q1',
          prompt:
            'A cup runs from a $50.00 rim down to $36.00 and back. The handle drifts from $49.40 to $46.30. Does the handle qualify?',
          choices: [
            'No — a handle must retrace at least half the cup depth',
            'No — the handle is too shallow to shake anyone out',
            'Cannot be determined without knowing the handle’s duration in days',
            'Yes — $3.10 is 22% of the $14.00 cup depth, under the one-third limit, and it sits in the upper half of the cup',
          ],
          answerIdx: 3,
          explain:
            'Both criteria are met: the retracement is $3.10 against a $14.00 cup (22%, under the ~33% ceiling) and the drift occurs between $46.30 and $49.40, entirely in the upper half of the $36–50 range. A handle retracing half the cup would disqualify it, not validate it — a deep handle means the base is still under real selling pressure.',
        },
        {
          id: 'u09-l06-q2',
          prompt: 'What is the "pivot" in a cup and handle, and why is it the level that matters?',
          choices: [
            'The high of the handle — a close above it is what converts a forming base into a pattern',
            'The low of the cup, since it marks maximum pessimism',
            'The midpoint of the cup, where the measured move is calculated from',
            'The left rim, since that is the old high',
          ],
          answerIdx: 0,
          explain:
            'The handle high is the last price sellers defended, so a close above it on volume is the evidence that the overhead supply has finally been cleared — everything before that is a base forming. The cup low and midpoint are descriptive, and while the left rim anchors the measured move, it is not the trigger.',
        },
        {
          id: 'u09-l06-q3',
          prompt:
            'The cup runs from a $50.00 rim to a $36.00 low, and price breaks out at $50.20. What is the measured move target?',
          choices: [
            'About $57.00, half the cup depth above the rim',
            'About $53.10, the handle depth added to the breakout',
            'About $64.00 — the $14.00 cup depth added to the $50.00 rim',
            'About $86.00, the cup depth added to the cup low',
          ],
          answerIdx: 2,
          explain:
            'The convention adds the full cup depth ($50.00 − $36.00 = $14.00) to the rim, giving roughly $64.00. Adding the depth to the cup low double-counts the recovery that has already happened, and the handle depth is far too small a unit — it measures the shakeout, not the base.',
        },
        {
          id: 'u09-l06-q4',
          prompt:
            'Why does O’Neil’s original research not establish a base rate for the cup and handle?',
          choices: [
            'Because it was conducted before electronic markets existed',
            'Because it used weekly rather than daily charts',
            'Because cup-and-handle bases are too rare to study',
            'Because it selected on the outcome — cataloguing the charts of stocks that had already produced huge gains, not the fate of all such bases',
          ],
          answerIdx: 3,
          explain:
            'Studying big winners backwards tells you what their bases looked like, not how many identical bases went nowhere — the denominator you need was never counted. That is a methodological problem, not a data-era or chart-period problem, and the bases themselves are common rather than rare.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l06-c1',
          kind: 'cloze',
          front:
            'Cup and Handle: a ____-shaped base roughly ____% to ____% deep, then a handle in the ____ half of the cup retracing under about ____ of the cup depth.',
          back: 'U; 12; 33; upper; one-third',
        },
        {
          id: 'u09-l06-c2',
          kind: 'cloze',
          front:
            'Cup and Handle measured move = ____ depth added to the ____. The trigger is a close above the ____ high.',
          back: 'cup; rim (old high); handle',
        },
        {
          id: 'u09-l06-c3',
          kind: 'basic',
          front: 'What is the handle actually doing?',
          back: 'Shaking out the holders trapped at the old high, who finally reach breakeven and sell. Without a handle, that supply is still sitting overhead at exactly the level the breakout must clear.',
        },
        {
          id: 'u09-l06-c4',
          kind: 'basic',
          front: 'Why is O’Neil’s cup-and-handle evidence weaker than it appears?',
          back: 'It selected on the outcome: the bases were catalogued from stocks that had already produced huge gains, so the number of identical bases that failed was never counted. Good description of accumulation, no base rate.',
        },
      ],
    },

    // ── L07 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l07',
      unitId: 'u09',
      order: 7,
      title: 'Wedges',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **wedge** is a converging range where **both boundaries slope the same way**. That is the whole distinction from a triangle:

| | Triangle | Wedge |
|---|---|---|
| Ascending | Flat ceiling, rising lows | — |
| Descending | Flat floor, falling highs | — |
| Both sloping up | — | **Rising Wedge** |
| Both sloping down | — | **Falling Wedge** |
| Converging, no flat side | Symmetrical | — |

**Rising Wedge** and **Falling Wedge** are both drill labels in the app.

**Why a rising wedge leans bearish.** In a rising wedge price is still making higher highs — but the lows are rising *faster* than the highs, so each advance is smaller than the one before. The pattern is a picture of an uptrend running out of amplitude: buyers must bid ever higher to get filled, and get ever less for it. When a move needs progressively more effort to produce progressively less result, the honest reading is deceleration, and the resolution more often comes on the downside.

**Falling wedge** inverts it: lower lows, but the highs falling faster, so each decline achieves less than the last. Selling is exhausting itself, and the lean is bullish.`,
        },
        {
          kind: 'example',
          md: `**A rising wedge, swing by swing.** Over ten weeks a stock prints alternating pivots:

| Swing | High | Gain vs prior high | Low | Gain vs prior low | Range width |
|---|---|---|---|---|---|
| 1 | $40.20 | — | $37.00 | — | $3.20 |
| 2 | $41.60 | +$1.40 | $39.10 | +$2.10 | $2.50 |
| 3 | $42.30 | +$0.70 | $40.70 | +$1.60 | $1.60 |
| 4 | $42.60 | +$0.30 | $41.90 | +$1.20 | $0.70 |

Read the two middle columns together. The highs are advancing **$1.40 → $0.70 → $0.30** while the lows advance **$2.10 → $1.60 → $1.20**. Both boundaries rise; the lower one rises faster; the range collapses from **$3.20** to **$0.70**, a **78%** contraction. Volume falls from **2.2M** to **800k** across the same span.

Then a close at **$41.30** on **3.4M** breaks the lower boundary.

- **The classic target** for a wedge is a full retrace to where the wedge began: **$37.00**, about **13%** below the $42.60 high. Wedges tend to unwind fast because the whole structure was built on thinning demand.
- **The measured-move alternative** projects the widest height from the break: **$41.30 − $3.20 = $38.10**. Quote **$37–38** as the region.
- **Invalidation:** a close back above the wedge's upper boundary, around **$42.70**. From $41.30 that is **$1.40** of risk against **$3–4** of target.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "A rising wedge is a sell signal."

The bearish lean is real but modest, and it is easily overwhelmed by context. Rising wedges appear constantly inside powerful uptrends and resolve upward often enough that shorting them mechanically is a good way to fight a trend. Two disciplines: never act before the boundary actually breaks on a close, and downgrade the pattern hard when the broader trend is strongly up. A rising wedge in a downtrend, into a resistance zone, on collapsing volume is a far better proposition than the same shape at a 52-week high.`,
        },
        {
          kind: 'callout',
          md: `**Wedges are the most over-identified pattern in this unit — and this app has the receipts.** When the drill windows for the pattern quiz were generated, an automated scan looked for wedges across all 27 bundled symbols. It found candidates. Under visual inspection every one turned out to be an ordinary trend whose pivot lines happened to converge, so **no wedge windows shipped**: the two wedge labels exist in the drills only as *distractors*, which you still have to know in order to rule out.

The lesson generalises. Because any trend has pivots you can connect, a wedge can be drawn on almost anything. Require at least **two touches per boundary**, a visible **volume contraction**, and swing amplitudes that are genuinely decaying — not just lines that meet somewhere off the right edge.`,
        },
        {
          kind: 'keypoint',
          md: `A wedge converges with **both boundaries sloping the same direction** — that is what separates it from a triangle. Rising wedge = higher highs with decaying amplitude, bearish lean; falling wedge = lower lows with decaying amplitude, bullish lean. Classic target is a full retrace to the wedge's origin. It is the easiest pattern to imagine, so demand two touches per boundary, contracting volume, and decaying swing sizes.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l07-q1',
          prompt: 'What geometrically separates a wedge from a triangle?',
          choices: [
            'In a wedge both boundaries slope in the same direction; a triangle has a flat side or converges symmetrically',
            'A wedge is always steeper than 45 degrees',
            'A wedge forms over weeks, a triangle over months',
            'A wedge has no measured move, a triangle does',
          ],
          answerIdx: 0,
          explain:
            'Both wedge boundaries slope the same way — up for a rising wedge, down for a falling one — whereas ascending and descending triangles have a flat boundary and symmetrical triangles converge around a horizontal axis. Slope angle, duration and the existence of a measured move are all shared between the two families, so none of them distinguishes anything.',
        },
        {
          id: 'u09-l07-q2',
          prompt:
            'Highs advance $1.40, then $0.70, then $0.30 while lows advance $2.10, $1.60, $1.20. What does this pattern of numbers describe?',
          choices: [
            'An ascending triangle, since the lows are rising',
            'A symmetrical triangle, since both lines converge',
            'A downtrend, since the increments are shrinking',
            'A rising wedge — both boundaries rise, the lows rise faster, and each advance achieves less than the last',
          ],
          answerIdx: 3,
          explain:
            'Both boundaries are rising and the lower one is rising faster, which is the definition of a rising wedge, and the decaying high-to-high increments are the amplitude decay that gives it its bearish lean. An ascending triangle would need a flat ceiling rather than rising highs, and price making higher highs is not a downtrend regardless of how the increments shrink.',
        },
        {
          id: 'u09-l07-q3',
          prompt: 'Why does a rising wedge lean bearish despite making higher highs?',
          choices: [
            'Because rising wedges only form at market tops',
            'Because each advance achieves less than the one before — the trend needs more effort for less result',
            'Because the pattern forces short sellers to cover',
            'Because volume always spikes at the apex',
          ],
          answerIdx: 1,
          explain:
            'The decaying amplitude is the whole argument: buyers must bid progressively higher and get progressively less for it, which is deceleration made visible. Rising wedges form throughout trends rather than only at tops, volume typically contracts rather than spikes, and no mechanism forces anyone to cover.',
        },
        {
          id: 'u09-l07-q4',
          prompt:
            'A rising wedge that began at $37.00 and topped at $42.60 breaks its lower boundary on a close at $41.30. What is the classic target?',
          choices: [
            'About $37.00 — a full retrace to where the wedge began',
            'About $40.20, the first swing high',
            'About $31.40, the wedge height doubled below the break',
            'About $42.60, the wedge high, on a failed break',
          ],
          answerIdx: 0,
          explain:
            'Wedges conventionally retrace to their origin, because the entire structure was built on thinning demand and has little support inside it — here that is $37.00, with the measured-move variant ($41.30 − $3.20 = $38.10) giving a $37–38 region. Doubling the height is not a convention, and the wedge high is the invalidation area, not a target.',
        },
        {
          id: 'u09-l07-q5',
          prompt:
            'Why did no wedge drill windows ship in this app, even though an automated scan found candidates?',
          choices: [
            'Wedges cannot be represented on daily candlestick charts',
            'The drill engine does not support converging trendlines',
            'On inspection every candidate was an ordinary trend whose pivot lines happened to converge — labelling them would teach pattern-matching on noise',
            'Wedges were judged too easy for learners',
          ],
          answerIdx: 2,
          explain:
            'The candidates failed visual inspection: they were trends with coincidentally converging pivots, so shipping them would have taught learners to see wedges in noise — which is why both wedge labels appear only as distractors. Nothing about the chart format or the drill engine was the constraint, and wedges are among the hardest shapes to identify honestly, not the easiest.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l07-c1',
          kind: 'cloze',
          front:
            'A wedge converges with both boundaries sloping the ____ direction. A ____ wedge makes higher highs with decaying amplitude and leans ____.',
          back: 'same; rising; bearish',
        },
        {
          id: 'u09-l07-c2',
          kind: 'basic',
          front: 'Rising wedge vs ascending triangle',
          back: 'Ascending triangle: flat ceiling, rising lows — supply fixed at one price. Rising wedge: rising ceiling with the lows rising faster — no fixed level, just an advance losing amplitude.',
        },
        {
          id: 'u09-l07-c3',
          kind: 'basic',
          front: 'Classic wedge target and invalidation',
          back: 'Target: a full retrace to where the wedge began (the measured-move variant projects the widest height from the break). Invalidation: a close back beyond the opposite boundary.',
        },
        {
          id: 'u09-l07-c4',
          kind: 'basic',
          front: 'Why are wedges the most over-identified pattern?',
          back: 'Any trend has pivots that can be connected into converging lines. Demand two touches per boundary, contracting volume, and genuinely decaying swing amplitudes — otherwise you have drawn a wedge on an ordinary trend.',
        },
      ],
    },

    // ── L08 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l08',
      unitId: 'u09',
      order: 8,
      title: 'Breakouts & Fakeouts',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `A **Breakout** — another drill label — is price closing decisively beyond a level that has repeatedly contained it. A **fakeout** (or false breakout, or bull trap) is the same event followed by a return inside.

Every pattern in this unit resolves through a breakout, so this lesson is where they all cash out. Four pieces of evidence, in descending order of usefulness:

1. **A close beyond the level, not a wick.** Closes are where participants were willing to hold; wicks are where someone probed.
2. **Volume expansion.** Real supply being absorbed shows up as participation. The rough working threshold is **1.5× to 2× the 50-day average**, and materially more is better.
3. **Follow-through.** The next one to three sessions holding outside the level. A break that immediately spends three days grinding back toward the boundary is losing its argument.
4. **A successful retest.** Price returning to the broken level and being rejected from the correct side — old resistance now acting as support.

And the uncomfortable truth that has to sit alongside them: **you often cannot tell a breakout from a fakeout in real time.** Points 3 and 4 are only available after the fact, and by then a good part of the move has happened.`,
        },
        {
          kind: 'example',
          md: `**The same break, two endings.** A stock spends ten weeks capped by a resistance zone: highs of **$74.10**, **$73.90** and **$74.20** — call the zone **$73.60–74.20**. Average volume **2.0M**. ATR (average daily range) is about **$1.60**.

It closes at **$76.10** on **6.8M** shares — **3.4×** average. So far this is the strong version: a decisive close and heavy participation.

- **Ending A — real.** Three sessions later price pulls back, trades an intraday low of **$73.80** (inside the zone), and closes at **$75.20** on **2.2M**. The zone was tested from above and held on a closing basis. Old resistance is now support, and the trapped sellers from ten weeks of the range have been cleared.
- **Ending B — fakeout.** Three sessions later it closes at **$72.90** on **4.4M** — back inside the range, on heavy volume, and now everyone who chased the break at $75–76 is trapped. Those buyers become the overhead supply capping the next attempt, which is exactly the mechanism from Lesson 1 running in reverse.

The first two days were **identical**. No amount of chart reading separated them, and the 6.8M breakout volume — the strongest single piece of evidence available — was present in both.`,
        },
        {
          kind: 'text',
          md: `**So where does the stop go?** Not one cent below the level. **$73.59** is the single most crowded, most easily swept price on the chart, and normal daily noise on a stock with a **$1.60** ATR will reach it routinely without meaning anything.

Two workable structures, using the numbers above:

| Approach | Entry | Stop | Risk/share | Trade-off |
|---|---|---|---|---|
| Buy the breakout | $76.10 close | $72.00 (zone low $73.60 − 1 ATR) | **$4.10** (5.4%) | You are in every real break, and you pay full price for the fakeouts |
| Buy the retest | ~$74.60 | $72.00 | **$2.60** (3.5%) | Much cheaper risk, but you miss the breaks that never look back |

Neither is correct in general. The retest is the better *price*; the breakout entry is the better *participation rate*, because a meaningful share of genuine breakouts simply never offer a retest. Pick one, size it so a fakeout is survivable, and — this is the part that matters — apply it consistently enough that you accumulate a sample.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "Wait for confirmation and you will avoid fakeouts."

Confirmation is not free and it is not complete. Waiting for follow-through or a retest costs you price on every winner and removes you entirely from the fastest moves, and it still does not eliminate failures — plenty of breakouts confirm, retest successfully, and then fail a week later. What confirmation actually buys is a *lower failure rate at a worse entry price*. That is a real trade-off worth making deliberately; it is not a way to be right more often for free.`,
        },
        {
          kind: 'callout',
          md: `**Why fakeouts are so common — and so violent.** Stop orders cluster just beyond obvious levels. When price pokes through, those stops trigger as market orders, which pushes price further and triggers more — a brief cascade that can look exactly like a powerful breakout on genuinely heavy volume. Once the cluster is exhausted there is nothing left to buy, and price falls back. This is why "the break came on huge volume" is *evidence* rather than *proof*, and why a breakout that has to be chased 5% above the level is a much worse bet than one you took at the level.`,
        },
        {
          kind: 'keypoint',
          md: `Breakout evidence, in order: a close beyond the zone, volume expansion (1.5–2× average or better), follow-through, and a successful retest. The last two only exist after the fact, so real-time certainty is unavailable. Place the stop outside the zone plus a volatility buffer — never one cent beyond the line. Choose breakout entry (better participation) or retest entry (better price) deliberately, and size so a fakeout is survivable.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l08-q1',
          prompt: 'Rank the strongest single piece of real-time evidence that a breakout is genuine.',
          choices: [
            'A successful retest of the broken level',
            'A gap through the level at the open',
            'An RSI reading above 70 on the breakout day',
            'A close beyond the zone on volume well above the 50-day average',
          ],
          answerIdx: 3,
          explain:
            'A close outside the zone with participation of roughly 1.5–2× average or better is the best evidence available *while it is happening* — it says people were willing to hold at the new price and that real supply was absorbed. A successful retest is stronger evidence but arrives days later, and gaps and indicator readings are neither necessary nor diagnostic.',
        },
        {
          id: 'u09-l08-q2',
          prompt:
            'A stock capped at $74.20 closes at $76.10 on 6.8M shares versus 2.0M average, then three days later closes at $72.90 on 4.4M. What happened, and who is now trapped?',
          choices: [
            'A successful retest; the short sellers are trapped',
            'A fakeout; the buyers who chased $75–76 are trapped and become the overhead supply on the next attempt',
            'A measuring gap; nobody is trapped because volume was heavy',
            'A valid breakout that simply needs more time, since the volume confirmed it',
          ],
          answerIdx: 1,
          explain:
            'Price closed back inside the range, which converts everyone who bought the break into holders at a loss with sell orders waiting near breakeven — the trapped-supply mechanism from Lesson 1 running in reverse. Heavy volume on the break does not immunise it: stop cascades produce genuinely heavy volume, which is why volume is evidence rather than proof.',
        },
        {
          id: 'u09-l08-q3',
          prompt:
            'The resistance zone runs $73.60–74.20 and the stock’s ATR is $1.60. Why is a stop at $73.59 a poor choice?',
          choices: [
            'It sits at the most crowded price on the chart and inside normal daily noise, so ordinary movement will hit it',
            'It is too far from the entry to size the position',
            'Stops must always be set as a percentage of the entry price',
            'It is below the 50-day moving average',
          ],
          answerIdx: 0,
          explain:
            'One cent beyond an obvious level is where every other stop is, and with a $1.60 average daily range price will reach it routinely without the idea being wrong — you lose to noise and to the cascade your own stop feeds. The fix is a volatility buffer beyond the zone, such as $73.60 − 1 ATR ≈ $72.00, not a percentage rule.',
        },
        {
          id: 'u09-l08-q4',
          prompt:
            'Entering on the breakout at $76.10 with a $72.00 stop risks $4.10 per share; entering on a retest at $74.60 with the same stop risks $2.60. What is the real trade-off?',
          choices: [
            'The retest is strictly better, since less risk is always preferable',
            'The breakout entry is strictly better, since it is earlier',
            'Better price versus better participation — the retest is cheaper but misses breaks that never look back',
            'There is no trade-off; both produce the same expectancy by construction',
          ],
          answerIdx: 2,
          explain:
            'The retest gives cheaper risk on the trades you get, but a meaningful share of genuine breakouts run without ever returning to the level, so you are absent for exactly the strongest moves. Neither approach dominates — what matters is picking one deliberately, sizing so a fakeout is survivable, and applying it consistently enough to build a sample.',
        },
        {
          id: 'u09-l08-q5',
          prompt: 'Why can a fakeout occur on genuinely enormous volume?',
          choices: [
            'Because volume data is delayed on breakout days',
            'Because market makers are obliged to trade against breakouts',
            'Because false breakouts always occur near earnings',
            'Because stop orders clustered beyond the level trigger as market orders, cascading briefly and then exhausting',
          ],
          answerIdx: 3,
          explain:
            'The stop cluster just beyond an obvious level converts into market orders that push price further and trigger more, producing real volume with no lasting demand behind it — once the cluster is exhausted, price falls back. That is exactly why a break you have to chase 5% above the level is a worse bet than one taken at the level.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l08-c1',
          kind: 'basic',
          front: 'Four pieces of breakout evidence, in order of usefulness',
          back: 'A close beyond the zone (not a wick); volume expansion, roughly 1.5–2× the 50-day average or better; follow-through over the next one to three sessions; and a successful retest. The last two only exist after the fact.',
        },
        {
          id: 'u09-l08-c2',
          kind: 'cloze',
          front:
            'Place a breakout stop beyond the ____ plus a ____ buffer — never one cent past the line, which is the most ____ price on the chart.',
          back: 'zone; volatility (ATR); crowded',
        },
        {
          id: 'u09-l08-c3',
          kind: 'basic',
          front: 'Breakout entry vs retest entry',
          back: 'Breakout entry: worse price, higher risk per share, but you are present for every real break. Retest entry: much cheaper risk, but you miss the breaks that never look back. Choose deliberately and apply consistently.',
        },
        {
          id: 'u09-l08-c4',
          kind: 'basic',
          front: 'Why do fakeouts print heavy volume?',
          back: 'Stops clustered just beyond the level trigger as market orders and cascade, creating real volume with no durable demand behind it. Once the cluster is exhausted price falls back — so volume is evidence, not proof.',
        },
      ],
    },

    // ── L09 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l09',
      unitId: 'u09',
      order: 9,
      title: 'Candlestick Patterns',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Everything so far has spanned weeks. **Candlestick patterns** span one to three bars, and that is the right way to hold them: as very short-horizon *sentiment reads*, never as standalone signals.

Unit 8 gave you the primitives — body means conviction, wick means rejection. The named shapes are combinations:

**One bar**
- **Doji** — open ≈ close. Indecision. Variants: a **gravestone doji** (long upper wick, no lower) is a rejected advance; a **dragonfly doji** (long lower wick) is a rejected decline.
- **Hammer / hanging man** — small body at the top of the range, lower wick roughly twice the body or more.
- **Shooting star** — the inversion: small body at the bottom, long upper wick.

**Two bars**
- **Engulfing** — a body that fully covers the prior body in the opposite colour.
- **Harami** — the reverse: a small body entirely inside the previous, larger one. A stall rather than a reversal.

**Three bars**
- **Evening star** — a long up bar, a small indecisive body gapping above it, then a long down bar closing below the midpoint of the first bar's body. **Morning star** is the mirror at a low.`,
        },
        {
          kind: 'example',
          md: `**An evening star, bar by bar.** After a six-week advance a stock prints:

| Day | Open | High | Low | Close | Read |
|---|---|---|---|---|---|
| 1 | $118.20 | $124.90 | $118.00 | $124.60 | long green body, $6.40 |
| 2 | $125.40 | $126.10 | $124.80 | $125.00 | tiny body, gapped above day 1 |
| 3 | $124.20 | $124.40 | $119.10 | $119.40 | long red body, $4.80 |

Check the defining condition: the midpoint of day 1's body is **($118.20 + $124.60) ÷ 2 = $121.40**, and day 3 closed at **$119.40** — below it. That is what makes it an evening star rather than three unrelated bars.

The story in three days: a strong advance, then a session where the buying stopped working (day 2 gapped up and went nowhere, a $1.30 range against day 1's $6.40 body), then a session that erased more than two-thirds of day 1's gain. Sentiment flipped inside 72 hours.

**And now the honest part.** That is a three-day observation on a stock that has advanced for six weeks. It says the last three days went badly. It does not say the advance is over, it carries no target, and its natural invalidation — a close back above **$126.10** — sits under **1.5%** above day 3's high of $124.40. Compare that with the head and shoulders in Lesson 3, which took months to build and pointed at a level **34%** below. Different instruments, different weight.`,
        },
        {
          kind: 'callout',
          md: `**The same shape, two names.** A **hammer** and a **hanging man** are *identical candles* — small body at the top, long lower wick. The only difference is what came before: after a decline it is a hammer (a rejected low, mildly bullish); after an advance it is a hanging man (mildly bearish). The shape contributes nothing on its own; the context supplies the entire meaning. Anyone who can tell you what a candle means without seeing the fifty bars to its left is guessing.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "A bullish engulfing candle means the trend is reversing."

Engulfing bars occur constantly — a stock will print dozens a year — and the great majority reverse nothing. Academic tests of candlestick profitability on liquid equity markets have generally found little or no exploitable edge once transaction costs are included; the shapes describe what just happened rather than what comes next. Use them as a *modifier*: a bullish engulfing bar at a tested support zone, in an uptrend, on above-average volume, is a small piece of supporting evidence for a decision you were already close to making. On its own it is a data point about yesterday.`,
        },
        {
          kind: 'example',
          md: `**A worked engulfing, with and without context.** Day 1: open **$31.80**, close **$30.40** (a $1.40 red body). Day 2: open **$30.20**, close **$32.10** — the body spans $30.20–$32.10 and fully covers $30.40–$31.80, so it is a bullish engulfing bar.

- **In context:** the stock is in an uptrend, day 1's low tagged a support zone at $30.00–30.30 that held twice before, and day 2 traded **2.8M** shares against a **1.1M** average. Worth acting on, with invalidation below $30.00.
- **Without context:** the same two candles occur mid-range in a stock that has gone nowhere for three months, on **900k** shares. Identical shape, no information, no invalidation level that means anything.

The candles are the same. The trade is not.`,
        },
        {
          kind: 'keypoint',
          md: `Candlestick patterns are one-to-three-bar sentiment reads: doji (indecision), hammer/hanging man (rejected low — the name depends entirely on what preceded it), shooting star, engulfing (one side overwhelming the other), harami (a stall), morning/evening star (a three-bar sentiment flip). They carry no targets and tiny invalidation distances. Use them as modifiers on a decision built from trend, level and volume — never as the decision.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l09-q1',
          prompt:
            'Day 1 opens $118.20 and closes $124.60. Day 2 gaps up and prints a tiny body. Day 3 closes at $119.40. Why does this qualify as an evening star?',
          choices: [
            'Because day 3 closed below $121.40 — the midpoint of day 1’s body',
            'Because day 2 gapped up, which alone defines the pattern',
            'Because day 3’s body is longer than day 2’s',
            'Because three consecutive bars alternated colour',
          ],
          answerIdx: 0,
          explain:
            'The defining condition is the third bar closing back below the midpoint of the first bar’s body — here ($118.20 + $124.60) ÷ 2 = $121.40, and the close of $119.40 clears it. The gap and the small middle body are necessary parts of the shape but are common on their own; alternating colours describe most three-day sequences on any chart.',
        },
        {
          id: 'u09-l09-q2',
          prompt: 'What is the difference between a hammer and a hanging man?',
          choices: [
            'The hammer has a longer wick relative to its body',
            'Nothing about the candle itself — the name depends entirely on whether it follows a decline or an advance',
            'The hammer is green and the hanging man is red',
            'The hammer forms on higher volume',
          ],
          answerIdx: 1,
          explain:
            'They are the identical shape: small body at the top of the range with a long lower wick, mildly bullish after a decline and mildly bearish after an advance. That is the clearest illustration in the unit that a candle contributes nothing without the fifty bars to its left — colour and volume vary in both cases.',
        },
        {
          id: 'u09-l09-q3',
          prompt:
            'A bullish engulfing bar forms mid-range in a stock that has gone nowhere for three months, on 900k shares against a 1.1M average. How much does it tell you?',
          choices: [
            'It confirms accumulation, since engulfing bars are institutional footprints',
            'It signals a reversal, since engulfing bars are reversal patterns by definition',
            'It is a strong signal weakened only slightly by the low volume',
            'Very little — with no trend, no level and no participation, the shape has no context to give it meaning',
          ],
          answerIdx: 3,
          explain:
            'The same two candles at a twice-tested support zone in an uptrend on 2.8M shares would be worth acting on; mid-range on below-average volume there is nothing for the shape to modify and no invalidation level that means anything. Engulfing bars print dozens of times a year in an ordinary stock, and the great majority reverse nothing.',
        },
        {
          id: 'u09-l09-q4',
          prompt:
            'Why is an evening star lighter evidence than a completed head and shoulders?',
          choices: [
            'Because three-bar patterns are always false',
            'Because it summarises three days, carries no target, and has an invalidation level roughly 1% away — against a formation built over months pointing tens of percent lower',
            'Because candlesticks were designed for rice markets rather than equities',
            'Because it cannot be seen on a daily chart',
          ],
          answerIdx: 1,
          explain:
            'Weight scales with how much behaviour a pattern summarises: three sessions of sentiment versus months of accumulated supply, with correspondingly tiny invalidation distance and no measured move. Three-bar patterns are not false by construction, and the historical origin of candlestick charting has no bearing on how much information a shape carries.',
        },
        {
          id: 'u09-l09-q5',
          prompt: 'What is the defensible way to use candlestick patterns?',
          choices: [
            'As modifiers on a decision already built from trend, level and volume',
            'As primary entry signals, since they are the fastest to appear',
            'As replacements for support and resistance analysis',
            'As long-horizon forecasts, since sentiment persists',
          ],
          answerIdx: 0,
          explain:
            'A bullish engulfing bar at a tested support zone in an uptrend on heavy volume adds a little weight to a decision you were already near — that is the whole of its usefulness, and tests of candlestick profitability on liquid markets find little edge beyond it once costs are counted. Being fast to appear is not the same as being informative, and a one-to-three-bar read forecasts nothing over long horizons.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l09-c1',
          kind: 'basic',
          front: 'Doji, engulfing, harami — define each.',
          back: 'Doji: open ≈ close, a near-zero body, indecision. Engulfing: a body fully covering the prior body in the opposite colour. Harami: a small body entirely inside the previous larger one — a stall rather than a reversal.',
        },
        {
          id: 'u09-l09-c2',
          kind: 'cloze',
          front:
            'A hammer and a hanging man are the ____ candle. It is a hammer after a ____ and a hanging man after an ____.',
          back: 'same (identical); decline; advance',
        },
        {
          id: 'u09-l09-c3',
          kind: 'cloze',
          front:
            'An evening star is three bars: a long ____ bar, a small indecisive body ____ above it, then a long down bar closing below the ____ of the first bar’s body.',
          back: 'up (green); gapping; midpoint',
        },
        {
          id: 'u09-l09-c4',
          kind: 'basic',
          front: 'Why do candlestick patterns carry so little weight on their own?',
          back: 'They summarise one to three days, carry no measured target, and their natural invalidation is a percent or two away. Tests on liquid markets find little edge after costs — use them as modifiers on a decision built from trend, level and volume.',
        },
      ],
    },

    // ── L10 ───────────────────────────────────────────────────────────────
    {
      id: 'u09-l10',
      unitId: 'u09',
      order: 10,
      title: 'Pattern Trading in Practice',
      minutes: 3,
      blocks: [
        {
          kind: 'text',
          md: `Nine lessons of vocabulary collapse into one procedure. A pattern is worth acting on only when four things line up, and the pattern name is the *least* important of them:

1. **Trend context** — does the setup work with the prevailing direction, or against it? Counter-trend patterns need materially more evidence.
2. **Location** — is it forming at a level that already mattered, with the overhead or underlying supply accounted for?
3. **Confirmation** — a close beyond the boundary, with participation.
4. **Invalidation and size** — a specific price that says you were wrong, and a share count derived from it.

If you can only carry one sentence out of this unit: **the pattern's job is to give you an invalidation level.** The forecast is a bonus of modest and uncertain value; the level is what makes the decision sizeable, repeatable, and reviewable.`,
        },
        {
          kind: 'example',
          md: `**One setup, fully specified.** A stock has run from **$78** to **$97** over four months. The 200-day average is rising beneath it. It pulls back into a **$93–95** zone — the area that capped it twice last year, now potential support by role reversal — and holds. Over the next nine sessions it drifts in a tight channel, low **$94.30**, on volume falling from 2.4M to 900k. That is a **Bull Flag** on a **$12** pole ($85 → $97).

Then it closes at **$97.20** on **2.8M** shares, roughly **three times** the flag's volume.

Now do the arithmetic before doing anything else:

- **Measured move:** $12 pole added to the breakout → about **$109**.
- **But look overhead:** a prior high at **$104** sits between here and there. Levels beat projections. The working target is **$104**.
- **Invalidation:** a close below the flag low **$94.30**, with a buffer → **$93.80**. Risk = $97.20 − $93.80 = **$3.40** per share.
- **Reward-to-risk:** $104 − $97.20 = **$6.80** against $3.40 → **2:1**.
- **Size:** on a **$25,000** account risking **1%** ($250): $250 ÷ $3.40 ≈ **73 shares**, a position worth about **$7,096** — **28%** of the account. Note that the *position* is large while the *risk* is small; those are different numbers and confusing them is one of the more expensive beginner errors.
- **Expectancy check** at a realistic **40%** hit rate: (0.40 × $6.80) − (0.60 × $3.40) = $2.72 − $2.04 = **+$0.68** per share. Thin, positive, and entirely dependent on actually honouring the $93.80 stop.`,
        },
        {
          kind: 'text',
          md: `**Measured moves versus reality.** Every pattern in this unit came with a projection, and every projection deserves the same three caveats:

- **A target is a region, not a price.** Quote $37–39, not $38.40. Precision you do not have is precision that will make you hold through a reversal waiting for the last 30 cents.
- **Targets are reached less often than the surveys suggest**, and partial achievement is the normal outcome. A move that covers 60% of its measured distance and rolls over is not a failed pattern; it is the median pattern.
- **Real levels outrank computed ones.** When a prior high, a round number, or a heavily traded zone sits between you and the projection — as the $104 high does above — take the level. The projection is arithmetic; the level is where the orders are.

**Base rates, restated.** Unit 8 put a well-defined setup near **55–60%** before costs, and everything in this unit has been consistent with that: the tilts are real, they are small, and the published figures are ceilings drawn from curated samples. Combine that with the expectancy arithmetic and the conclusion is uncomfortable but clean — **you cannot make the hit rate much better, so the only lever you genuinely control is the ratio of average win to average loss**, which is set by where you put the invalidation level.`,
        },
        {
          kind: 'text',
          md: `**How the drills build this.** Pattern recognition is perceptual, and perception is trained by repetition with immediate feedback:

- **Pattern drills** show a window of daily candles and ask you to name it from four options — *Double Top*, *Bull Flag*, *Cup and Handle*, *Breakout*, *Support Bounce*, *Uptrend*, *Downtrend*, *Consolidation* and the rest. The distractors are drawn from the same family deliberately, so the answer turns on the defining feature: the pole that separates a Bull Flag from a Consolidation, the flat ceiling that separates an Ascending Triangle from a Rising Wedge, the tested level that separates a Support Bounce from a Double Bottom, the failed higher high that separates Head and Shoulders from an ordinary pullback.
- **What-next drills** hide everything to the right of a cutoff and ask for a direction and a confidence level. This is the only honest simulation of chart reading, because the right-hand edge is genuinely blank — and the confidence rating is where you find out whether your 90% means 90%.

Do them in that order. Naming shapes builds the vocabulary; predicting from a blank right edge teaches you how little the vocabulary buys.`,
        },
        {
          kind: 'callout',
          md: `**Common misconception:** "The measured move is a price target, so I hold until it is reached."

The projection is a rule of thumb derived from the pattern's own height, not a forecast with a distribution behind it. Holding mechanically to a computed number means overriding real evidence — an overhead resistance zone, a volume collapse, a broken pivot — with arithmetic. Set the target *region*, note the levels between here and there, and let price and structure decide, not the calculator.`,
        },
        {
          kind: 'callout',
          md: `**The standing reminder.** This is educational material about how charts are read, not investment advice or a trading system. The evidence for chart patterns is weak, mixed, and hard to separate from noise; for most people, most of the time, low-cost diversified investing beats discretionary chart trading after costs and taxes. Learn this because market literacy is worth having — and keep any real money committed to it small enough that being wrong repeatedly is survivable.`,
        },
        {
          kind: 'keypoint',
          md: `Trend context, location, confirmation, then invalidation and size — the pattern name ranks last. Targets are regions, real levels outrank computed projections, and partial achievement is the median outcome. Since base rates sit stubbornly near 55–60%, the only lever you control is the win-to-loss ratio, set by where the invalidation level goes. Unit 10 turns to indicators — which are derived from the same price and volume you have been reading here, and add no new information at all.`,
        },
        {
          kind: 'text',
          md: `**Next: Unit 10 — Indicators.** Moving averages, RSI, MACD, Bollinger Bands, ATR and the volume measures are all *functions of the price and volume history you have just spent two units learning to read*. That is the single most useful thing to know about them before you start: an indicator is a transformation, not a new source of information. Unit 10 covers what each one measures, the arithmetic behind it, where its standard interpretation breaks, and how to assemble a minimal toolkit instead of a dashboard.`,
        },
      ],
      quiz: [
        {
          id: 'u09-l10-q1',
          prompt: 'In the four-part procedure for acting on a pattern, where does the pattern name rank?',
          choices: [
            'First — identification determines everything that follows',
            'Second, after trend context',
            'Last — trend, location, confirmation and invalidation all outrank it',
            'It does not appear in the procedure at all',
          ],
          answerIdx: 2,
          explain:
            'The name is shorthand for evidence gathered from trend, location and volume, and its real deliverable is the invalidation level that makes the position sizeable — so it ranks behind all of those. It is not absent either: naming the shape is what tells you where the boundary and therefore the invalidation level sit.',
        },
        {
          id: 'u09-l10-q2',
          prompt:
            'A bull flag on a $12 pole breaks at $97.20, projecting to about $109 — but a prior high sits at $104. Which target should you work with, and why?',
          choices: [
            '$104 — real levels outrank computed projections, because that is where the orders are',
            '$109, because the measured move is the pattern’s own arithmetic and should not be overridden',
            'The midpoint, $106.50, splitting the difference',
            'No target, since targets are unknowable',
          ],
          answerIdx: 0,
          explain:
            'The projection is a rule of thumb derived from the pattern’s height; the $104 high is a place where resting supply actually exists, so it is the more concrete obstacle and the honest working target. Splitting the difference invents a level nobody is trading at, and abandoning targets altogether removes the reward side of the sizing arithmetic.',
        },
        {
          id: 'u09-l10-q3',
          prompt:
            'Entry $97.20, stop $93.80, target $104, on a $25,000 account risking 1%. What is the position size, and what fraction of the account does it represent?',
          choices: [
            'About 250 shares — the $250 risk budget divided by 1% of the entry price',
            'About 25 shares, or 10% of the account',
            'About 73 shares, roughly 28% of the account',
            'About 257 shares — the risk budget divided by the $0.97 daily range',
          ],
          answerIdx: 2,
          explain:
            'Risk per share is $97.20 − $93.80 = $3.40, so $250 ÷ $3.40 ≈ 73 shares, which is about $7,096 or 28% of a $25,000 account. Notice the position is large while the risk is small — confusing position value with risk is one of the more expensive beginner errors, and dividing the budget by a percentage or a daily range rather than by the actual stop distance produces nonsense sizes.',
        },
        {
          id: 'u09-l10-q4',
          prompt:
            'Given that pattern hit rates sit stubbornly near 55–60% before costs, which lever do you actually control?',
          choices: [
            'The hit rate, by studying more patterns',
            'The ratio of average win to average loss, set by where the invalidation level goes',
            'The frequency of setups, by watching more stocks',
            'The measured move, by choosing a more favourable projection method',
          ],
          answerIdx: 1,
          explain:
            'Expectancy is (win rate × average win) − (loss rate × average loss), and the win rate is bounded by the market while the average loss is set by your own stop placement — so the win-to-loss ratio is the term under your control. More study does not move the base rate, more setups multiply an unchanged expectancy in both directions, and choosing a flattering projection changes nothing about what price does.',
        },
        {
          id: 'u09-l10-q5',
          prompt: 'Why does the what-next drill teach something the pattern drill cannot?',
          choices: [
            'It uses higher-quality data',
            'It covers patterns that the pattern drill omits',
            'It removes the need for confidence calibration',
            'Its right-hand edge is genuinely blank, which is the one condition every completed historical chart lacks',
          ],
          answerIdx: 3,
          explain:
            'Naming a shape on a finished chart is done with the outcome visible, whereas predicting from a hidden right edge reproduces the actual decision problem — and the confidence rating attached to it is where calibration gets measured rather than removed. Both drills use the same bundled data, and the difference is the information available, not the coverage.',
        },
      ],
      cardSeeds: [
        {
          id: 'u09-l10-c1',
          kind: 'cloze',
          front:
            'Act on a pattern only when four things line up: ____ context, ____ relative to levels, ____ on the break, and a defined ____ level with a size derived from it.',
          back: 'trend; location; confirmation (volume); invalidation',
        },
        {
          id: 'u09-l10-c2',
          kind: 'basic',
          front: 'Three caveats on every measured move',
          back: 'A target is a region, not a price; targets are reached less often than surveys suggest and partial achievement is the median outcome; and real levels between here and there outrank the computed projection.',
        },
        {
          id: 'u09-l10-c3',
          kind: 'basic',
          front: 'If hit rates are stuck near 55–60%, what can you actually change?',
          back: 'The average-win-to-average-loss ratio, which is set by where you place the invalidation level. Expectancy = (win rate × avg win) − (loss rate × avg loss); you control the second term, not the first.',
        },
        {
          id: 'u09-l10-c4',
          kind: 'basic',
          front: 'What is an indicator, stated before Unit 10 begins?',
          back: 'A transformation of the price and volume history you already have — never a new source of information. Everything in Unit 10 is computed from the same closes, highs, lows and volumes read in Units 8 and 9.',
        },
      ],
    },
  ],
}
