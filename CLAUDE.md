# CMS Development Guidelines for Claude

## Overview

The HeyAgent CMS is a Next.js application that provides an admin interface for managing content. It consumes the HeyAgent API and runs on port 3001 alongside the website (port 3000) and API (port 8787).

## Development Server Management

### Using Root Scripts (Recommended)
All servers are managed through convenient scripts in the root directory:

```bash
cd /home/tishmen/heyagent
./start.sh    # Starts API, Website, and CMS
./stop.sh     # Stops all servers
./status.sh   # Check status of all servers
./logs.sh     # Tail logs from all servers
```

### CMS-Specific Details
- **Port**: 3001 (website uses 3000, API uses 8787)
- **Process File**: `cms/dev.pid`
- **Log File**: `cms/dev.log`
- **URL**: http://localhost:3001

## Testing Requirements

### After Every Change
1. **Local Testing**: 
   ```bash
   curl http://localhost:3001
   ```
   Verify the CMS loads and displays content correctly

2. **API Integration Testing**:
   - Ensure CMS can connect to API at localhost:8787
   - Test CRUD operations work correctly
   - Verify error handling for API failures

3. **Deployment Testing**:
   ```bash
   npm run preview  # Test Cloudflare Workers locally
   npm run deploy   # Deploy to production
   ```

## API Integration

### Configuration
- API URL is configured via environment variables
- For local development: `NEXT_PUBLIC_API_URL=http://localhost:8787`
- Store in `.dev.vars` file (gitignored)

### API Client Pattern
```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export async function fetchChangelog() {
  const response = await fetch(`${API_URL}/api/v1/changelog`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}
```

### CORS Considerations
- API must allow requests from localhost:3001
- Production CMS domain must be whitelisted in API CORS config

## Deployment

```bash
# Build for Cloudflare Workers
npm run build

# Deploy to production
npm run deploy

# Preview deployment locally
npm run preview
```

## Git Workflow

### Repository
- **URL**: https://github.com/heyagent/cms

### Files to Never Commit
- `dev.pid` - Process ID file
- `dev.log` - Development logs
- `.next/` - Next.js build output
- `.open-next/` - OpenNext build output
- `node_modules/` - Dependencies
- `.wrangler/` - Wrangler state
- `.dev.vars` - Local environment variables

## Project Structure

```
cms/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (admin)/           # Protected admin routes
│   │   ├── changelog/     # Changelog management
│   │   └── blog/          # Blog management
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── forms/            # Form components
│   ├── tables/           # Data table components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities
│   ├── api.ts            # API client functions
│   └── auth.ts           # Authentication helpers
├── types/                 # TypeScript definitions
└── public/                # Static assets
```

## Development Patterns

### Adding New Admin Pages
1. Create route in `app/(admin)/[feature]/page.tsx`
2. Add navigation link to admin layout
3. Implement data fetching with server components
4. Add client-side interactions as needed

### Implementing CRUD Operations

**List Page Pattern**:
```typescript
// app/(admin)/changelog/page.tsx
export default async function ChangelogList() {
  const data = await fetchChangelog();
  return <ChangelogTable data={data} />;
}
```

**Form Handling Pattern**:
```typescript
// components/forms/ChangelogForm.tsx
'use client';

export function ChangelogForm() {
  async function handleSubmit(formData: FormData) {
    // Client-side validation
    // API call
    // Error handling
    // Success feedback
  }
}
```

### Authentication Integration (Future)
- Plan for JWT-based authentication
- Protected routes using middleware
- Role-based access control
- Session management

## CMS-Specific Features

### Content Types
1. **Changelog Entries**
   - Version, date, title, summary
   - Lists of improvements and fixes
   - Status (draft/published)

2. **Blog Posts**
   - Title, slug, content, excerpt
   - Categories, tags, author
   - Featured image, SEO metadata
   - Publication date and status

### Rich Text Editor
- Consider integrating TipTap or Lexical
- Support for markdown import/export
- Image upload handling
- Code syntax highlighting

### Media Management
- Upload to Cloudflare R2 or Images
- Image optimization on upload
- Gallery view for media library
- Alt text and metadata

## Performance Considerations

### Optimizations
- Use Next.js server components for initial data
- Implement proper loading states
- Add pagination for large datasets
- Cache API responses appropriately
- Optimize bundle size

### Edge Runtime
- CMS runs on Cloudflare Workers edge
- Be mindful of edge limitations
- Use compatible libraries only

## Common Tasks

### Update Changelog Entry
1. Fetch existing entry from API
2. Display in form for editing
3. Validate changes
4. Submit to API endpoint
5. Handle success/error states
6. Redirect to list view

### Add New Blog Post
1. Create form with all fields
2. Implement rich text editor
3. Handle image uploads
4. Preview functionality
5. Save as draft or publish
6. Generate SEO metadata

## Debugging

### Common Issues
- **API Connection Failed**: Check API is running on 8787
- **CORS Errors**: Verify API allows CMS origin
- **Build Failures**: Check for edge-compatible imports
- **Authentication Issues**: Verify token handling

### Debug Commands
```bash
# Check CMS logs
tail -f cms/dev.log

# Test API connection
curl http://localhost:8787/health

# Verify build
npm run build
```

## Future Enhancements

### Planned Features
- [ ] User authentication system
- [ ] Role-based permissions
- [ ] Activity audit logs
- [ ] Content versioning
- [ ] Scheduled publishing
- [ ] Webhook integrations
- [ ] Analytics dashboard
- [ ] Bulk operations

### API Enhancements Needed
- Admin-specific endpoints
- Authentication middleware
- File upload endpoints
- Batch operations
- WebSocket for real-time updates

## Important Notes

- Always test with all three services running
- CMS is frontend-only, all data operations go through API
- Follow the established Next.js and React patterns
- Maintain consistency with website styling where appropriate
- Consider mobile responsiveness for admin interfaces
- Implement proper error boundaries
- Add loading skeletons for better UX

This document serves as the source of truth for CMS development practices within the HeyAgent project.