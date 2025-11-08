import config from '@colyseus/tools';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';
import * as dotenv from 'dotenv';

import { CardGameRoom } from './rooms/CardGameRoom';

// Load environment variables
dotenv.config();

export default config({
  options: {
    devMode: process.env.NODE_ENV !== 'production',
  },

  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define('card_game', CardGameRoom, {
      filterBy: ['gameState'],
    });
  },

  initializeExpress: (app) => {
    // CORS configuration
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });

    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get('/hello_world', (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== 'production') {
      app.use('/', playground());
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use('/monitor', monitor());
  },

  beforeListen: () => {
    console.log(`🎮 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🌐 Port: ${process.env.PORT || 2567}`);
    console.log(`🔒 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
  },
});
