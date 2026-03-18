const vendorUserMiddleware = (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;
    }
    next();
};

export default vendorUserMiddleware;
