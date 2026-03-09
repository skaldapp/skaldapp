# Skald

Skald is an open-source browser-based Vue.js web editor that allows creating static websites with Vue SFCs without Node.js setup. Features runtime SFC compilation, Monaco editor, WYSIWYG mode, Tailwind CSS, and multiple storage options.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Storage Options](#storage-options)
- [AI Integration](#ai-integration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Browser-based editing**: No need to install Node.js or any other dependencies
- **Runtime SFC compilation**: Edit Vue Single File Components directly in the browser
- **Dual editing modes**: Switch between WYSIWYG editor (using Milkdown) and Markdown editor (using Monaco)
- **Multiple storage options**: Store content locally via File System Access API or remotely via S3-compatible services
- **AI integration**: Integrated with Mistral AI for enhanced editing capabilities
- **Internationalization**: Built-in support for multiple languages (currently English and Russian)
- **Electron support**: Can be packaged as a desktop application
- **SEO-friendly**: Automatic sitemap generation and SEO metadata management
- **Customizable themes**: Light/dark mode support with UnoCSS styling

## Installation

### Prerequisites

- Node.js (for development/building)
- npm or yarn

### Development Setup

```bash
# Clone the repository
git clone https://github.com/skaldapp/skaldapp.git
cd skaldapp

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build for web
npm run build

# Build for Electron
npm run build:electron
```

## Usage

### Getting Started

1. Open the application in your browser
2. Choose a storage option (local filesystem or S3-compatible service)
3. Create pages using the tree structure
4. Edit content using either the WYSIWYG editor or Markdown editor
5. Publish your site with custom domain support

### Storage Options

- **Local File System**: Use the browser's File System Access API to store files locally
- **S3-Compatible Services**: Connect to AWS S3 or other S3-compatible storage providers
- **Electron**: When running as a desktop app, files are stored locally

### AI Integration

Skald integrates with Mistral AI to provide:

- Smart completions in the Monaco editor
- AI-powered content suggestions in the WYSIWYG editor
- AI chat interface for content creation assistance

To use AI features, you need to provide a Mistral API key in the settings.

### Frontmatter Support

Each page supports YAML frontmatter for metadata:

```yaml
---
title: Page Title
description: Page Description
attrs:
  un-cloak: true
  class:
    - container
    - mx-auto
    - prose
hidden: false
template: false
icon: twemoji:page-facing-up
---
```

## Architecture

### Core Technologies

- **Vue 3**: Progressive JavaScript framework with Composition API
- **Quasar**: Full-featured Vue.js framework for responsive apps
- **Monaco Editor**: Microsoft's web-based code editor
- **Milkdown**: Modern and customizable WYSIWYG editor
- **UnoCSS**: Instant on-demand atomic CSS engine
- **Pinia**: Intuitive store for Vue applications
- **Vite**: Fast build tool with hot module replacement

### Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── dialogs/         # Modal dialog components
│   └── VAiChat.vue      # AI chat interface
├── layouts/             # Application layouts
├── pages/               # Route components
├── stores/              # Pinia stores for state management
├── assets/              # Static assets
├── boot/                # Application boot files
└── i18n/                # Internationalization files
```

### State Management

The application uses Pinia for state management with three main stores:

- **data store**: Manages page content and metadata
- **main store**: Handles UI state and user preferences
- **io store**: Manages data persistence and storage operations
- **s3 store**: Handles S3-compatible storage operations

### Data Flow

1. User creates/edit content through UI
2. Changes are saved to Monaco editor models
3. Models are persisted to storage (local or remote)
4. HTML pages are generated from Markdown content
5. SEO metadata is applied using Unhead

## Storage Options

### Local Storage

- Uses the browser's File System Access API
- Stores content as Markdown files
- Generates static HTML pages
- Supports custom domains via CNAME file

### Remote Storage (S3 Compatible)

- Connect to AWS S3 or compatible services
- Secure credential management with encryption
- Supports multiple accounts
- Pin protection for sensitive credentials

## AI Integration

### Mistral AI

The application integrates with Mistral AI for:

- Code completion in the Monaco editor
- Content suggestions in the WYSIWYG editor
- AI chat interface for content creation

### Setting Up AI

1. Obtain a Mistral API key from [Mistral Console](https://console.mistral.ai/api-keys)
2. Navigate to the AI settings in the application
3. Enter your API key
4. AI features will be enabled throughout the application

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run dev:electron`: Start Electron development
- `npm run build:electron`: Build Electron application
- `npm run lint`: Run ESLint

### Environment Configuration

The application uses Vite for building and development. Configuration is handled in:

- `vite.config.ts`: Vite configuration
- `quasar.config.ts`: Quasar-specific configuration
- `uno.config.ts`: UnoCSS configuration

### Internationalization

The application supports multiple languages:

- English (en-US)
- Russian (ru-RU)
- Additional languages can be added in the `src/i18n` directory

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Follow Vue 3 Composition API best practices
- Use TypeScript for type safety
- Maintain consistent code style (ESLint/Prettier configured)
- Write clear commit messages
- Update documentation as needed

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Vue.js team for the excellent framework
- Quasar team for the comprehensive UI framework
- Monaco Editor team for the powerful code editor
- Milkdown team for the modern WYSIWYG editor
- All contributors who help improve Skald
