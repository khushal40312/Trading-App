const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./models/user.model');
const Portfolio = require('./models/portfolio.model');

class SocketService {
  constructor() {
    this.io = null;
    this.priceUpdateInterval = null;
    this.connectedUsers = new Map();
    this.watchedSymbols = new Set();
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.setupAuthentication();
    this.setupEventHandlers();
    this.startPriceUpdates();
    
    console.log('Socket.io server initialized');
  }

  setupAuthentication() {
    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.userEmail = user.email;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userEmail}`);
      
      // Store connected user
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        email: socket.userEmail,
        joinedAt: new Date()
      });

      // Handle user joining their portfolio room
      socket.on('join-portfolio', async () => {
        try {
          const portfolio = await Portfolio.findOne({ user: socket.userId });
          if (portfolio) {
            socket.join(`portfolio-${socket.userId}`);
            
            // Add user's assets to watched symbols
            portfolio.assets.forEach(asset => {
              this.watchedSymbols.add(asset.symbol);
            });
            
            // Send initial portfolio data
            socket.emit('portfolio-data', {
              portfolio: portfolio,
              timestamp: new Date()
            });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to join portfolio room' });
        }
      });

      // Handle subscribing to specific symbol updates
      socket.on('subscribe-symbol', (symbol) => {
        if (symbol && typeof symbol === 'string') {
          socket.join(`symbol-${symbol.toUpperCase()}`);
          this.watchedSymbols.add(symbol.toUpperCase());
          console.log(`User ${socket.userEmail} subscribed to ${symbol}`);
        }
      });

      // Handle unsubscribing from symbol updates
      socket.on('unsubscribe-symbol', (symbol) => {
        if (symbol && typeof symbol === 'string') {
          socket.leave(`symbol-${symbol.toUpperCase()}`);
          console.log(`User ${socket.userEmail} unsubscribed from ${symbol}`);
        }
      });

      // Handle requesting chart data
      socket.on('get-chart-data', async (data) => {
        try {
          const { symbol, timeframe = '1D' } = data;
          const chartData = await this.getChartData(symbol, timeframe);
          socket.emit('chart-data', {
            symbol,
            timeframe,
            data: chartData,
            timestamp: new Date()
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to fetch chart data' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userEmail}`);
        this.connectedUsers.delete(socket.userId);
      });
    });
  }

  async startPriceUpdates() {
    // Update prices every 30 seconds
    this.priceUpdateInterval = setInterval(async () => {
      if (this.watchedSymbols.size > 0) {
        await this.updatePrices();
      }
    }, 30000);

    console.log('Price update service started');
  }

  async updatePrices() {
    try {
      const symbols = Array.from(this.watchedSymbols);
      const priceUpdates = await this.fetchPricesFromAPI(symbols);
      
      // Broadcast price updates to subscribers
      for (const [symbol, priceData] of Object.entries(priceUpdates)) {
        this.io.to(`symbol-${symbol}`).emit('price-update', {
          symbol,
          ...priceData,
          timestamp: new Date()
        });
      }

      // Update portfolios for connected users
      await this.updateConnectedUsersPortfolios(priceUpdates);
      
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }

  async fetchPricesFromAPI(symbols) {
    const priceUpdates = {};
    
    for (const symbol of symbols) {
      try {
        const response = await axios.get('https://finnhub.io/api/v1/quote', {
          params: {
            symbol: symbol,
            token: process.env.FINNHUB_API
          }
        });

        const data = response.data;
        priceUpdates[symbol] = {
          currentPrice: data.c,
          change: data.d,
          changePercent: data.dp,
          high: data.h,
          low: data.l,
          open: data.o,
          previousClose: data.pc
        };
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error.message);
      }
    }

    return priceUpdates;
  }

  async updateConnectedUsersPortfolios(priceUpdates) {
    for (const [userId, userData] of this.connectedUsers) {
      try {const axios = require('axios');

        // Replace with your actual API key
        const API_KEY = process.env.FINNHUB_API;
        const SYMBOL = 'BINANCE:BTCUSDT'; // Example stock symbol
        
        async function getStockQuote(symbol) {
          try {
            const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
              params: {
                symbol,
                token: API_KEY
              }
            });
        
            console.log(`Stock quote for ${symbol}:`, response.data);
          } catch (error) {
            console.error('Error fetching stock quote:', error.message);
          }
        }
        
        getStockQuote(SYMBOL); 
        const portfolio = await Portfolio.findOne({ user: userId });
        if (!portfolio) continue;

        let portfolioUpdated = false;
        
        // Update asset prices in portfolio
        portfolio.assets.forEach(asset => {
          if (priceUpdates[asset.symbol]) {
            asset.currentPrice = priceUpdates[asset.symbol].currentPrice;
            portfolioUpdated = true;
          }
        });

        if (portfolioUpdated) {
          // Recalculate portfolio value
          portfolio.calculateValue();
          await portfolio.save();

          // Emit updated portfolio data to user
          this.io.to(`portfolio-${userId}`).emit('portfolio-update', {
            portfolio: portfolio,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`Error updating portfolio for user ${userId}:`, error);
      }
    }
  }

  async getChartData(symbol, timeframe) {
    try {
      // This is a simplified example - you might want to use a different API for historical data
      const response = await axios.get('https://finnhub.io/api/v1/stock/candle', {
        params: {
          symbol: symbol,
          resolution: this.getResolution(timeframe),
          from: this.getFromTimestamp(timeframe),
          to: Math.floor(Date.now() / 1000),
          token: process.env.FINNHUB_API
        }
      });

      const data = response.data;
      if (data.s === 'ok') {
        return data.c.map((close, index) => ({
          timestamp: data.t[index] * 1000,
          open: data.o[index],
          high: data.h[index],
          low: data.l[index],
          close: close,
          volume: data.v[index]
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  }

  getResolution(timeframe) {
    const resolutions = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '1h': '60',
      '1D': 'D',
      '1W': 'W',
      '1M': 'M'
    };
    return resolutions[timeframe] || 'D';
  }

  getFromTimestamp(timeframe) {
    const now = Math.floor(Date.now() / 1000);
    const timeframes = {
      '1m': now - (60 * 60), // 1 hour ago
      '5m': now - (5 * 60 * 60), // 5 hours ago
      '15m': now - (15 * 60 * 60), // 15 hours ago
      '1h': now - (24 * 60 * 60), // 1 day ago
      '1D': now - (30 * 24 * 60 * 60), // 30 days ago
      '1W': now - (12 * 7 * 24 * 60 * 60), // 12 weeks ago
      '1M': now - (365 * 24 * 60 * 60) // 1 year ago
    };
    return timeframes[timeframe] || timeframes['1D'];
  }

  // Method to broadcast trade execution to user
  broadcastTradeExecution(userId, tradeData) {
    this.io.to(`portfolio-${userId}`).emit('trade-executed', {
      trade: tradeData,
      timestamp: new Date()
    });
  }

  // Method to send notifications
  sendNotification(userId, notification) {
    this.io.to(`portfolio-${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
  }

  // Clean up when shutting down
  destroy() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    if (this.io) {
      this.io.close();
    }
  }
}

module.exports = new SocketService();