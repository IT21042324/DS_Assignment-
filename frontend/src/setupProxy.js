const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Proxy requests that start with /api1 to backend running on port 8080
  app.use(
    "/api1",
    createProxyMiddleware({
      target: "https://localhost:8080/api/",
      changeOrigin: true,
      secure: false, // Disable SSL certificate checking for development
      pathRewrite: {
        "^/api1": "", // Remove /api1 when forwarding the request
      },
    })
  );

  // Proxy requests that start with /api2 to backend running on port 8081
  app.use(
    "/api2",
    createProxyMiddleware({
      target: "https://localhost:8081/api/",
      changeOrigin: true,
      secure: false, // Disable SSL certificate checking for development
      pathRewrite: {
        "^/api2": "", // Remove /api2 when forwarding the request
      },
    })
  );

  // Proxy requests that start with /api3 to backend running on port 8082
  app.use(
    "/api3",
    createProxyMiddleware({
      target: "https://localhost:8082/api/",
      changeOrigin: true,
      secure: false, // Disable SSL certificate checking for development
      pathRewrite: {
        "^/api3": "", // Remove /api3 when forwarding the request
      },
    })
  );

  // Proxy requests that start with /api4 to backend running on port 8083
  app.use(
    "/api4",
    createProxyMiddleware({
      target: "https://localhost:8083/api/",
      changeOrigin: true,
      secure: false, // Disable SSL certificate checking for development
      pathRewrite: {
        "^/api4": "", // Remove /api4 when forwarding the request
      },
    })
  );
};
