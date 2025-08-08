# 🚀 Dingy Crypto Tracker

<div align="center">
  <img src="./public/crypto.png" alt="Dingy Crypto Tracker Logo" width="120" height="120">
  
  [![Live Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge)](https://crpyto-tracker.vercel.app/)
  [![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Redux](https://img.shields.io/badge/Redux-Toolkit-purple?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
  [![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple?style=for-the-badge&logo=bootstrap)](https://getbootstrap.com/)
  
  *A feature-rich, real-time cryptocurrency tracking application with portfolio management and advanced filtering capabilities.*
</div>

---

## ✨ Features

### 🔍 **Smart Search & Discovery**
- **Global Search** - Search through thousands of cryptocurrencies with real-time suggestions
- **Advanced Filtering** - Filter by price, market cap, volume, and performance metrics
- **Smart Sorting** - Sort by various criteria with instant results
- **Pagination** - Load more cryptocurrencies on demand to minimize API calls

### 💼 **Portfolio Management**
- **Track Holdings** - Add your cryptocurrency investments with purchase prices
- **Real-time P&L** - See live profit/loss calculations with percentage returns
- **Portfolio Overview** - Visual summary of your total portfolio value and performance
- **Editable Amounts** - Update your holdings as your portfolio changes

### ⭐ **Personalization**
- **Favorites System** - Star your favorite cryptocurrencies for quick access
- **Watchlists** - Filter to show only your favorite coins
- **Persistent Storage** - Your preferences, portfolio, and favorites are saved locally

### 📊 **Detailed Analytics**
- **Interactive Charts** - Historical price charts with customizable timeframes
- **Market Data** - Comprehensive information including market cap, volume, supply
- **Price Alerts** - Set notifications for price targets (coming soon)
- **Performance Metrics** - 24h changes, ROI, and market trends

### 🎨 **Modern Interface**
- **Dark/Light Mode** - Toggle between themes with smooth transitions
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Intuitive UI** - Clean, modern interface with excellent user experience
- **Real-time Updates** - Auto-refresh functionality with rate limiting

### 🔧 **Technical Features**
- **API Optimization** - Smart caching and rate limiting to stay within free limits
- **Performance** - Optimized rendering with React hooks and memoization
- **Error Handling** - Graceful error states and loading indicators
- **Accessibility** - Keyboard navigation and screen reader support

---

## 🖥️ Screenshots

<div align="center">
  <img src="./screenshots/dashboard.png" alt="Main Dashboard" width="45%">
  <img src="./screenshots/dark-mode.png" alt="Dark Mode" width="45%">
</div>

<div align="center">
  <img src="./screenshots/portfolio.png" alt="Portfolio Management" width="45%">
  <img src="./screenshots/coin-details.png" alt="Coin Details" width="45%">
</div>

---

## 🛠️ Built With

### **Frontend**
- **[React 18+](https://reactjs.org/)** - Modern React with hooks and functional components
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management with RTK Query
- **[React Bootstrap](https://react-bootstrap.github.io/)** - UI components and responsive layout
- **[Chart.js](https://www.chartjs.org/)** - Interactive price charts and data visualization
- **[Lucide React](https://lucide.dev/)** - Beautiful, customizable icons

### **APIs & Data**
- **[CoinGecko API](https://www.coingecko.com/en/api)** - Comprehensive cryptocurrency data
- **REST API Integration** - Efficient data fetching with error handling

### **Styling & UX**
- **CSS3** - Modern styling with CSS variables and animations
- **Responsive Design** - Mobile-first approach with Bootstrap grid
- **Dark Mode** - Complete theming system with smooth transitions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm/yarn
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dungyy/crpyto-tracker.git
   cd crpyto-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
# or
yarn build
```

---

## 📱 Usage Guide

### **Getting Started**
1. **Browse Cryptocurrencies** - View the top cryptocurrencies by market cap
2. **Search & Filter** - Use the search bar or filters to find specific coins
3. **View Details** - Click on any cryptocurrency to see detailed information
4. **Manage Portfolio** - Add your holdings to track your investments

### **Portfolio Management**
1. Click the "Portfolio" button in the top navigation
2. Use "Add New Holding" to input your cryptocurrency investments
3. Enter the amount and purchase price for each holding
4. View real-time profit/loss calculations and total portfolio value

### **Advanced Features**
- **Load More Pages** - Click "Load More Cryptocurrencies" to access thousands of coins
- **Smart Search** - Search suggestions appear as you type
- **Favorites** - Star coins and use "Favorites" filter to view your watchlist
- **Dark Mode** - Toggle the theme using the button in the navigation

---

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the root directory (optional):
```env
REACT_APP_API_BASE_URL=https://api.coingecko.com/api/v3
REACT_APP_REFRESH_INTERVAL=600000
```

### **API Rate Limiting**
The app includes built-in rate limiting to respect CoinGecko's free tier:
- Auto-refresh every 10 minutes
- Manual refresh cooldown of 30 seconds
- Efficient pagination to minimize API calls

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Development Guidelines**
- Follow React best practices and hooks patterns
- Use meaningful commit messages
- Add tests for new features
- Ensure responsive design works on all devices
- Update documentation for new features

---

## 📝 Roadmap

### **Upcoming Features**
- [ ] 🔔 **Price Alerts** - Email/browser notifications for price targets
- [ ] 📰 **Crypto News** - Integrated news feed with market sentiment
- [ ] 📈 **Advanced Charts** - Technical indicators and drawing tools
- [ ] 💱 **DeFi Integration** - Track DeFi positions and yield farming
- [ ] 🔗 **Wallet Connect** - Connect crypto wallets for automatic portfolio sync
- [ ] 📊 **Export Data** - CSV export for portfolio and transaction history
- [ ] 🌐 **Multi-language** - Support for multiple languages
- [ ] 📱 **PWA Support** - Installable progressive web app

### **Technical Improvements**
- [ ] ⚡ **Performance** - Virtual scrolling for large lists
- [ ] 🧪 **Testing** - Comprehensive test suite with Jest and RTL
- [ ] 📱 **Mobile App** - React Native mobile application
- [ ] 🔄 **Real-time** - WebSocket integration for live price updates

---

## 🙏 Acknowledgments

- **[CoinGecko](https://www.coingecko.com/)** - Providing comprehensive cryptocurrency data and free API access
- **[React Community](https://reactjs.org/)** - For the amazing React ecosystem and documentation
- **[Bootstrap Team](https://getbootstrap.com/)** - For the responsive component library
- **[Lucide Icons](https://lucide.dev/)** - For the beautiful, consistent icon set
- **[Vercel](https://vercel.com/)** - For seamless deployment and hosting

---

## 📞 Contact & Support

- **Live Demo**: [https://crpyto-tracker.vercel.app/](https://crpyto-tracker.vercel.app/)
- **Issues**: [GitHub Issues](https://github.com/Dungyy/crpyto-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Dungyy/crpyto-tracker/discussions)

---

<div align="center">
  <strong>⭐ If you found this project helpful, please give it a star! ⭐</strong>
  
  <br><br>
  
  Made with ❤️ by [Dungyy](https://github.com/Dungyy)
</div>