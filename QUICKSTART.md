# Quick Start Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Get Your API Token
1. Visit [https://aibuilder.space](https://aibuilder.space)
2. Sign up/login and get your `AI_BUILDER_TOKEN`

## 3. Run the App
```bash
npm run dev
```

## 4. Set Your Token
- Open the app at http://localhost:3000
- Enter your API token in the header input field
- The token will be saved automatically

## 5. Start Chatting!
- Click "New Chat" to start a conversation
- Type your message and press Enter
- All conversations are automatically saved

## Features
✅ Two-column layout (conversations sidebar + chat)
✅ Persistent chat history (localStorage)
✅ Grok-4-fast model integration
✅ Modern, responsive UI
✅ Conversation management (create, select, delete)

## Troubleshooting

**Issue**: "API token is required" error
- **Solution**: Make sure you've entered your token in the header input field

**Issue**: API connection errors
- **Solution**: Verify your token is valid and check your internet connection
- The default API URL is `https://api.aibuilder.space/backend`

**Issue**: Conversations not saving
- **Solution**: Check browser console for localStorage errors. Make sure cookies/localStorage are enabled.
