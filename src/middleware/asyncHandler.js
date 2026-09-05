// Évite de répéter try/catch dans chaque contrôleur : toute erreur (sync ou
// dans une promesse rejetée) est transmise à errorHandler.js.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
