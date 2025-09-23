// backend/middleware/auth.js
// Simple development auth middleware — DO NOT use in production.
// This sets req.user so controllers can read authorId / isAdmin.
export default function auth(req, res, next) {
  // If a header "x-user-id" is present, use it; otherwise fallback to a dev user.
  const testUserId = req.header("x-user-id") || "dev-user-1";
  const testUserName = req.header("x-user-name") || "Sohit (dev)";

  req.user = {
    id: testUserId,
    name: testUserName,
    isAdmin: testUserId === "admin" // simple rule for testing
  };

  next();
}
