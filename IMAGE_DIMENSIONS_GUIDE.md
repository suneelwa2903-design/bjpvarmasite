# VarmaSite — Image Dimensions Guide

## The one rule that covers 90% of cases

> **Upload photos at 1920 × 1080 pixels (JPEG), under 500 KB.**
>
> Two exceptions: **Biography** uses 1200 × 1200 (square). **Journey** uses 1600 × 1200.

That's the whole guide in three lines. Read on for the table and the why.

---

## Quick reference

| Section | Dimensions | Aspect | Format | File size |
|---|---|---|---|---|
| **Slideshow** (homepage hero) | 1920 × 1080 | Widescreen | JPEG | Under 500 KB |
| **Biography** (homepage portrait) | 1200 × 1200 | Square | JPEG | Under 500 KB |
| **Journey** (homepage timeline) | 1600 × 1200 | Landscape | JPEG | Under 500 KB |
| **Initiatives / Impact** | 1920 × 1080 | Widescreen | JPEG | Under 500 KB |
| **Press / News** | 1920 × 1080 | Widescreen | JPEG | Under 500 KB |
| **Gallery** | 1920 × 1080 | Widescreen | JPEG | Under 500 KB |
| **Events** | 1920 × 1080 | Widescreen | JPEG | Under 500 KB |
| **Foundation / CSR** | 1920 × 1080 | Widescreen | JPEG | Under 500 KB |

**Universal rules** (apply to every section):

- Format **JPEG** (use PNG only if you need a transparent background, e.g. for a logo)
- Colour profile **sRGB** (most editors default to this — only change if site colours look wrong)
- Hard limit **5 MB per file** (the site will reject anything larger)
- Keep your **subject in the central area** of the photo — edges may get cropped on smaller screens

### Important: Journey photos are displayed in black & white

The Journey timeline section automatically converts all uploaded photos to **black & white** with a slight darkening, then returns them to colour when a visitor hovers. This is a design choice — it gives the timeline a "historical archive" feel.

**You should still upload colour photos** to Journey. The site handles the conversion. Don't pre-convert to grayscale.

If you want a photo to look colourful at rest, use Gallery, Initiatives, or Press instead — not Journey.

---

## Why these sizes

The site automatically resizes every photo you upload so it's no bigger than 1920 × 1080. It also compresses and converts to WebP format. So:

- A 4 MB iPhone photo at 4032 × 3024 → becomes ~300 KB at 1440 × 1080 after upload.
- A photographer's 25 MB TIFF at 6000 × 4000 → rejected (5 MB hard limit); export to JPEG first.
- A 600 × 400 image off Google → stays 600 × 400 (the site never enlarges) → looks pixelated on a 1920px desktop.

**The site never enlarges a photo.** If you upload something smaller than 1920 pixels wide, it stays small. Always start at 1920 × 1080 or larger.

---

## What the site does to your photo after upload

Every photo gets cropped to fill a "frame" — a fixed shape on the page. Frames are different shapes in different sections, and the **same frame is a different shape on phone vs desktop**.

This means: if your subject is in the centre of the photo, it'll look great everywhere. If your subject is near an edge, it may get cropped on some screens.

**The "central 60% rule"**: Imagine a rectangle covering the central 60% of your photo (horizontally and vertically). If everything important — faces, logos, the action — sits inside that rectangle, you're safe. Outside the rectangle, content may be cropped on some devices.

Worst case is the **slideshow**: it crops aggressively differently on desktop (wide) vs phone (tall). Subjects must be dead-centre for slideshow uploads. The other sections are more forgiving.

---

## Per-section detail

### Slideshow — homepage hero
- 1920 × 1080. Widescreen.
- Heavy variable crop: very wide on desktop, taller-narrower on phones.
- **Strict centring required.** Avoid faces near the bottom edge — that area is sometimes cropped on phones.
- A dark gradient is added on the left side so caption text reads cleanly. Don't leave "blank space" for text — the gradient handles it.

### Biography — homepage portrait
- 1200 × 1200. Square.
- Displayed slightly taller than square on desktop, closer to square on phone.
- Head-and-shoulders portrait works best. The face should be centred horizontally and slightly above middle.

### Journey — homepage timeline
- 1600 × 1200. Landscape.
- Displayed in **black & white with a slight darkening**, returns to colour on hover. Upload colour photos.
- Crops left and right edges on wider screens. Centre the subject horizontally.

### Initiatives / Impact
- 1920 × 1080.
- Wide rectangular card thumbnail. Crops **top and bottom**; preserves left and right.
- Keep important content in the central horizontal band of the photo.

### Press / News
- 1920 × 1080.
- The same photo appears at three different shapes across the site: homepage news thumbnail, press list thumbnail, press article hero. The most aggressive crop is the article hero (very wide).
- Centre everything. Headlines or text **inside** the photo will likely be cropped — use captions in the CMS instead of text-in-photo.

### Gallery
- 1920 × 1080.
- The thumbnail is heavily cropped, but visitors can **click to see the full image** — so the full frame is preserved in the lightbox view.
- More forgiving than other sections. Even if a photo looks cropped in the grid, the click-through shows everything.

### Events
- 1920 × 1080.
- Same wide-rectangle behaviour as Initiatives. Crops top and bottom.
- Centre the action.

### Foundation / CSR
- 1920 × 1080.
- Displayed with a **dark gradient overlay at the bottom** so title text reads on top. Avoid placing the subject or key elements in the bottom third — they'll be partly behind the gradient.
- Keep the subject in the upper two-thirds of the photo.

---

## When in doubt

Just upload the photo. The CMS lets you replace any image without breaking anything. Check how it looks on both desktop and phone, and if it's wrong, try a different crop or a different photo.

If you keep hitting the same problem across many uploads, tell the developer — there may be a CMS tweak that helps everyone.

---

## For developers — inconsistencies worth knowing

These don't matter for photographers but they shape the recommendations above:

1. **Journey applies a grayscale + brightness-90 + contrast-110 + 20% black-overlay filter stack** — the only section that does. Confirmed intentional design choice (per owner review June 2026). Photographers must be told to upload colour.
2. **Press uses the same image at three aspect ratios** (1.5:1 thumb, 2.5:1 card, 3:1 article hero). This is why "centre everything strictly" applies there.
3. **The site never enlarges**. `sharp` is configured with `withoutEnlargement: true`, so sub-1920 sources stay sub-1920 — no auto-upscaling.
4. **Initiatives, Press list, Events all share the same ~2.5:1 frame** at desktop. Same source works for all three.
5. **Testimonials, Yearly Reports, Quotes have no image-upload field today.** If a future product call wants images there, that's a CMS feature add.
