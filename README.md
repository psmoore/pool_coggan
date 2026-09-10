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
