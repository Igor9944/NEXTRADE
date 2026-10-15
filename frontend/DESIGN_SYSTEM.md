# NEXTRADE Design System

## Foundation

### Color Palette

#### Primary Colors
- **Navy**: `#0B2F70`
- **Blue**: `#0759C7`
- **Cyan**: `#25BDF0`
- **Turquoise**: `#7BE8EE`
- **Surface**: `#FFFFFF`
- **Surface Soft**: `#F4F8FC` (background)

#### Neutral Colors
- **Ink (Text Primary)**: `#172B4D`
- **Muted (Text Secondary)**: `#66768A`
- **Border**: `#DCE7F3`

#### Semantic Colors
- **Success**: `#10B981` (accessible green)
- **Warning**: `#F59E0B` (accessible amber)
- **Danger**: `#EF4444` (accessible red)
- **Info**: `#3B82F6` (accessible blue)

Each semantic color includes a full scale (50-900) for various uses.

### Typography

**Font Family**: Inter (with fallback to Segoe UI, system-ui, sans-serif)

**Type Scale** (based on Inter, responsive):
- **Display**: 3.5rem (56px) - Bold
- **Headline**: 2.5rem (40px) - Bold
- **Title**: 1.5rem (24px) - SemiBold
- **Subtitle**: 1.25rem (20px) - Medium
- **Body**: 1rem (16px) - Regular
- **Caption**: 0.875rem (14px) - Regular
- **Overline**: 0.75rem (12px) - Medium

All weights are available: Regular, Medium, SemiBold, Bold.

### Spacing

**Base unit**: 4px
**Scale**: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64 (in px)

### Border Radius

- **None**: 0px
- **Sm**: 0.25rem (4px)
- **Md**: 0.5rem (8px)
- **Lg**: 0.75rem (12px)
- **Xl**: 1rem (16px)
- **Xl2**: 1.5rem (24px)
- **Xl3**: 2rem (32px)
- **Xl4**: 2.5rem (40px)

### Shadows

- **Card**: `0 4px 24px rgba(11, 89, 223, 0.06)`
- **Panel**: `0 8px 40px rgba(11, 89, 223, 0.10)`
- **Modal**: `0 20px 60px rgba(11, 89, 223, 0.18)`
- **Float**: `0 30px 80px rgba(11, 89, 223, 0.25)`

### Transitions

- **Default**: 250ms ease-in-out

## Components

### Buttons

#### Variants
- **Primary**: Background `--nextrade-blue`, text `--nextrade-surface`, hover `--nextrade-navy`
- **Secondary**: Background `--nextrade-surface-soft`, text `--nextrade-blue`, border `--nextrade-border`
- **Outline**: Transparent background, border `--nextrade-blue`, text `--nextrade-blue`
- **Ghost**: Transparent background, text `--nextrade-muted`
- **Destructive**: Background `--nextrade-danger`, text `--nextrade-surface`

#### Sizes
- **Small**: h-8 px-3 text-xs
- **Medium**: h-10 px-4 text-sm
- **Large**: h-12 px-6 text-base

#### States
- Default, Hover, Focus, Active, Loading, Disabled

### Inputs

#### Variants
- **Default**: Border `--nextrade-border`, background `--nextrade-surface`, text `--nextrade-ink`
- **Error**: Border `--nextrade-danger`, background `--nextrade-surface`, text `--nextrade-danger`

#### States
- Default, Hover, Focus, Error, Disabled, Read-only

### Cards

#### Variants
- **Standard**: Border `--nextrade-border`, background `--nextrade-surface`, shadow `card`
- **Interactive**: Standard with hover lift and enhanced shadow
- **Statistical**: Standard with padding `p-5`

#### States
- Default, Hover (for interactive), Loading, Error

### Badges

#### Variants
- **Success**: Background `--nextrade-success/20`, text `--nextrade-success`
- **Warning**: Background `--nextrade-warning/20`, text `--nextrade-warning`
- **Danger**: Background `--nextrade-danger/20`, text `--nextrade-danger`
- **Info**: Background `--nextrade-info/20`, text `--nextrade-info`
- **Neutral**: Background `slate-100`, text `slate-600`
- **Pending**: Background `--nextrade-warning/100`, text `--nextrade-warning`
- **Processing**: Background `--nextrade-info/100`, text `--nextrade-info`

### Tables

#### Variants
- **Standard**: Header with background-transparent, text `--nextrade-muted`, border-bottom `--nextrade-border`; Cell with border-bottom `slate-100`

#### States
- Default, Hover (on rows), Selected, Loading, Error

### Layout

#### Containers
- **Max Width**: `max-w-6xl` (from Tailwind, customizable)
- **Padding**: `px-4 py-6 sm:px-6 lg:px-8` (section)
- **Section Gap**: `py-12`

#### Grid
- **Base**: 12-column grid (Tailwind default)
- **Gutter**: `gap-4` (1rem)

## Usage

### CSS Variables
All colors are available as CSS variables (e.g., `var(--nextrade-blue)`) for use in custom CSS or inline styles.

### Tailwind Classes
The design system extends Tailwind with custom colors, border radius, shadows, and components.

#### Example: Primary Button
```html
<button class="nxt-btn nxt-btn-primary nxt-btn-md">
  Save Changes
</button>
```

#### Example: Input Field
```html
<input class="nxt-input" type="text" placeholder="Enter your email" />
```

#### Example: Card
```html
<div class="nxt-card nxt-card-interactive">
  <h3 class="text-title">Card Title</h3>
  <p class="text-body">Card content</p>
</div>
```

## Accessibility

- **Color Contrast**: All color combinations meet WCAG 2.1 AA for text and UI components.
- **Focus Visible**: Custom focus ring using `--nextrade-blue` with offset.
- **Touch Targets**: Minimum 44x44px for interactive elements.
- **Typography**: Base body size 16px for readability, scalable.
- **Motion**: Respects `prefers-reduced-motion`; transitions can be disabled.

## Responsive Design

- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px
- **Fluid Containers**: Use `max-w-6xl mx-auto` for centered content.
- **Stacking**: Columns stack vertically below `md` breakpoint.

## Internationalization (i18n)

- **Direction**: Supports LTR (English, French) and RTL (Arabic).
- **Typography**: Inter supports Arabic characters.
- **Layout**: Use `left`/`right` logical properties or Tailwind's `ltr:`/`rtl:` variants.
- **Text Expansion**: Designed to accommodate text expansion up to 30% for translation.

## Implementation Notes

### File Structure
- **Tokens**: `tailwind.config.js` (extends Tailwind theme)
- **Base Styles**: `src/index.css` (CSS variables and component base classes)
- **Components**: Built using the base classes and Tailwind utilities.

### Customization
To update the design system:
1. Modify `tailwind.config.js` for theme changes (colors, radii, shadows, etc.)
2. Update `src/index.css` for CSS variable changes and base component styles
3. Ensure all components use the design system classes and variables

### Migration
Existing components should be updated to use the new design system classes:
- Replace hardcoded colors with `nxt-*` classes or CSS variables
- Use the updated button, input, card, badge, and table base classes
- Apply the new shadow utilities (`shadow-card`, `shadow-panel`, etc.) as needed