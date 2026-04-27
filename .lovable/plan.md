

## Add Share Functionality to Blog Posts

### Overview
Add social sharing buttons to each blog post page, allowing readers to share articles on Facebook, Twitter/X, LinkedIn, WhatsApp, and copy the link.

### Changes Required

**1. Create ShareButtons Component** (`src/components/blog/ShareButtons.tsx`)
- Share buttons for: Facebook, Twitter/X, LinkedIn, WhatsApp
- Copy link button with visual feedback
- Native Web Share API support for mobile devices
- Hover effects with brand colors (Facebook blue, Twitter black, LinkedIn blue, WhatsApp green)
- Responsive layout with icon-only buttons

**2. Update BlogPost Page** (`src/pages/BlogPost.tsx`)
- Import and add ShareButtons component
- Position share buttons below the article metadata (date, reading time)
- Pass post title, URL, description, and cover image to ShareButtons

**3. Verify Integration**
- Share buttons appear on all blog post pages
- Each button opens correct share dialog/link
- Copy link function works with visual feedback
- Mobile native share works when available

