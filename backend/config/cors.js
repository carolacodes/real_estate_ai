export function corsOptions(env = process.env) {
  const development = !env.NODE_ENV || env.NODE_ENV === "development";
  let frontendOrigin;
  if (env.FRONTEND_URL) {
    const url = new URL(env.FRONTEND_URL);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
        url.pathname !== '/' || url.search || url.hash ||
        (!development && url.protocol !== 'https:')) {
      throw new Error("FRONTEND_URL must be a frontend origin (HTTPS in production)");
    }
    frontendOrigin = url.origin;
  }

  return {
    origin(origin, callback) {
      // Requests without Origin (Render health checks, CLI clients) need no CORS header.
      const local = development && /^http:\/\/(localhost|127\.0\.0\.1):(?:5173|5174|4173)$/.test(origin);
      callback(null, Boolean(origin && (origin === frontendOrigin || local)));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  };
}
