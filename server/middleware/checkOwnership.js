// middleware/checkOwnership.js
export const checkOwnership = (model, paramName = "id") => {
  return async (req, res, next) => {
    try {
      const entity = await model.findOne({
        _id: req.params[paramName],
        userId: req.user._id,
      });

      if (!entity) {
        return res.status(404).json({ message: "Not found or unauthorized" });
      }

      req.entity = entity;
      next();
    } catch (err) {
      console.error(`Ownership check error:`, err);
      res.status(500).json({ message: "Server error" });
    }
  };
};
