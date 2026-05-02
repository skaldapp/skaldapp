# Skald

**Skald** – a tree-structured content editor where thought finds structure

Create notes, articles, and knowledge bases in an intuitive visual editor. Publish the result with one click — or simply work locally. Complex tools are only invoked when you need them.

## 📥 Download

| Platform                | Link                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| 🌐 **Web App**          | [Launch in browser](https://skaldapp.github.io/skaldapp)         |
| 🪟 **Windows**          | [Download](https://github.com/skaldapp/skaldapp/releases/latest) |
| 🍎 **macOS**            | [Download](https://github.com/skaldapp/skaldapp/releases/latest) |
| 🐧 **Linux (AppImage)** | [Download](https://github.com/skaldapp/skaldapp/releases/latest) |
| 🐧 **Ubuntu (Snap)**    | [Install from Snapcraft](https://snapcraft.io/skaldapp)          |

<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://skaldapp.github.io/uploads/dark.png">
<img alt="Skald" src="https://skaldapp.github.io/uploads/light.png">
</picture>

## Content that lives in your structure

- 💻 **Work with a tree hierarchy** of documents in the way that suits you

- ✍️ **The visual editor** hides technical details but leaves you in full control of formatting

- 🌐 **Build‑free publishing**: just copy the project folder to any hosting that supports static files

- 🔁 **Lossless migration**: move content to another platform without complex conversions

> **Your content — your property**\
> Skald doesn’t lock you into a platform. Your files are stored locally in standard formats (Markdown, JSON). Open formats mean freedom of choice today and content preservation tomorrow.

---

## Skald — for those who work with structured content

If you work with hierarchical information — Skald is made for you.

| Audience                 | Use case                                                                        |
| ------------------------ | ------------------------------------------------------------------------------- |
| ✍️ Researchers & authors | Organizing drafts, sources, and notes into a single tree‑structured base        |
| 📚 Technical writers     | Creating documentation with a clear hierarchy and instant publishing capability |
| 🎓 Educators & students  | Structuring learning materials, notes, and study guides                         |
| 💻 Developers            | Maintaining project documentation, personal wikis, rapid interface prototypes   |

---

## Functionality levels

> Each level is not about more features, but about fewer obstacles between you and the result.

### 🟢 EASY

Start writing within 30 seconds of launching. No setup — just text and structure.

- Write, structure, organize

- Visual editor and tree navigation help you stay focused on content

- Ideal for those who want to work immediately, without learning tools

[More about the easy mode →](https://skaldapp.github.io/easy/)

### 🔴 ADVANCED

Add formatting and metadata in the same interface. Don’t switch between tools — don’t lose context.

- Fine‑tune style via HTML and TailwindCSS

- Manage metadata without leaving the editor

- Professional content styling within your usual workflow

[More about the advanced mode →](https://skaldapp.github.io/medium/)

### 🔵 PROFESSIONAL

Embed interactivity without leaving the editor. No build configuration — just write code where it’s needed.

- Reactivity via Vue components right in the text

- Interactive documents, dynamic tables, complex interfaces

- Full integration with the frontend stack without compromises

[More about the professional mode →](https://skaldapp.github.io/hard/)

---

## 🤖 Your personal AI assistant

- 💡 **Content generation** — creative ideas in an interactive chat

- ✏️ **Smart autocomplete** — text in the visual editor

- 🛠️ **Code autocomplete** — Vue.js support

---

## ❓ Q&A

🤔 **How is Skald different from other Markdown editors?**\
Skald combines the freedom of a text editor with the discipline of structured data. You work with a tree hierarchy of documents in a visual interface, and the result — whether a local note or a public page — is always under your full control. Publishing doesn’t require a separate build process: the structure you see in the editor is the final product.

🤔 **What can you do with Skald?**\
Create and organize any tree‑structured content: from personal notes and book drafts to technical documentation and knowledge bases. Skald provides a unified space for writing, structuring, and (when needed) publishing. You can work completely offline, sync with the cloud, or instantly publish the result online — the strategy is up to you.

🤔 **How to preview a site in the browser during development?**\
There are many ways. If you’re comfortable with the command line, follow the advice from the official Vue.js website:

> To start a local HTTP server, install Node.js, then run the command `npx serve` in the project directory. You can also use any other HTTP server that supports static files with correct MIME types.

A simpler way is the program [Simple Web Server](https://simplewebserver.org). It’s free, cross‑platform, and lets you start a local server with a couple of clicks.

🤔 **Besides the file system, what storage systems does Skald work with?**\
In addition to the local file system (via the File System Access API), Skald supports any S3‑compatible cloud storage: AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces, and others. When connected, data is encrypted, it supports working with multiple accounts, and access can be protected by a PIN.

In the Electron version, files are saved locally, ensuring full offline work without dependency on browser restrictions.

🤔 **Can S3 storage be used as static hosting?**\
Yes, most S3‑compatible services (AWS S3, Cloudflare R2, DigitalOcean Spaces) support static website hosting mode. Just enable the option in the bucket settings — and its contents become accessible via a public URL. Skald content can be published directly: the site becomes available online immediately without extra configuration.

🤔 **Can I use Skald offline?**\
Yes. The Electron version provides full autonomy with native file system access. The browser version also works offline after the initial cache load.

Features requiring internet (S3 sync, AI integration) are temporarily unavailable offline, but all core operations — editing, saving, navigation — function fully autonomously.

🤔 **Is it safe to add secret keys to Skald?**\
Skald applies basic security measures: keys are stored encrypted, and S3 key access can be protected by a PIN. However, since the app runs client‑side, keys are stored in your device’s local storage.

Recommendations:

- Do not use keys with unlimited permissions
- Regularly monitor their usage
- Enable local protection via a PIN
- Use keys only on trusted devices

🤔 **Which operating systems does Skald support?**\
Skald works on all major platforms:

- **Browser version**: Chrome, Firefox, Edge, Safari on Windows, macOS, Linux, ChromeOS, and mobile devices
- **Electron version**: native builds for Windows, macOS, and Linux with direct file system access

All key features are available regardless of OS and launch method.

🤔 **Which AI models does Skald support?**\
Skald integrates with the **Mistral AI** platform and supports compatible models for:

- Content generation
- Smart text and code autocomplete
- Interactive chat assistant

A valid Mistral API key is required in the settings.

🤔 **Is Node.js required to run Skald?**\
No. The editor runs entirely client‑side: Vue component compilation, Markdown processing, and site structure generation happen directly in the browser.

This lets you start working instantly — without installing dependencies, configuring environments, or running build processes.

🤔 **Was vibe coding used in developing Skald?**\
No, all code is written by hand — a deliberate architectural choice. Manual development ensures full control over logic, predictable behavior, and high maintainability.

Tech stack:

- TypeScript in strict mode (`strict: true`)
- `@vue/eslint-config-typescript` — strict typing for Vue
- `eslint-plugin-sonarjs` — detection of vulnerabilities and complex patterns
- Prettier + `eslint-plugin-perfectionist` — code formatting
- A suite of plugins for linting styles, manifests, and dependencies

🤔 **What are Skald’s shortcomings?**\
Skald prioritizes ease of development and instant feedback. Navigation for large projects happens client‑side. For most scenarios (documentation, blogs, knowledge bases) this is unnoticeable.

If you’re building a high‑traffic public portal with millions of visits, you might consider server‑rendered solutions — but then you lose simplicity and editing speed.

🤔 **What are your plans for the future?**\
We believe the word should take shape without intermediaries. Our mission is to erase the line between conception and publication, so that every person, regardless of technical skill, can easily and confidently share their ideas with the world.

Ahead lies a path toward even greater compatibility, intuitiveness, and accessibility. We strive to make publishing on the internet as natural as writing a letter: _open, write, share_. No setup, no builds, no barriers.

---

> Let technology serve people, not the other way around.

🔗 **Official website**: [skaldapp.github.io](https://skaldapp.github.io)\
🐙 **Source code**: [github.com/skaldapp/skaldapp](https://github.com/skaldapp/skaldapp)\
📦 **Snap Store**: [snapcraft.io/skaldapp](https://snapcraft.io/skaldapp)
