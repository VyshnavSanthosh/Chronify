export default class CouponService {
    constructor(couponRepository) {
        this.couponRepository = couponRepository
    }

    async save(data) {
        data.applyType = data.applyType.toLowerCase()
        data.couponCode = data.couponCode.toUpperCase()
        return await this.couponRepository.save(data)
    }
    async getAllCategories() {
        return await this.couponRepository.getAllCategories()
    }

    async getAllCoupons(search, status, page, limit) {
        return await this.couponRepository.getAllCoupons(search, status, page, limit)
    }

    async toggleStatus(couponId, isActive) {

        isActive = isActive === "true" ? false : true;

        return await this.couponRepository.toggleStatus(couponId, isActive)
    }

    async getCouponById(couponId) {
        return await this.couponRepository.getCouponById(couponId)
    }

    async editCoupon(data, couponId) {
        data.applyType = data.applyType.toLowerCase()
        data.couponCode = data.couponCode.toUpperCase()
        return await this.couponRepository.editCoupon(data, couponId)
    }

    async deleteCoupon(couponId) {
        return await this.couponRepository.deleteCouponById(couponId)
    }

    async checkCoupon(couponCode) {
        return await this.couponRepository.checkCouponByCode(couponCode)
    }

    async getAvailableCoupons() {
        return await this.couponRepository.getActiveCoupons()
    }
}