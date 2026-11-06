# Skald

#### markdown and vue editor, static site generator

---

✌️ Two editing modes:

- visual for markdown
- syntax highlighting for vue

🧩 Using vue in markdown like in [vitepress](https://vitepress.dev/guide/using-vue)\
🧱 You can use [component syntax in markdown](https://comark.dev/syntax/components)\
🎨 Built-in support for tailwind 4 classes for styling\
🌳 Tree structure with vue router support\
🏷️ Manage page attributes via frontmatter\
📦 Direct import of Vue components and modules from: https://esm.run, https://esm.sh, https://esm.unpkg.com, https://skypack.dev \
🤖 OpenAI support for code and text autocomplete, built-in chatbot

🪄 **And now the main magic** — copy the created content to any web server or publish it to github pages and the site comes alive.

> No settings, no precompilation, no build. Just copy.

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

## Functionality levels

### 🟢 Simple

Start writing immediately after launch. No setup — just text and structure.

- Write, structure, organize

- The visual editor and tree navigation help you keep focus on the content

- Ideal for those who want to work right away without learning the tools

[Learn more about simple mode →](https://skaldapp.github.io/easy/)

### 🔴 Advanced

Add formatting and metadata in the same interface. Don't switch between tools — don't lose context.

- Fine-tune styling via HTML and TailwindCSS

- Manage metadata without leaving the editor

- Professional content formatting in your usual workflow

[Learn more about advanced mode →](https://skaldapp.github.io/medium/)

### 🔵 Professional

Embed interactivity without leaving the editor. Don't configure a build — just write code where it is needed.

- Reactivity via Vue components right in the text

- Interactive documents, dynamic tables, complex interfaces

- Full integration with the frontend stack without compromises

[Learn more about professional mode →](https://skaldapp.github.io/hard/)

---

## ❓ Q&A

🤔 **How is Skald different from other Markdown editors?**

In Skald you write texts, not program. Skald automatically turns texts into a website. Publishing does not require a separate build process: the structure you see in the editor is the final product.

🤔 **What can you do with Skald?**

Create and organize any tree-structured content: from personal notes and book drafts to technical documentation and knowledge bases. Skald is a flexible tool for working with text that can be as simple as a blog or as complex as a web application.

🤔 **How can I view the site in a browser during development?**

There are many ways. If you are comfortable with computers, use the advice from the official Vue.js website:

> To run a local HTTP server, install Node.js, then run the command `npx serve` in the project directory. You can also use any other HTTP server that supports static files with the correct MIME types.

A simpler way is the [Simple Web Server](https://simplewebserver.org) program. It is free, cross-platform, and lets you start a local server in a couple of clicks.

🤔 **Besides the file system, what storage systems does Skald work with?**

In addition to the local file system, Skald supports any S3-compatible cloud storage: AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces, and others. When connected, data is encrypted, support for multiple accounts is available, and access protection via PIN code is provided.

🤔 **Can S3 storage act as static hosting?**

Yes, most S3-compatible storages (AWS S3, Cloudflare R2, DigitalOcean Spaces) support static website hosting mode. Just enable the option in the bucket settings — and its contents become available at a public URL. Skald can work with S3-compatible storages directly — the site is immediately available on the internet without additional copying.

🤔 **Can Skald be used offline?**

Yes. The Electron version provides full autonomy with native access to the file system. The browser version also works without a connection after the initial cache load.

Features that require the internet (S3 synchronization, AI integration) are temporarily unavailable when working offline, but all basic operations — editing, saving, navigation — function fully autonomously.

🤔 **Is it safe to add secret keys to Skald?**

Skald applies basic protection measures: keys are stored encrypted, and access to S3 keys can be protected by PIN code. However, since the application runs on the client side, keys are stored in your device's local storage.

Recommendations:

- Do not use keys with unlimited permissions

- Regularly monitor their usage

- Enable local protection via PIN code

- Use keys only on trusted devices

🤔 **What operating systems does Skald support?**

Skald works on all major platforms:

- **Browser version**: Chrome, Firefox, Edge, Safari on Windows, macOS, Linux, ChromeOS, and mobile devices

- **Electron version**: native builds for Windows, macOS, and Linux with direct file system access

All key features are available regardless of OS and launch method.

🤔 **What AI models does Skald support?**

Skald implements support for the OpenAI protocol, which allows connecting any compatible models. The integration enables the following features:

- Content generation;

- Smart text and code autocomplete;

- Interactive chat assistant.

🤔 **Is Node.js required for Skald to work?**

No. The editor functions entirely on the client side: compilation of Vue components, Markdown processing, and site structure generation are performed directly in the browser.

This allows you to start working instantly — without installing dependencies, setting up an environment, or running build processes.
