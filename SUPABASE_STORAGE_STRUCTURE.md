# Supabase Storage Structure Documentation

## Storage Buckets

### `assets` (Public Bucket)
Main public bucket for all game assets stored on Supabase Storage.

**Base URL**: `https://[PROJECT].supabase.co/storage/v1/object/public/assets/`

## Directory Structure

```
assets/
├── cards/
│   ├── vehicle/
│   │   └── {make}-{model}-{year}.jpg
│   │   └── Example: ferrari-488-gtb-2015.jpg
│   └── circuit/
│       └── {name}-{country}.jpg
│       └── Example: monza-italy.jpg
│
├── logos/
│   └── brand/
│       └── {make}.png
│       └── Example: ferrari.png
│
├── icons/
│   ├── power.svg
│   ├── torque.svg
│   ├── speed.svg
│   ├── acceleration.svg
│   ├── weight.svg
│   ├── temp.svg
│   ├── steering.svg
│   ├── type.svg
│   └── transmission/
│       ├── fwd.svg
│       ├── rwd.svg
│       └── awd.svg
│
└── placeholders/
    ├── card-back.png
    ├── brand-logo.png
    ├── no-image.png
    ├── vehicle-placeholder.png
    └── circuit-placeholder.png
```

## File Naming Conventions

### Vehicle Cards
- **Pattern**: `cards/vehicle/{make}-{model}-{year}.jpg`
- **Normalization**: Lowercase, spaces → hyphens, special chars removed
- **Examples**:
  - Ferrari 488 GTB 2015 → `ferrari-488-gtb-2015.jpg`
  - Audi R8 V10 Plus 2016 → `audi-r8-v10-plus-2016.jpg`
  - Porsche 911 GT3 RS 2018 → `porsche-911-gt3-rs-2018.jpg`

### Circuit Cards
- **Pattern**: `cards/circuit/{name}-{country}.jpg`
- **Normalization**: Same as vehicle cards
- **Examples**:
  - Autodromo Nazionale di Monza, Italy → `monza-italy.jpg`
  - Circuit de Spa-Francorchamps, Belgium → `spa-francorchamps-belgium.jpg`

### Brand Logos
- **Pattern**: `logos/brand/{make}.png`
- **Format**: PNG with transparency recommended
- **Examples**:
  - Ferrari → `ferrari.png`
  - Lamborghini → `lamborghini.png`

### Icons
- **Format**: SVG preferred for scalability
- **Location**: `icons/` directory
- **Naming**: Lowercase, descriptive (power.svg, torque.svg, etc.)

## Placeholders

All placeholders are located in `placeholders/` directory:

| Placeholder | Usage |
|-------------|-------|
| `card-back.png` | Default card back image |
| `brand-logo.png` | Fallback when brand logo missing |
| `no-image.png` | Generic "no image" placeholder |
| `vehicle-placeholder.png` | Vehicle card fallback |
| `circuit-placeholder.png` | Circuit card fallback |

## Access Patterns

### Via Code
All images should be resolved using the centralized image utilities in `src/lib/images/`:

```typescript
import { getPublicImage, resolveCardImage, IMAGE_PATHS } from '@/lib/images';

// Resolve a vehicle card
const imageUrl = resolveCardImage({
  type: 'vehicle',
  make: 'Ferrari',
  model: '488 GTB',
  year: 2015
});
// → https://[PROJECT].supabase.co/storage/v1/object/public/assets/cards/vehicle/ferrari-488-gtb-2015.jpg

// Get an icon
const iconUrl = getPublicImage(IMAGE_PATHS.ICONS.POWER);
// → https://[PROJECT].supabase.co/storage/v1/object/public/assets/icons/power.svg
```

### Direct URLs
Format: `https://[PROJECT-ID].supabase.co/storage/v1/object/public/assets/[PATH]`

Example: `https://jkrmpvkfgbkewwtuekxm.supabase.co/storage/v1/object/public/assets/icons/power.svg`

## Bucket Configuration

### Public Access
The `assets` bucket should be configured as **public** in Supabase Dashboard:
1. Go to Storage → Policies
2. Enable public read access
3. Keep write access restricted to authenticated users/service role

### CORS Configuration
Ensure CORS is configured to allow access from your application domain:
- Development: `http://localhost:3000`
- Production: Your deployed domain

## Upload Guidelines

### Image Specifications

| Asset Type | Format | Recommended Size | Max Size |
|------------|--------|------------------|----------|
| Vehicle Cards | JPG | 800×1120px (aspect 63:88) | 2MB |
| Circuit Cards | JPG | 800×1120px (aspect 63:88) | 2MB |
| Brand Logos | PNG | 200×200px | 100KB |
| Icons | SVG | Vector | 50KB |
placeholders | PNG/JPG | Varies | 500KB |

### Quality Guidelines
- Vehicle/Circuit cards: 85-90% JPG quality
- Logos: PNG with transparency
- Icons: Optimized SVG (remove metadata)
- Compress all images before upload

## Maintenance

### Missing Assets
If an asset is not found, the system will:
1. Try the primary image URL
2. Fall back to auto-generated key
3. Use type-specific placeholder
4. Log error in development mode

### Asset Auditing
Check for missing assets:
```bash
# List all vehicle cards in database vs. storage
# Compare with actual files in bucket
```

## Security Notes

- **Public bucket**: Anyone can read, only authenticated can write
- **No sensitive data**: All images are publicly accessible
- **Rate limiting**: Consider Supabase storage rate limits
- **CDN**: Supabase provides automatic CDN caching

---

**Last Updated**: December 26, 2025  
**Maintained By**: Development Team
