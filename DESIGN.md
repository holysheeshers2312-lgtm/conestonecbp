# ConeStone CBP — Design Direction

## Identity
- Public name: ConeStone CBP
- Kitchen sub-brand: Amma Kitchen (Traditional Cooking)
- Place: Changi Business Park, Singapore
- Feel: warm booklet kitchen + casual bar, not hotel fine dining

## Personality
Homestyle Andhra cooking, millet tiffins, chaat, and a full drinks list. Tactile paper, brush banners, honest food.

## Palette
| Token | Hex | Role |
|-------|-----|------|
| paper | #F3EDE3 | Page ground |
| ink | #2A1F18 | Body text |
| brand-red | #8B1E1E | Amma / primary brand |
| gold | #B8863A | Prices, banners, accents |
| cream-deep | #E8DCC8 | Soft paper shapes |
| surface-dark | #1F1814 | Bar / footer only |
| veg | #2E7D32 | Veg marker |
| nonveg | #C62828 | Non-veg marker |

## Typography
- Display: Fraunces
- Body / UI: Manrope
- Banner labels: Manrope bold on gold brush fields

## Layout dials
- ENERGY: 2 (warm, present, not frantic)
- RHYTHM: 3 (sections vary: editorial, list, dark bar)
- MOTION: 3 (cinematic hero, scroll reveals, menu transitions)

## Motion
- GSAP + ScrollTrigger for hero and scroll
- CSS for hover / nav
- Respect prefers-reduced-motion

## Hard rules
- No fake testimonials, hours, or awards
- Menu PDF is source of truth
- CTA: call or jump to menu (no fake booking)
