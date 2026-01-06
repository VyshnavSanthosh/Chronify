const express = require('express');
const app = express();
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");  
const passport = require("./config/google");     

// user auth routes
const signupRoutes = require('./routes/user/auth/signupRoutes');
const loginRoutes = require('./routes/user/auth/loginRoutes');  
const forgotPasswordRoutes = require('./routes/user/auth/forgotPasswordRoutes');


// vendor auth routes
const vendorSignupRoutes = require("./routes/vendor/auth/signupRoutes")
const vendorLoginRoutes = require("./routes/vendor/auth/loginRoutes")
const vendorForgotPasswordRoutes = require("./routes/vendor/auth/forgotPasswordRoutes")

// vendor profile routes
const vendorProfileRoutes = require("./routes/vendor/profile/profileRoutes")
const vendorProfileDocUploadRoutes = require("./routes/vendor/profile/documentUploadRoutes")

// vendor dashboard route
const vendorDashboardRoutes = require("./routes/vendor/dashboardRoutes")

// vendor add product route
const vendorAddProductRoute = require("./routes/vendor/productRoutes")


// admin auth routes
const adminloginRoutes = require("./routes/admin/auth/loginRoutes")

const adminCategoryRoutes = require("./routes/admin/category/categoryRoutes")

const adminCustomerRoutes = require("./routes/admin/customer/customerListRoutes")

const adminVendorRoutes = require("./routes/admin/vendorList/vendorLIstRoutes")

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Cookie parser (MUST be before routes)
app.use(cookieParser()); 

// Session setup (for OTP flow)
app.use(
    session({
        secret: process.env.SESSION_SECRET || "supersecretkey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // true ONLY if using HTTPS
            maxAge: 5 * 60 * 1000 // 5 min session (OTP flow)
        }
    })
);

// Passport initialization (for Google OAuth)
app.use(passport.initialize());  


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));

// ========== User Routes ==========

// User Auth Routes 
app.use("/auth", signupRoutes);      // Signup routes
app.use("/auth", loginRoutes);     // Login routes
app.use("/auth", forgotPasswordRoutes);    // Forgot password routes



// ==========  Vendor Routes ==========


app.use("/vendor/auth", vendorSignupRoutes)
app.use("/vendor/auth", vendorLoginRoutes)
app.use("/vendor/auth", vendorForgotPasswordRoutes)

// vendor Profile
app.use("/vendor", vendorProfileRoutes)
app.use("/vendor", vendorProfileDocUploadRoutes)

// vendor Dashbord
app.use("/vendor", vendorDashboardRoutes)

// vendor Product
app.use("/vendor", vendorAddProductRoute)


// ==========  Admin Routes ==========


app.use("/admin/auth", adminloginRoutes)

// admin Category
app.use("/admin", adminCategoryRoutes)

// admin customerList
app.use("/admin", adminCustomerRoutes)

// admin Vendor list
app.use("/admin", adminVendorRoutes)


module.exports = app;