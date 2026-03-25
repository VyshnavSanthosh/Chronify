import Coupon from "../../models/admin/couponSchema.js";
import Category from "../../models/admin/categorySchema.js";
export default class CouponRepository {

    async save(data) {
        try {

            const existingCoupon = await Coupon.findOne({
                couponCode: data.couponCode
            });

            if (existingCoupon) {
                throw new Error("Coupon code already exists");
            }

            const coupon = new Coupon({
                ...data,
                startDate: new Date(data.startDate),
                expiryDate: new Date(data.expiryDate)
            });

            const savedCoupon = await coupon.save();

            return savedCoupon;

        } catch (error) {
            console.error("Coupon repository save error:", error);
            throw error;
        }
    }

    async getAllCategories() {
        return await Category.find({})

    }

    async getAllCoupons(search = "", status = "all", page = 1, limit = 10) {
        try {
            const query = {};

            if (search) {
                query.couponCode = { $regex: search, $options: "i" };
            }

            if (status !== "all") {
                query.isActive = status === "active";
            }

            const skip = (page - 1) * limit;

            const coupons = await Coupon.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalCoupons = await Coupon.countDocuments(query);

            return { coupons, totalCoupons };
        } catch (error) {
            console.error("Error fetching coupons:", error);
            throw new Error("Failed to fetch coupons");
        }
    }

    async toggleStatus(couponId, isActive) {

        try {
            return await Coupon.findByIdAndUpdate(
                couponId,
                { $set: { isActive: isActive } },
                { new: true }
            )
        } catch (error) {
            console.log("DB toggle error:", error);
            throw new Error("Couldn't update status in db ");

        }
    }

    async getCouponById(couponId) {
        try {
            return await Coupon.findById(couponId)
        } catch (error) {
            console.log("Couldn't get the coupon :", error)
            throw new Error("Couldn't get the coupon from db");

        }
    }

    async editCoupon(data, couponId) {
        try {
            return await Coupon.findByIdAndUpdate(
                couponId,
                { $set: data },
                { new: true }
            )
        } catch (error) {
            console.log("Repo edit coupon error:", error)
            throw error
        }
    }

    async deleteCouponById(couponId) {
        try {
            return await Coupon.findByIdAndDelete(couponId)
        } catch (error) {
            console.log("Couldn't delete coupon from db", error)
            throw new Error("Couldn't delete coupon from db");
        }
    }

    async checkCouponByCode(couponCode) {
        try {
            const now = new Date();
            return await Coupon.findOne({
                couponCode,
                isActive: true,
                expiryDate: { $gt: now },
                $expr: { $lt: ["$usedCount", "$usageLimit"] }
            })
        } catch (error) {
            console.log("Couldn't get the coupon :", error)
            throw new Error("There is no coupon with this code or it has reached its usage limit");
        }
    }

    async getActiveCoupons() {
        try {
            const now = new Date();
            return await Coupon.find({
                isActive: true,
                expiryDate: { $gt: now },
                $expr: { $lt: ["$usedCount", "$usageLimit"] }
            }).sort({ expiryDate: 1 });
        } catch (error) {
            console.error("Error fetching active coupons:", error);
            throw new Error("Failed to fetch active coupons");
        }
    }

    async incrementUsedCount(couponCode) {
        try {
            return await Coupon.findOneAndUpdate(
                { couponCode },
                { $inc: { usedCount: 1 } },
                { new: true }
            );
        } catch (error) {
            console.error("Error incrementing coupon used count:", error);
            throw new Error("Failed to update coupon usage");
        }
    }
}
