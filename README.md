
# Go to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env <<EOL
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
EOL

# Start backend server
npm run server

Frontend Setup

# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env <<EOL
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key
EOL

# Start frontend development server
npm run dev
📂 Project Structure (Frontend)
bash
Copy code
src/
├── components/          
│   ├── AppShell.jsx        # Main layout
│   ├── Sidebar.jsx         # Navigation sidebar
│   ├── ChatWindow.jsx      # Chat interface
│   └── NotificationPanel.jsx
├── features/               
│   ├── auth/               # Authentication
│   ├── chat/               # Chat management
│   ├── notifications/      # Real-time notifications
│   └── credits/            # User credits
└── App.jsx                 # Root component
