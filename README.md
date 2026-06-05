# Misskey PWA Client

A Progressive Web App (PWA) client for Misskey, a decentralized social media platform.

## Features

- 📱 **PWA Support** - Install as an app on your device
- ⚡ **Real-time Updates** - Get instant updates via WebSocket
- 🔒 **Secure Authentication** - MiAuth for secure login
- 🌐 **Timeline** - View and post notes
- 🎨 **Modern UI** - Clean and responsive design

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Hono (API routing/SSR)
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages
- **Testing**: Vitest + Playwright
- **PWA**: vite-plugin-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/misskey-pwa-client.git
cd misskey-pwa-client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Build for production

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests

# Deployment
npm run deploy       # Deploy to Cloudflare Pages
```

## Project Structure

```
src/
├── client/           # React frontend
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries
│   ├── types/        # TypeScript type definitions
│   ├── App.tsx       # Main App component
│   ├── main.tsx      # Entry point
│   └── index.css     # Global styles
├── server/           # Hono backend
│   └── index.ts      # Server entry point
└── test/             # Test files
```

## Authentication

This app uses **MiAuth** for authentication. MiAuth is a secure authentication method for Misskey that:

1. Generates a unique session ID
2. Redirects user to their Misskey instance
3. User authorizes the app
4. App receives authentication token

## Deployment

### Cloudflare Pages

1. Push your code to GitHub
2. Connect your repository to Cloudflare Pages
3. Set the following environment variables:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Deploy automatically on push to main

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Misskey](https://misskey.io/) - The decentralized social media platform
- [misskey-js](https://github.com/misskey-dev/misskey/tree/develop/packages/misskey-js) - Official Misskey SDK
- [Hono](https://hono.dev/) - Lightweight web framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
