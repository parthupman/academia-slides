# AcademiaSlides 📊🎓

Transform your research papers into stunning academic presentations with AI.

## Features ✨

- **AI-Powered Analysis**: Automatically extracts title, authors, abstract, sections, and key findings
- **Smart Slide Generation**: Creates well-structured presentations based on paper content
- **Customizable Templates**: 5 beautiful academic themes (Minimal, Modern, Academic, Dark, Vibrant)
- **Slide Count Control**: Choose from 5-50 slides based on your needs
- **Mobile-Friendly PWA**: Works on web and mobile devices
- **Google Play Store Ready**: Can be published as native Android app
- **Instant PPTX Export**: Download PowerPoint files ready to present

## Tech Stack 🛠️

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-4o
- **PDF Parsing**: pdf-parse
- **PPT Generation**: pptxgenjs
- **Deployment**: Vercel-ready

## Getting Started 🚀

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd academia-slides
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment 🌐

### Deploy on Vercel (Web)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import project on Vercel
3. Add `OPENAI_API_KEY` to environment variables
4. Deploy!

### Deploy on Google Play Store (Android App)

Want to distribute as a native Android app? We support **Trusted Web Activity (TWA)**!

**Quick Steps:**

1. **Deploy web app to Vercel first** (get your URL)

2. **Prepare Android project:**
```powershell
cd scripts
.\prepare-playstore.ps1
```

3. **Generate signing keystore:**
```bash
cd android/app
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

4. **Set up Digital Asset Links:**
```powershell
cd scripts
.\generate-assetlinks.ps1
```

5. **Build in Android Studio:**
   - Open the `android` folder in Android Studio
   - Build → Generate Signed Bundle/APK
   - Select "Android App Bundle"

6. **Upload to Google Play Console**

📖 **Detailed Guide:** See [DEPLOY-TO-PLAYSTORE.md](DEPLOY-TO-PLAYSTORE.md)

## How It Works 🔍

1. **Upload**: Drag & drop your PDF research paper
2. **Analyze**: AI extracts structure, key points, and metadata
3. **Customize**: Choose slide count, theme, and focus areas
4. **Generate**: AI creates professional slides
5. **Download**: Get your PPTX file instantly

## Project Structure 📁

```
academia-slides/
├── app/                    # Next.js app router
│   ├── api/
│   │   ├── analyze/        # PDF analysis endpoint
│   │   └── generate/       # PPT generation endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Main application
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── file-upload.tsx
│   ├── analysis-result.tsx
│   ├── options-panel.tsx
│   └── slide-preview.tsx
├── lib/                    # Utility functions
│   ├── ai.ts              # OpenAI integration
│   ├── ppt-generator.ts   # PPTX generation
│   ├── pdf-parser.ts      # PDF text extraction
│   └── utils.ts
├── android/                # Android TWA project (for Play Store)
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml
│   │   └── res/values/strings.xml
│   └── build.gradle
├── scripts/                # Helper scripts
│   ├── prepare-playstore.ps1
│   └── generate-assetlinks.ps1
├── types/
│   └── index.ts           # TypeScript types
├── public/
│   └── manifest.json      # PWA manifest
└── next.config.js
```

## Environment Variables 🔐

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (optional) | No |

## API Routes 🔌

### POST /api/analyze
Analyzes a PDF research paper.

**Request**: `multipart/form-data` with PDF file

**Response**:
```json
{
  "success": true,
  "analysis": {
    "title": "Paper Title",
    "authors": ["Author 1", "Author 2"],
    "abstract": "Abstract text...",
    "sections": [...],
    "keywords": [...]
  },
  "slideEstimate": { "min": 5, "max": 30, "recommended": 15 },
  "wordCount": 5000,
  "pageCount": 10
}
```

### POST /api/generate
Generates a PowerPoint presentation.

**Request**:
```json
{
  "analysis": { ... },
  "options": {
    "slideCount": 15,
    "theme": "modern",
    "detailLevel": "standard",
    "focusAreas": ["Methodology", "Results"]
  }
}
```

**Response**: PPTX file download

## Customization 🎨

### Adding New Templates

Edit `lib/ppt-generator.ts` and add a new theme to `THEME_COLORS`:

```typescript
mytheme: {
  background: 'FFFFFF',
  title: '1a1a1a',
  text: '333333',
  accent: 'ff0000',
  secondary: 'f3f4f6'
}
```

Then add to `THEMES` array in `types/index.ts`.

## Limitations ⚠️

- Maximum PDF file size: 20MB
- PDFs must be text-based (not scanned images)
- Requires OpenAI API key (usage charges apply)

## License 📄

MIT License - feel free to use this project for personal or commercial purposes.

## Support 💬

For issues or questions, please open an issue on GitHub.

---

Made with ❤️ for academics and researchers worldwide.
