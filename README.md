# Skald

**Skald** is an open-source, browser-based Vue.js web editor that enables creating static websites with Vue Single-File Components (SFCs) without requiring a Node.js setup. The application features runtime SFC compilation, Monaco editor integration, WYSIWYG mode, Tailwind CSS / UnoCSS support, multiple storage options, and Electron desktop app capabilities.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Browser-based editing**: No need to install Node.js or any other dependencies
- **Runtime SFC compilation**: Edit Vue Single File Components directly in the browser
- **Dual editing modes**: Switch between WYSIWYG editor (using Milkdown) and Markdown editor (using Monaco)
- **Multiple storage options**: Store content locally via File System Access API (@skaldapp/fsa) or remotely via S3-compatible services
- **AI integration**: Integrated with Mistral AI (via AI SDK) for enhanced editing capabilities
- **Internationalization**: Built-in support for multiple languages (English en-US, Russian ru-RU)
- **Electron desktop app**: Cross-platform desktop application with auto-update support
- **SEO-friendly**: Automatic sitemap generation and SEO metadata management with Unhead
- **Customizable themes**: Light/dark mode support with UnoCSS styling
- **Frontmatter support**: YAML frontmatter for page metadata

## Technology Stack

| Category             | Technologies                      |
| -------------------- | --------------------------------- |
| **Framework**        | Vue 3.5+, Quasar Framework 2.18+  |
| **Build Tool**       | Vite 7+, Quasar App Vite          |
| **Language**         | TypeScript (strict mode)          |
| **State Management** | Pinia 3+                          |
| **Routing**          | Vue Router 5+                     |
| **Editor**           | Monaco Editor 0.52.2              |
| **Markdown**         | Milkdown 7.19+                    |
| **CSS**              | UnoCSS 66+, Tailwind CSS, PostCSS |
| **Desktop**          | Electron 40+, @electron/remote    |
| **Storage**          | @skaldapp/fsa, AWS SDK v3         |
| **AI**               | AI SDK (Mistral, Vue integration) |
| **i18n**             | Vue I18n 11+                      |

## Installation

### Prerequisites

- Node.js 18+ (for development/building)
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

1. Open the application in your browser (or run as Electron desktop app)
2. Choose a storage option (local filesystem or S3-compatible service)
3. Create pages using the tree structure
4. Edit content using either the WYSIWYG editor or Monaco editor
5. Publish your site with custom domain support

### Storage Options

- **Local File System**: Use the browser's File System Access API (@skaldapp/fsa) to store files locally
- **S3-Compatible Services**: Connect to AWS S3 or other S3-compatible storage providers
- **Electron**: When running as a desktop app, files are stored locally

### AI Integration

Skald integrates with Mistral AI via the AI SDK to provide:

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

## Project Structure

```
skaldapp/
├── src/                    # Main Vue application source
│   ├── boot/               # Boot files (main, route, i18n, monaco)
│   ├── components/         # Vue components
│   │   ├── dialogs/        # Modal dialog components
│   │   └── VAiChat.vue     # AI chat interface
│   ├── css/                # Global CSS/SCSS
│   ├── i18n/               # Internationalization files
│   ├── layouts/            # Layout components
│   ├── pages/              # Page components
│   ├── router/             # Router configuration
│   ├── stores/             # Pinia stores
│   │   ├── data.ts         # Page/data management with SEO meta handling
│   │   ├── io.ts           # File I/O operations via @skaldapp/fsa
│   │   ├── s3.ts           # S3 storage integration
│   │   ├── main.ts         # UI state and user preferences
│   │   └── defaults.ts     # Default values and constants
│   └── App.vue             # Root component
├── src-electron/           # Electron main process code
│   ├── electron-main.ts    # Electron main entry
│   └── electron-preload.ts # Preload script
├── public/                 # Static assets (favicons)
├── runtime/                # Build output directory
├── quasar.config.ts        # Quasar framework configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── eslint.config.ts        # ESLint configuration (flat config)
├── uno.config.ts           # UnoCSS configuration
└── release-notes.md        # Release notes
```

### State Management

The application uses Pinia for state management with the following stores:

- **data store** (`data.ts`): Manages page content, metadata, and SEO meta handling
- **io store** (`io.ts`): Handles file I/O operations via @skaldapp/fsa
- **s3 store** (`s3.ts`): Handles S3-compatible storage operations
- **main store** (`main.ts`): Manages UI state and user preferences
- **defaults store** (`defaults.ts`): Provides default values and constants

### Architecture Patterns

1. **Composition API**: All Vue components use `<script setup>` with Composition API
2. **Monaco Editor**: Custom Monaco SFC integration for Vue file editing
3. **File System**: Uses @skaldapp/fsa for File System Access API with multiple storage backends (S3, local)
4. **Electron Integration**:
   - Main process in `src-electron/electron-main.ts`
   - Uses `@electron/remote` for renderer-main communication
   - DevTools disabled in production
5. **SEO**: Automatic meta tags inferred using `InferSeoMetaPlugin` from Unhead

## Development

### Available Scripts

| Command                  | Description                                  |
| ------------------------ | -------------------------------------------- |
| `npm run dev`            | Start development server                     |
| `npm run build`          | Build for production (web)                   |
| `npm run dev:electron`   | Start Electron development                   |
| `npm run build:electron` | Build Electron application                   |
| `npm run lint`           | Run ESLint                                   |
| `npm install`            | Install dependencies (runs `quasar prepare`) |

### Environment Configuration

The application uses Vite for building and development. Configuration is handled in:

- `quasar.config.ts`: Quasar framework configuration with Vite extensions
- `tsconfig.json`: TypeScript configuration (strict mode enabled)
- `uno.config.ts`: UnoCSS configuration
- `eslint.config.ts`: ESLint flat configuration

### Code Style

- **Indentation**: 2 spaces (see `.editorconfig`)
- **Line ending**: LF
- **Charset**: UTF-8
- **Final newline**: Required
- **Trailing whitespace**: Trimmed

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

- Follow Vue 3 Composition API best practices with `<script setup>`
- Use TypeScript with strict mode for type safety
- Maintain consistent code style (ESLint flat config)
- Write clear commit messages following conventional commits
- Update documentation as needed
- Test changes in both web and Electron modes

## License

This project is licensed under the AGPL-3.0-or-later License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Vue.js team for the excellent framework
- Quasar team for the comprehensive UI framework
- Monaco Editor team for the powerful code editor
- Milkdown team for the modern WYSIWYG editor
- All contributors who help improve Skald

---

**Repository**: [github.com/skaldapp/skaldapp](https://github.com/skaldapp/skaldapp)  
**Author**: Jerry Bruwes <jbruwes@gmail.com>
