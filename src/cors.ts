

import cors from 'cors';

const corsOptions = {
  origin: 'https://skillswap-mauve.vercel.app',
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  preflightContinue: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default cors(corsOptions);