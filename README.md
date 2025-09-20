# KrushiMind 🌾

An AI-powered Progressive Web Application (PWA) designed specifically for Indian smallholder farmers. KrushiMind provides offline-first access to essential farming tools, including crop identification, financial management, community engagement, and marketplace features.

## 🌟 Features

- **Crop Identification**: AI-powered tool to identify crops and provide detailed information
- **Financial Tools**: Manage farm finances, access government schemes, and calculate profits
- **Community Platform**: Connect with other farmers, share experiences, and learn from the community
- **Marketplace**: Buy and sell agricultural products directly with other farmers
- **Offline-First**: Works without internet connection, syncs when online
- **PWA Support**: Installable on mobile devices for easy access

## 🛠️ Technical Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **AI/ML**: TensorFlow.js, Google Generative AI
- **Storage**: IndexedDB, Local Storage
- **Backend**: Node.js, Express
- **Database**: SQLite3
- **PWA**: Next-PWA, Workbox

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/krushimind.git
cd krushimind
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## 📱 PWA Installation

1. Open the application in a supported browser (Chrome, Edge, etc.)
2. Look for the install prompt or use the browser's menu to "Install" the app
3. The app will be installed on your device and can be launched like a native application

## 🏗️ Architecture

For detailed architecture information, please refer to:
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [ARCHITECTURE_GRAPH.md](ARCHITECTURE_GRAPH.md)

## 🔒 Security Features

- JWT-based authentication
- Data encryption at rest
- Secure data transmission
- Input validation and sanitization
- Access control mechanisms

## 📦 Dependencies

Key dependencies include:
- @google/generative-ai: For AI-powered features
- @tensorflow/tfjs: For machine learning capabilities
- next-pwa: For PWA functionality
- idb: For IndexedDB operations
- express: For backend server
- sqlite3: For local database

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- TensorFlow.js team for ML capabilities
- Next.js team for the amazing framework
- All contributors and supporters of the project
- New Author Anant Binjola
- Anant Binjola