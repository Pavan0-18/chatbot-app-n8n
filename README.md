# AI Chatbot Application

A full-stack chatbot application built with React, Nhost (Hasura + Auth), n8n workflows, and OpenRouter AI integration.

## 🌟 Features

- **Email Authentication** with Nhost Auth
- **Real-time Chat Interface** with GraphQL subscriptions
- **AI-Powered Responses** via OpenRouter API
- **Secure Backend** with Row-Level Security (RLS)
- **Serverless Architecture** with n8n workflows
- **Responsive Design** with Tailwind CSS

## 🏗️ Architecture

```
Frontend (React) ↔ Hasura GraphQL ↔ n8n Workflow ↔ OpenRouter AI
                      ↕
                  PostgreSQL DB
```

## 🚀 Live Demo

**Deployed Application:** [Your Netlify URL will go here]

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Nhost account** ([nhost.io](https://nhost.io))
- **n8n account** ([n8n.cloud](https://n8n.cloud)) or self-hosted n8n
- **OpenRouter account** ([openrouter.ai](https://openrouter.ai))

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone [your-repo-url]
cd chatbot-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_NHOST_SUBDOMAIN=your-nhost-subdomain
REACT_APP_NHOST_REGION=your-nhost-region
```

### 4. Start Development Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

## 🔧 Configuration

### Nhost Setup

1. **Create Nhost Project:**
   - Go to [nhost.io](https://nhost.io)
   - Create a new project
   - Note your subdomain and region

2. **Database Schema:**
   
   **Chats Table:**
   ```sql
   CREATE TABLE chats (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     title TEXT NOT NULL DEFAULT 'New Chat',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

   **Messages Table:**
   ```sql
   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     is_bot BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **Row-Level Security:**
   
   For both tables, set permissions for `user` role:
   - **Select:** `{"user_id":{"_eq":"X-Hasura-User-Id"}}`
   - **Insert:** `{"user_id":{"_eq":"X-Hasura-User-Id"}}`
   - **Update:** `{"user_id":{"_eq":"X-Hasura-User-Id"}}`
   - **Delete:** `{"user_id":{"_eq":"X-Hasura-User-Id"}}`

### Hasura Actions

1. **Create `sendMessage` Action:**
   
   **Action Definition:**
   ```graphql
   type Mutation {
     sendMessage (
       chatId: uuid!
       message: String!
     ): SendMessageOutput
   }
   ```

   **Types:**
   ```graphql
   type SendMessageOutput {
     success: Boolean!
     message: String!
     response: String
   }
   ```

   **Handler:** Your n8n webhook URL
   **Permissions:** Allow `user` role

### n8n Workflow

1. **Create workflow with these nodes:**
   - **Webhook Trigger**
   - **Extract Data** (Function)
   - **Check Chat Ownership** (HTTP Request)
   - **Validate Ownership** (IF)
   - **Get AI Response** (HTTP Request)
   - **Save Bot Message** (HTTP Request)
   - **Return Success/Error** (Function)

2. **Required Secrets in n8n:**
   - `HASURA_GRAPHQL_ADMIN_SECRET`
   - `HASURA_GRAPHQL_URL`
   - `OPENROUTER_API_KEY`

### OpenRouter Setup

1. **Get API Key:**
   - Sign up at [openrouter.ai](https://openrouter.ai)
   - Go to API Keys section
   - Create new API key
   - Add to n8n secrets

2. **Model Used:**
   - `microsoft/phi-3-mini-4k-instruct:free`

## 🚀 Deployment to Netlify

### Step 1: Build the Application

```bash
npm run build
```

### Step 2: Deploy to Netlify

**Option A: Drag & Drop**
1. Go to [netlify.com](https://netlify.com)
2. Drag your `build` folder to the deploy area

**Option B: Git Integration**
1. Push your code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`

### Step 3: Configure Environment Variables in Netlify

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. **Add variables:**
   ```
   REACT_APP_NHOST_SUBDOMAIN=your-subdomain
   REACT_APP_NHOST_REGION=your-region
   ```

### Step 4: Update n8n Webhook HTTP-Referer

Update your n8n workflow Node 5 with your Netlify URL:
```json
"HTTP-Referer": "https://your-app-name.netlify.app"
```

## 📁 Project Structure

```
chatbot-app/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Auth.js
│   │   ├── ChatApp.js
│   │   ├── ChatInterface.js
│   │   ├── ChatList.js
│   │   ├── ChatWindow.js
│   │   └── MessageList.js
│   ├── graphql/
│   │   └── queries.js
│   ├── lib/
│   │   ├── apollo.js
│   │   └── nhost.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .env
├── package.json
├── tailwind.config.js
└── README.md
```

## 🔑 Environment Variables

### Frontend (.env)
```env
REACT_APP_NHOST_SUBDOMAIN=your-subdomain
REACT_APP_NHOST_REGION=your-region
```

### n8n Secrets
- `HASURA_GRAPHQL_ADMIN_SECRET`
- `HASURA_GRAPHQL_URL`
- `OPENROUTER_API_KEY`

## 🧪 Testing

### Test Authentication
1. Sign up with a new email
2. Verify you can sign in/out
3. Check that auth state persists

### Test Chat Functionality
1. Create a new chat
2. Send a message
3. Verify AI responds
4. Test real-time updates
5. Test chat deletion/renaming

### Test Permissions
1. Try accessing another user's chat (should fail)
2. Verify RLS is working properly

## 🐛 Troubleshooting

### Common Issues

**1. GraphQL Connection Errors**
- Check your Nhost subdomain and region
- Verify environment variables are set correctly

**2. Authentication Issues**
- Clear browser localStorage
- Check network tab for 401 errors

**3. n8n Webhook Not Responding**
- Ensure workflow is activated
- Check n8n execution logs
- Verify webhook URL is correct in Hasura Action

**4. AI Not Responding**
- Check OpenRouter API key
- Verify n8n secrets are configured
- Check n8n workflow execution logs

**5. Real-time Updates Not Working**
- Check WebSocket connection in browser dev tools
- Verify GraphQL subscriptions are properly configured

### Debug Commands

```bash
# Check build
npm run build

# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📦 Dependencies

### Core Dependencies
- `react` - Frontend framework
- `@nhost/react` - Authentication and backend
- `@apollo/client` - GraphQL client
- `@heroicons/react` - Icons
- `tailwindcss` - Styling

### Dev Dependencies
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Verify all credentials are correct**
3. **Check browser console for errors**
4. **Review n8n workflow execution logs**

## 🔗 Useful Links

- **Nhost Documentation:** [docs.nhost.io](https://docs.nhost.io)
- **Hasura Documentation:** [hasura.io/docs](https://hasura.io/docs)
- **n8n Documentation:** [docs.n8n.io](https://docs.n8n.io)
- **OpenRouter API:** [openrouter.ai/docs](https://openrouter.ai/docs)
- **Apollo Client:** [apollographql.com/docs](https://www.apollographql.com/docs)

---

**Built with ❤️ using React, Nhost, n8n, and OpenRouter**
