# Yoga Stenungsund Style Guide

## Design Philosophy

Our design embodies the essence of yoga - balance, mindfulness, and serenity. We create spaces that breathe, with generous whitespace and thoughtful typography that guides the eye naturally through content.

### Core Principles

1. **Minimalism with Soul** - Clean doesn't mean cold. We add warmth through subtle gradients and organic shapes.
2. **Natural Hierarchy** - Content flows like breath, with clear visual priorities.
3. **Purposeful Motion** - Animations are gentle and meaningful, never distracting.
4. **Accessible Elegance** - Beautiful design that works for everyone.

## Layout System

### Grid & Spacing

```css
/* Container widths */
.container {
  max-width: 1280px;
  padding: 0 1.5rem; /* px-6 */
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .container {
    padding: 0 3rem; /* lg:px-12 */
  }
}

/* Section spacing */
.section {
  padding: 5rem 0; /* py-20 */
}

@media (min-width: 1024px) {
  .section {
    padding: 8rem 0; /* lg:py-32 */
  }
}
```

### Visual Rhythm

- **Hero sections**: 90vh minimum height
- **Content sections**: py-20 on mobile, lg:py-32 on desktop
- **Component spacing**: Use multiples of 4px (1rem = 16px)
- **Maximum content width**: 1280px for full layouts, 896px for text-heavy content

## Typography

### Type Scale

```css
/* Display - Hero headlines */
.text-display {
  font-size: 3rem;    /* 48px - mobile */
  line-height: 1.1;
  font-weight: 300;
}

@media (min-width: 768px) {
  .text-display {
    font-size: 4rem;  /* 64px - tablet */
  }
}

@media (min-width: 1024px) {
  .text-display {
    font-size: 5rem;  /* 80px - desktop */
  }
}

/* Headings */
h1 { font-size: 2.5rem; font-weight: 300; } /* 40px */
h2 { font-size: 2rem;   font-weight: 300; } /* 32px */
h3 { font-size: 1.5rem; font-weight: 400; } /* 24px */
h4 { font-size: 1.25rem; font-weight: 400; } /* 20px */

/* Body text */
.text-body    { font-size: 1rem; line-height: 1.75; }     /* 16px */
.text-body-lg { font-size: 1.125rem; line-height: 1.75; } /* 18px */
.text-body-sm { font-size: 0.875rem; line-height: 1.6; }  /* 14px */

/* Special text */
.text-overline {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 500;
}
```

### Font Usage

- **Headlines**: Light weight (300) for elegance
- **Body text**: Regular weight (400) for readability  
- **Emphasis**: Medium weight (500) sparingly
- **Overlines**: Uppercase with wide letter-spacing

## Color Palette

### Primary Colors

```css
:root {
  /* Brand colors */
  --yoga-cyan: #00B4D8;        /* Primary action color */
  --yoga-blue: #0077B6;        /* Hover states */
  --yoga-purple: #7209B7;      /* Accent */
  --yoga-pink: #F72585;        /* Energy */
  --yoga-light-purple: #A855F7; /* Secondary accent */
  
  /* Natural tones */
  --yoga-cream: #FFF8F0;       /* Warm backgrounds */
  --yoga-sand: #F5E6D3;        /* Subtle warmth */
  --yoga-sage: #87A96B;        /* Nature connection */
  --yoga-stone: #6B7280;       /* Muted text */
  --yoga-earth: #8B7355;       /* Grounding */
}
```

### Color Usage

- **Primary CTA**: yoga-cyan with yoga-blue hover
- **Backgrounds**: White, yoga-cream for warmth
- **Text**: Gray-900 for headers, gray-600/700 for body
- **Accents**: Use sparingly for visual interest

## Components

### Buttons

```jsx
/* Primary */
<Button className="px-8 py-4 bg-[var(--yoga-cyan)] hover:bg-[var(--yoga-blue)]">
  Text
</Button>

/* Outline */
<Button variant="outline" className="px-8 py-4">
  Text
</Button>

/* Sizes */
- Small: px-6 py-2 text-sm
- Medium: px-8 py-4 text-base (default)
- Large: px-10 py-5 text-lg
```

### Cards

- **Border radius**: rounded-2xl (1rem) or rounded-3xl (1.5rem)
- **Padding**: p-6 to p-8
- **Shadows**: shadow-sm default, shadow-lg on hover
- **Borders**: 1px solid gray-100

### Visual Elements

#### Organic Shapes
- Use blob shapes with blur for soft backgrounds
- Position absolutely with low opacity (5-20%)
- Animate subtly with scale or float

#### Zen Circles
- Simple circle with center dot
- Use for decorative elements
- Border-2 with muted colors

## Motion

### Animation Principles

1. **Purposeful**: Every animation has meaning
2. **Natural**: Ease-out for most transitions
3. **Subtle**: Small movements (scale 1.02, translateY -2px)
4. **Consistent**: 200-800ms durations

### Common Animations

```js
/* Fade in up */
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

/* Scale on hover */
whileHover={{ scale: 1.02 }}
transition={{ duration: 0.2 }}

/* Stagger children */
container: {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}
```

## Page Patterns

### Hero Sections
- Left-aligned content (not always centered)
- Overline → Headline → Subheadline → CTA
- Subtle background elements
- Generous whitespace

### Content Sections
- Alternate between layouts (left/right, centered)
- Use visual elements to break up text
- Progressive disclosure with scroll animations

### Navigation
- Fixed header with subtle background on scroll
- Clear hierarchy in menu items
- Smooth transitions between states

## Implementation Notes

### Performance
- Lazy load images and heavy components
- Use CSS transforms for animations
- Minimize DOM manipulation

### Accessibility
- Maintain WCAG AA contrast ratios
- Provide focus states for all interactive elements
- Use semantic HTML structure
- Include motion preferences respect

### Responsive Design
- Mobile-first approach
- Test on real devices
- Maintain visual hierarchy across breakpoints
- Adjust spacing proportionally

## Example Implementations

See these files for reference:
- `/app/[locale]/page.tsx` - Homepage with all major patterns
- `/components/ui/` - Reusable component library
- `/app/[locale]/globals.css` - CSS variables and utilities
- `/lib/animations.ts` - Animation presets

---

Remember: Our design should feel like a deep breath - natural, refreshing, and essential.