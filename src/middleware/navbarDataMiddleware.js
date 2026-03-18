import Cart from "../models/user/cartSchema.js";
import Wishlist from "../models/user/wishlistSchema.js";
import JwtService from "../service/jwtService.js";
import UserRepository from "../repository/user.js";

const jwtService = new JwtService();
const userRepository = new UserRepository();

const navbarDataMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            const accessToken = req.cookies.userAccessToken;
            if (accessToken) {
                try {
                    console.log("Navbar Middleware: Attempting to authenticate via access token");
                    const decoded = jwtService.verifyAccessToken(accessToken);
                    const user = await userRepository.findById(decoded.userId);
                    if (user && !user.isBlocked && user.role === "customer") {
                        req.user = user;
                        console.log(`Navbar Middleware: Successfully authenticated ${user.email}`);
                    } else {
                        console.log(`Navbar Middleware: User lookup failed or user blocked/wrong role. User exists: ${!!user}`);
                    }
                } catch (err) {
                    console.log(`Navbar Middleware: Access token verification failed: ${err.message}`);
                }
            } else {
                console.log("Navbar Middleware: No userAccessToken found in cookies");
            }
        }

        if (req.user) {
            const userId = req.user._id;

            const cart = await Cart.findOne({ userId: req.user._id })
            const cartCount = cart ? cart.items.length : 0

            const wishlistCount = await Wishlist.countDocuments({ userId });
            res.locals.cartCount = cartCount;

            res.locals.wishlistCount = wishlistCount;
        } else {
            console.log("Navbar Middleware: No user found after check");
            res.locals.cartCount = 0;
            res.locals.wishlistCount = 0;
        }
        next();
    } catch (error) {
        console.error("Error in navbarDataMiddleware:", error);
        res.locals.cartCount = 0;
        res.locals.wishlistCount = 0;
        next();
    }
};

export default navbarDataMiddleware;
