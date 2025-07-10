# HeyAgent CMS

Admin interface for managing HeyAgent content including changelog and blog posts.

## Overview

This is a Next.js application that serves as the content management system for HeyAgent. It consumes the HeyAgent API to provide a user-friendly interface for managing:

- Changelog entries
- Blog posts
- Categories and tags
- Authors

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Styling**: Tailwind CSS v4
- **Deployment**: Cloudflare Workers via @opennextjs/cloudflare
- **API**: Consumes HeyAgent API at localhost:8787

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- Access to HeyAgent API

### Local Development

```bash
# Install dependencies
npm install

# Start development server (port 3001)
npm run dev

# The CMS will be available at:
# http://localhost:3001
```

### Using Root Scripts

The CMS is integrated with HeyAgent's root development scripts:

```bash
# From the root directory (/home/tishmen/heyagent)

# Start all services (API, Website, CMS)
./start.sh

# Check status of all services
./status.sh

# View logs from all services
./logs.sh

# Stop all services
./stop.sh
```

## Deployment

```bash
# Build and deploy to Cloudflare Workers
npm run deploy
```

## Project Structure

```
cms/
├── app/              # Next.js app directory
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/       # React components
├── lib/             # Utilities and API client
├── public/          # Static assets
└── types/           # TypeScript type definitions
```

## Environment Variables

Create a `.dev.vars` file for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## Features (Planned)

- [ ] Authentication system
- [ ] Changelog CRUD operations
- [ ] Blog post management
- [ ] Rich text editor
- [ ] Media uploads
- [ ] Category/tag management
- [ ] User management
- [ ] Activity logs

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with all services running
4. Submit a pull request

## License

Private - HeyAgent proprietary software