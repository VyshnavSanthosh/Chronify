import PaymentFactory from "../../../service/user/order/payment/paymentFactory.js";

export default class CheckoutController {
    constructor(orderService, addressService, validator, joi_address, couponService, productInventoryService) {
        this.orderService = orderService
        this.addressService = addressService
        this.validator = validator
        this.joi_address = joi_address
        this.couponService = couponService
        this.productInventoryService = productInventoryService
    }
    async renderCheckoutPage(req, res) {
        const user = req.user
        const { cartId } = req.params
        const { discount, couponCode, maxDiscountAmount, couponApplied } = req.query;
        try {

            const addresses = await this.orderService.getAllAddress(user._id)
            const { validItems, total, shippingFee, removedItems, totalDiscountAmount } = await this.orderService.getCartItems(user._id, discount, couponCode, maxDiscountAmount, couponApplied)

            if (removedItems.length > 0) {
                console.log(removedItems)

            }


            return res.render("user/order/checkout", {
                user: user,
                addresses,
                cart: {
                    items: validItems,
                    _id: cartId
                },
                total: total,
                subTotal: total,
                discountAmount: totalDiscountAmount,
                shippingFee,
                cartId
            })
        } catch (error) {
            console.log("Couldn't load checkout page : ", error)
            return res.redirect("/cart?error=checkout_failed");
        }
    }

    async renderAddAddressPage(req, res) {
        const { cartId } = req.params
        const user = req.user
        try {

            return res.status(200).render("user/order/checkoutAddress", {
                user,
                addressData: "",
                cartId
            })
        } catch (error) {
            console.log("Couldn't laod add address page", error.message)
        }
    }

    async handleAddAddress(req, res) {
        const { cartId } = req.params
        if (req.body.makeDefault === "on") {
            req.body.makeDefault = true;
        } else {
            req.body.makeDefault = false;
        }
        const { error, value } = await this.validator.validate(this.joi_address, req.body)

        let errors = {}

        if (error) {
            error.details.forEach(err => {
                errors[err.context.key] = err.message;
            });

            return res.status(400).render("user/order/checkoutAddress", {
                user: req.user,
                errors,
                addressData: {
                    address: value.address || "",
                    name: value.name || "",
                    phone: value.phone || "",
                    landmark: value.landmark || "",
                    pinCode: value.pinCode || "",
                    addressType: value.addressType || "",
                    makeDefault: value.makeDefault || false
                },
                cartId
            });
        }

        try {
            const data = value
            await this.addressService.saveAddress(data, req.user._id)
            req.session.success = "Address added successfully!"

            return res.status(200).redirect(`/checkout/${cartId}`)
        } catch (error) {
            console.error("Error adding address:", error);
            return res.status(500).render("user/order/checkoutAddress", {
                user: req.user,
                error: "Something went wrong. Please try again.",
                addressData: {
                    address: req.body.address || "",
                    name: req.body.name || "",
                    phone: req.body.phone || "",
                    landmark: req.body.landmark || "",
                    pinCode: req.body.pinCode || "",
                    addressType: req.body.addressType || "",
                    makeDefault: req.body.makeDefault || false
                },
                cartId
            });
        }
    }

    async handleCheckout(req, res) {
        const data = req.body
        const user = req.user
        const couponCode = data.couponCode
        if (couponCode) {
            const isCouponValid = await this.couponService.checkCoupon(couponCode)
            if (isCouponValid == null) {
                data.total = Number(data.total) + Number(data.discountAmount)
                data.discountAmount = 0
                return res.status(400).json({
                    success: false,
                    message: "This coupon is no longer available or has reached its usage limit"
                })
            }
        }


        if (!data.address || !data.paymentMethod || !data.items || data.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required order information"
            })
        }

        if (data.paymentMethod === 'COD' && data.total > 1000) {
            return res.status(400).json({
                success: false,
                message: "Cash on Delivery is not allowed for orders above Rs 1000. Please choose another payment method."
            })
        }
        try {

            const paymentService = PaymentFactory.getPaymentService(data.paymentMethod)

            const paymentResult = await paymentService.startPayment(data.total, user._id)

            await this.orderService.sendProductDataToInventoryToReserve(data.items)
            const order = await this.orderService.saveOrder(data, user._id, user.email)
            if (!order) {
                await this.productInventoryService.releaseStock(data.items.map((item) => {
                    return {
                        id: item.productId,
                        sku: item.sku,
                        qty: item.quantity
                    }
                }))
                return res.status(500).json({
                    success: false,
                    message: "Failed to create order"
                })
            }
            if (paymentResult.status == "completed") {
                await this.orderService.updatePaymentStatus(order._id, "completed")
                if (paymentResult.method == "wallet") {
                    await this.orderService.updatePaymentStatus(order._id, "completed")
                }
                return res.json({
                    success: true,
                    type: "order_created",
                    orderId: order._id
                });
            }
            return res.json({
                success: true,
                type: "gateway_payment",
                paymentData: paymentResult,
                orderId: order._id
            });
        } catch (savingError) {
            console.error("Checkout error:", savingError);
            if (data.items && savingError.message != "Insufficient stock for SKU: CHRONIFY-TIMEX BROWN ANALOG WATCH-BROWN-METAL") {
                await this.productInventoryService.releaseStock(data.items.map(item => ({
                    id: item.productId,
                    sku: item.sku,
                    qty: item.quantity
                }))).catch(console.error);
            }
            return res.status(500).json({
                success: false,
                message: savingError.message || "An error occurred during checkout"
            });
        }
    }

    async verifyPayment(req, res) {
        const { paymentMethod, paymentData, orderId } = req.body
        try {
            const paymentService = PaymentFactory.getPaymentService(paymentMethod)
            const verificationResult = await paymentService.verifyPayment(paymentData)

            if (!verificationResult || !verificationResult.success) {
                return res.json({
                    success: false,
                    message: "Payment verification failed"
                });
            }

            // Update existing order
            const order = await this.orderService.updatePaymentStatus(orderId, "completed")
            if (!order) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to update order status"
                })
            }

            return res.json({
                success: true,
                type: "order_created",
                orderId: order._id
            });

        } catch (error) {
            console.error("Payment verification error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "An error occurred during payment verification"
            });
        }
    }

    async handleCancel(req, res) {

        const { orderId, items } = req.body;
        try {

            if (orderId) {
                await this.orderService.updateOrderStatus(orderId, "cancelled");
                await this.orderService.updatePaymentStatus(orderId, "cancelled");
            }
            // Release stock
            if (items && items.length > 0) {
                await this.productInventoryService.releaseStock(items.map(item => ({
                    id: item.productId,
                    sku: item.sku,
                    qty: item.quantity
                })));
            }
            return res.json({ success: true, message: "Order cancelled and stock released" });
        } catch (error) {
            console.error("Cancellation error:", error);
            return res.status(500).json({ success: false, message: "Failed to process cancellation" });
        }
    }

    async checkCoupon(req, res) {
        try {
            const { couponCode } = req.body
            const coupon = await this.couponService.checkCoupon(couponCode)
            if (!coupon) {
                return res.json({
                    success: false,
                    message: "Invalid coupon code or it has reached its usage limit"
                })
            }
            if (!coupon.isActive) {
                return res.json({
                    success: false,
                    message: "This coupon is blocked"
                })
            }
            return res.json({
                success: true,
                discountAmount: coupon.discount,
                applyType: coupon.applyType,
                category: coupon.category || undefined,
                maxDiscountAmount: coupon.maxDiscountAmount
            })


        } catch (error) {
            console.log("Error in checkCoupon:", error)
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    async getAvailableCoupons(req, res) {
        try {
            const coupons = await this.couponService.getAvailableCoupons();
            return res.json({
                success: true,
                coupons
            });
        } catch (error) {
            console.error("Error in getAvailableCoupons:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch available coupons"
            });
        }
    }
}