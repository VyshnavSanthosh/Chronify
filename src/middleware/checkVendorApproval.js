const checkVendorApproval = (req, res, next) => {
    // Both vendorJwtMiddleware and initialVerifyToken set the vendor object
    // vendorJwtMiddleware sets it to req.user (via BaseJwtMiddleware)
    // initialVerifyToken sets it to req.vendor
    const vendor = req.user || req.vendor;

    if (vendor && vendor.role === 'vendor' && !vendor.isApproved) {
        // List of allowed paths for unapproved vendors
        const allowedPaths = [
            '/vendor/profile',
            '/vendor/profile/uploads',
            '/vendor/auth/logout'
        ];

        // Check if the current path is allowed
        const isAllowed = allowedPaths.some(path => req.path.startsWith(path));

        if (!isAllowed) {
            // Check if it's an AJAX request
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is pending approval. Please wait for admin verification.",
                    redirectUrl: '/vendor/profile?unapproved=true'
                });
            }
            return res.redirect('/vendor/profile?unapproved=true');
        }
    }
    next();
};

export default checkVendorApproval;
