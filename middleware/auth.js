// backend/middleware/auth.js
export default function auth(req, res, next) {
  const id = req.header("x-user-id");
  const name = req.header("x-user-name");
  req.user = id ? { id, name } : null;
  next();
}
