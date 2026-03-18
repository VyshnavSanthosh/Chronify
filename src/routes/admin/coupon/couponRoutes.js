import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

import adminJwtMiddlewareFile from "../../../middleware/adminJwt.js";
import validator from "../../../utils/validators/validator.js";
import joi_coupon from "../../../utils/validators/joi_coupon.js";

import couponRepositoryFile from "../../../repository/admin/coupon.js";

import couponServiceFile from "../../../service/admin/coupon/couponService.js";

import couponControllerFile from "../../../controllers/admin/coupon/couponController.js";

// Dependency Injection
const adminJwtMiddleware = new adminJwtMiddlewareFile();
const couponRepository = new couponRepositoryFile();
const couponService = new couponServiceFile(couponRepository);
const couponController = new couponControllerFile(couponService, joi_coupon, validator);

// Routes

router.route("/coupons/add")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
        couponController.renderAddCouponPage.bind(couponController))
    .post(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
        couponController.handleAddCoupon.bind(couponController))

router.get("/coupons",
    adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
    couponController.renderCouponListPage.bind(couponController))

router.patch("/coupons/toggle/:couponId",
    adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
    couponController.toggleStatus.bind(couponController))

router.route("/coupons/edit/:couponId")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
        couponController.renderEditCouponPage.bind(couponController))
    .post(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
        couponController.handleEditCoupon.bind(couponController))

router.delete("/coupons/delete/:couponId",
    adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
    couponController.deleteCoupon.bind(couponController))


export default router