# Coggan calendar page — Pool Relay embed preview

A standalone preview of the Coggan Family Aquatic Complex **Hours/Calendar** page
with the live Pool Relay schedule embedded in place of the linked PDF button.

Not the official Coggan Aquatic Complex website. The official site is
<https://www.cogganaquatics.org>. This is a working preview of one proposed change to it,
and the page says so in a ribbon across the top — a disclaimer only in the source is one
nobody opening the page can see.

## What it is

`index.html` is a single self-contained page. It reproduces the layout of the existing
calendar page — header and navigation, pool hero image, blue hours band, sponsor footer —
and swaps the "Current Calendar" button for the Pool Relay calendar:

```html
<iframe src="https://www.poolrelay.com/embed/RYmugKUhh3UViSndkTYwVe"
        width="100%" height="640" frameborder="0" style="border:0"
        title="Pool Relay calendar"></iframe>
```

## Notes

- Hand-written HTML and CSS. It will not drop into the Squarespace editor as-is. To make
  the same change on the live site, delete the button block on the calendar page and add a
  Code block containing the iframe above.
- Images are hotlinked from the Coggan Squarespace content delivery network. Fonts come
  from Google Fonts.
- Navigation links point at the live site, so they work from any hosting path.

## Local preview

```
python3 -m http.server 8791
```

Then open <http://localhost:8791/>.

## Lap Swimming page (`lap-swim/`)

A replica of <https://www.cogganaquatics.org/lap-swim> with the **Coggan lap swim** calendar
(`uEZ7Si19X39moM3r7zOjW7`) embedded below the hours line. The hours line is Coggan's typical hours, typed as on their page, with a
note to check the calendar for details and exceptions.

## Masters Swimming page (`masters-swimming/`)

A replica of <https://www.cogganaquatics.org/masters-swimming> with **Fees** moved above **Schedule**, and the
**Coggan Masters** calendar (`90CP8Y8Hpp01xDF77jp75m`, locked to Coggan and to the Masters group) below the
typical schedule, which is typed as on their page with the same note.

## Swim Lessons page (`swim-lessons/`)

A replica of <https://www.cogganaquatics.org/swim-lessons>. Private lessons run "7 days a week during normal pool
operation hours", so the page embeds the pool's live calendar (`RYmugKUhh3UViSndkTYwVe`) under "When the pool is
open" for families choosing times to email. The fee lists and the summer level-by-time list become tables. No
lessons are entered in Pool Relay yet, so the summer session dates and class times stay typed as on Coggan's page.
