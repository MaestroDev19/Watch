# Picks - AI-Powered Movie & TV Recommendations

A minimalist, AI-powered movie and TV show recommendation app that helps you discover your next favorite watch based on your mood, preferences, and viewing history.

## ✨ Features

- **🎭 Mood-Based Quick Picks**: Get instant recommendations based on how you're feeling (10 different moods)
- **🤖 AI-Powered Search**: Advanced RAG (Retrieval-Augmented Generation) workflow using Google Gemini
- **📝 Personal Watchlist**: Save recommendations with local storage and export functionality
- **🔍 Smart Filters**: Quick genre and length filters for better recommendations
- **🌐 Web Search Integration**: Fallback to real-time web search for latest content
- **📱 Responsive Design**: Beautiful, minimal UI that works on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Google Generative AI API key
- Supabase account (for vector database)
- Tavily API key (for web search)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd picks
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TAVILY_API_KEY=your_tavily_api_key
```

4. Run the development server:

```bash
bun dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Radix UI
- **AI/ML**: Google Gemini 2.0 Flash, LangChain, LangGraph
- **Database**: Supabase (Vector Store)
- **Search**: Tavily API
- **State Management**: React Hooks + Local Storage
- **Type Safety**: TypeScript

## 📖 How It Works

### AI-Powered Recommendations

The app uses an advanced agentic RAG workflow:

1. **Query Processing**: User input is processed and optimized
2. **Vector Search**: Semantic search through movie/TV database
3. **Relevance Grading**: AI evaluates if results match the query
4. **Web Search Fallback**: If local results aren't relevant, searches the web
5. **Response Generation**: AI generates personalized recommendations

### Mood-Based Quick Picks

Choose from 10 distinct moods:

- 😊 Happy & Uplifting
- 🤩 Thrilled & Energetic
- 😌 Calm & Relaxed
- 🥰 Romantic & Loving
- 🤔 Curious & Intrigued
- 🥺 Nostalgic & Sentimental
- 🧗 Adventurous & Bold
- 🧠 Thoughtful & Cerebral
- 🏠 Cozy & Comfortable
- 🎭 Emotional & Dramatic

### Watchlist Features

- **Local Storage**: All data stored locally for privacy
- **Export Options**: Download your watchlist as JSON
- **Status Tracking**: Mark items as "Want to Watch", "Watching", or "Watched"
- **Search & Filter**: Find items in your watchlist quickly
- **Cross-tab Sync**: Changes sync across browser tabs

## 🎯 Free Tier Optimized

The app is optimized for Google Gemini's free tier:

- **Token Management**: Automatic token usage tracking
- **Rate Limiting**: Built-in protection against API limits
- **Efficient Prompts**: Minimized token consumption
- **Smart Caching**: Reduced redundant API calls

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
