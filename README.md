# ChatGPT Clone

A modern ChatGPT-like interface built with Next.js, featuring a two-column layout with conversation management and persistent chat history. Powered by Grok-4-fast via the AI Builder API.
<img width="933" height="699" alt="Screenshot 2026-01-19 at 15 40 48" src="https://github.com/user-attachments/assets/b13d19c9-c358-4c5f-9bda-9f3aabaf8466" />
## Features

- 🎨 **Two-Column Interface**: Left sidebar for conversations, right panel for chat
- 💬 **Conversation Management**: Create, select, and delete conversations
- 💾 **Persistent Storage**: All conversations are saved to localStorage
- 🤖 **Grok-4-fast Integration**: Powered by AI Builder API
- 🎯 **Modern UI**: Clean, dark-themed interface with smooth animations
- ⚡ **Real-time Chat**: Stream-like experience with loading indicators

## Prerequisites

- Node.js 18+ and npm
- AI Builder API token (get one from [https://aibuilder.space](https://aibuilder.space))

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your API token**:
   - Option 1: Enter your token directly in the app's header (it will be saved to localStorage)
   - Option 2: Create a `.env.local` file in the root directory:
     ```
     AI_BUILDER_TOKEN=your_token_here
     NEXT_PUBLIC_AI_BUILDER_API_URL=https://api.aibuilder.space/backend
     ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
chatgpt-clone/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API route for chat completions
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page component
├── components/
│   ├── ChatInterface.tsx          # Chat UI component
│   └── ConversationSidebar.tsx    # Sidebar component
├── lib/
│   ├── api.ts                     # API client functions
│   └── storage.ts                 # localStorage utilities
├── types/
│   └── index.ts                   # TypeScript type definitions
└── package.json
```

## Usage

1. **Set API Token**: Enter your AI Builder API token in the header input field
2. **Start New Chat**: Click "New Chat" button in the sidebar
3. **Send Messages**: Type your message and press Enter (Shift+Enter for new line)
4. **Manage Conversations**: 
   - Click on any conversation in the sidebar to switch
   - Hover over a conversation and click the trash icon to delete
   - Conversations are automatically saved

## API Configuration

The app uses the AI Builder API with the following endpoint:
- **Endpoint**: `/v1/chat/completions`
- **Model**: `grok-4-fast`
- **Authentication**: Bearer token (AI_BUILDER_TOKEN)

You can customize the API base URL by setting `NEXT_PUBLIC_AI_BUILDER_API_URL` in your environment variables.

## Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **AI Builder API** - Backend API for chat completions

## Data Storage

Conversations are stored in the browser's localStorage under the key `chatgpt-clone-conversations`. The API token is stored separately under `ai_builder_token`.

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
