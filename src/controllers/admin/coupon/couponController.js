export default class CouponController {
    constructor(couponService, joi_coupon, validator) {
        this.couponService = couponService
        this.joi_coupon = joi_coupon
        this.validator = validator
    }

    async renderCouponListPage(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const status = req.query.status || "all";

            const { coupons, totalCoupons } = await this.couponService.getAllCoupons(search, status, page, limit);

            return res.render("admin/coupon/couponlist", {
                coupon: coupons,
                currentPage: page,
                totalPages: Math.ceil(totalCoupons / limit),
                totalCoupons,
                search,
                status
            });
        } catch (error) {
            console.log("Couldn't render coupon list page :", error);
            return res.status(500).json({ message: "Failed to render page" });
        }
    }
    async renderAddCouponPage(req, res) {
        try {
            const categories = await this.couponService.getAllCategories()
            return res.render("admin/coupon/addCoupon", {
                category: categories
            })
        } catch (error) {
            console.log("Couldn't render add coupon page :", error)
            return res.status(500).json({ success: false, message: "Failed to render page" })
        }
    }
    async handleAddCoupon(req, res) {
        try {

            const { error, value } = this.validator.validate(this.joi_coupon, req.body)

            if (error) {
                console.log("Validation error:", error.details)
                let errors = {}
                error.details.forEach(err => {
                    errors[err.context.key] = err.message
                })
                return res.status(400).json({
                    success: false,
                    errors
                })
            }
            await this.couponService.save(value)

            return res.status(200).json({
                success: true,
                message: "Coupon added successfully"
            })

        } catch (error) {
            console.log("Error in handleAddCoupon:", error)
            return res.status(500).json({
                success: false,
                message: "Failed to add coupon"
            })
        }
    }

    async toggleStatus(req, res) {
        const { couponId } = req.params
        const { isActive } = req.query
        try {
            const updatedCoupon = await this.couponService.toggleStatus(couponId, isActive)
            return res.json({
                success: true,
                isActive: updatedCoupon.isActive
            });
        } catch (error) {
            console.log("Couldn't toggle status :", error)
            return res.status(500).json({
                success: false,
                message: "Failed to toggle coupon"
            });
        }
    }

    async renderEditCouponPage(req, res) {
        try {
            const { couponId } = req.params
            const categories = await this.couponService.getAllCategories()
            const coupon = await this.couponService.getCouponById(couponId)
            return res.render("admin/coupon/editCoupon", {
                category: categories,
                coupon
            })
        } catch (error) {
            console.log("Couldn't render edit coupon page :", error)
            return res.status(500).json({ success: false, message: "Failed to render page" })
        }
    }

    async handleEditCoupon(req, res) {
        try {
            const { couponId } = req.params
            const { error, value } = this.validator.validate(this.joi_coupon, req.body)

            if (error) {
                console.log("Validation error:", error.details)
                let errors = {}
                error.details.forEach(err => {
                    errors[err.context.key] = err.message
                })
                return res.status(400).json({
                    success: false,
                    errors
                })
            }
            await this.couponService.editCoupon(value, couponId)

            return res.status(200).json({
                success: true,
                message: "Coupon updated successfully"
            })
        } catch (error) {
            console.log("Error in handleEditCoupon:", error)
            return res.status(500).json({
                success: false,
                message: "Failed to update coupon"
            })
        }
    }

    async deleteCoupon(req, res) {
        try {
            const { couponId } = req.params
            await this.couponService.deleteCoupon(couponId)
            return res.json({
                success: true,
            });
        } catch (error) {
            console.log("Couldn't  delete coupon :", error)
            return res.status(500).json({ success: false, message: "Failed to delete Coupon" })
        }
    }


}