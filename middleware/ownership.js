// backend/middleware/ownership.js
export function requireOwnership(resourceOwnerIdPath) {
  // resourceOwnerIdPath: a function(req, res, resource) => ownerId
  return (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // caller should set res.locals.resource before using this middleware
    const resource = res.locals.resource;
    const ownerId = resourceOwnerIdPath(req, resource);
    if (ownerId === userId || req.user.isAdmin) return next();

    return res.status(403).json({ message: "Forbidden" });
  };
}
