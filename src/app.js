import express from "express";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "./config/google.js";
import { fileURLToPath } from "url";
import engine from "ejs-mate";

// Routes
import signupRoutes from "./routes/user/auth/signupRoutes.js";
import loginRoutes from "./routes/user/auth/loginRoutes.js";
import forgotPasswordRoutes from "./routes/user/auth/forgotPasswordRoutes.js";
import userProductListRoutes from "./routes/user/product/productRoutes.js";
import homeRoutes from "./routes/user/homeRoutes.js";
import userProfileRoutes from "./routes/user/profile/profileRoutes.js";
import userAddressRoutes from "./routes/user/address/addressRoutes.js"
import userWishlistRoutes from "./routes/user/wishlist/wishlistRoutes.js";
import userCartRoutes from "./routes/user/cart/cartRoutes.js"
import userOrderRoutes from "./routes/user/order/orderRoutes.js";
import userWalletRoutes from "./routes/user/wallet/walletRoutes.js";

import vendorSignupRoutes from "./routes/vendor/auth/signupRoutes.js";
import vendorLoginRoutes from "./routes/vendor/auth/loginRoutes.js";
import vendorForgotPasswordRoutes from "./routes/vendor/auth/forgotPasswordRoutes.js";
import vendorProfileRoutes from "./routes/vendor/profile/profileRoutes.js";
import vendorProfileDocUploadRoutes from "./routes/vendor/profile/documentUploadRoutes.js";
import vendorDashboardRoutes from "./routes/vendor/dashboardRoutes.js";
import vendorAddProductRoute from "./routes/vendor/productRoutes.js";
import vendorOrderRoutes from "./routes/vendor/order/orderRoutes.js";

import adminloginRoutes from "./routes/admin/auth/loginRoutes.js";
import adminCategoryRoutes from "./routes/admin/category/categoryRoutes.js";
import adminCustomerRoutes from "./routes/admin/customer/customerListRoutes.js";
import adminVendorRoutes from "./routes/admin/vendorList/vendorLIstRoutes.js";
import adminProductRoutes from "./routes/admin/product/productRoutes.js";
import adminProfileRoutes from "./routes/admin/profile/profileRoutes.js";
import adminOrderRoutes from "./routes/admin/order/orderRoutes.js";
import adminCouponRoutes from "./routes/admin/coupon/couponRoutes.js";
import adminStatsRoutes from "./routes/admin/stats/statsRoutes.js";
import navbarDataMiddleware from "./middleware/navbarDataMiddleware.js";
const app = express();

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 5 * 60 * 1000
    }
})
);

app.use(passport.initialize());

// Views
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware to set activePage for sidebar
app.use((req, res, next) => {
    const path = req.path;
    if (path.startsWith("/admin/category")) res.locals.activePage = "category";
    else if (path.startsWith("/admin/products")) res.locals.activePage = "products";
    else if (path.startsWith("/admin/customers")) res.locals.activePage = "customers";
    else if (path.startsWith("/admin/vendors")) res.locals.activePage = "vendors";
    else if (path.startsWith("/admin/profile")) res.locals.activePage = "profile";
    else if (path.startsWith("/admin/dashboard")) res.locals.activePage = "dashboard";
    else if (path.startsWith("/admin/orders")) res.locals.activePage = "orders";
    else if (path.startsWith("/admin/sales-report")) res.locals.activePage = "sales";
    else if (path.startsWith("/admin/coupons")) res.locals.activePage = "coupons";
    else res.locals.activePage = "";
    next();
});

// Routes
app.use("/auth", signupRoutes);
app.use("/auth", loginRoutes);
app.use("/auth", forgotPasswordRoutes);
app.use("/", navbarDataMiddleware);
app.use("/", homeRoutes)
app.use("/", userProductListRoutes);
app.use("/", userProfileRoutes);
app.use("/", userAddressRoutes)
app.use("/", userWishlistRoutes)
app.use("/", userCartRoutes)
app.use("/", userOrderRoutes)
app.use("/", userWalletRoutes)

import vendorUserMiddleware from "./middleware/vendorUserMiddleware.js";

app.use("/vendor/auth", vendorSignupRoutes);
app.use("/vendor/auth", vendorLoginRoutes);
app.use("/vendor/auth", vendorForgotPasswordRoutes);
app.use("/vendor", vendorUserMiddleware, vendorProfileRoutes);
app.use("/vendor", vendorUserMiddleware, vendorProfileDocUploadRoutes);
app.use("/vendor", vendorUserMiddleware, vendorDashboardRoutes);
app.use("/vendor", vendorUserMiddleware, vendorAddProductRoute);
app.use("/vendor", vendorUserMiddleware, vendorOrderRoutes);


app.use("/admin/auth", adminloginRoutes);
app.use("/admin", adminCategoryRoutes);
app.use("/admin", adminCustomerRoutes);
app.use("/admin", adminVendorRoutes);
app.use("/admin", adminProductRoutes);
app.use("/admin", adminProfileRoutes);
app.use("/admin", adminOrderRoutes);
app.use("/admin", adminCouponRoutes)
app.use("/admin", adminStatsRoutes)

export default app;
