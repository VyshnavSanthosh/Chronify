export default class AddressController {
    constructor(validator, joi_address, addressService) {
        this.validator = validator
        this.joi_address = joi_address
        this.addressService = addressService
    }
    async renderAddAddressPage(req, res) {
        const user = req.user
        try {

            return res.status(200).render("user/address/addAddress", {
                user,
                addressData: "",
            })
        } catch (error) {
            console.log("Couldn't laod add address page", error.message)
        }
    }

    async handleAddAddress(req, res) {
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

            return res.status(400).render("user/address/addAddress", {
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
                }
            });
        }

        try {
            const data = value
            await this.addressService.saveAddress(data, req.user._id)
            req.session.success = "Address added successfully!"
            return res.status(200).redirect("/address")
        } catch (error) {
            console.error("Error adding address:", error);
            return res.status(500).render("user/address/addAddress", {
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
                }
            });
        }
    }

    async renderAddressPage(req, res) {
        const userId = req.user._id
        const addresses = await this.addressService.getAllAddress(userId)

        const success = req.session.success;
        const error = req.session.error;
        delete req.session.success;
        delete req.session.error;

        return res.render("user/address/addressList", {
            addresses,
            user: req.user,
            success,
            error
        })
    }

    async renderEditAddressPage(req, res) {
        try {
            const addressId = req.params.id;
            const userId = req.user._id;
            const address = await this.addressService.getAddressById(addressId, userId);

            if (!address) {
                req.session.error = "Address not found";
                return res.redirect("/address");
            }

            return res.render("user/address/editAddress", {
                user: req.user,
                addressData: address,
            });
        } catch (error) {
            console.error("Error rendering edit address page:", error);
            res.redirect("/address");
        }
    }

    async handleEditAddress(req, res) {
        const addressId = req.params.id;
        const userId = req.user._id;

        if (req.body.makeDefault === "on") {
            req.body.makeDefault = true;
        } else {
            req.body.makeDefault = false;
        }

        const { error, value } = await this.validator.validate(this.joi_address, req.body);

        if (error) {
            let errors = {};
            error.details.forEach(err => {
                errors[err.context.key] = err.message;
            });

            return res.render("user/address/editAddress", {
                user: req.user,
                errors,
                addressData: { ...value, _id: addressId },
            });
        }

        try {
            await this.addressService.updateAddress(addressId, userId, value);
            req.session.success = "Address updated successfully!";
            return res.redirect("/address");
        } catch (error) {
            console.error("Error updating address:", error);
            return res.render("user/address/editAddress", {
                user: req.user,
                error: "Something went wrong. Please try again.",
                addressData: { ...req.body, _id: addressId },
            });
        }
    }

    async handleDeleteAddress(req, res) {
        try {
            const addressId = req.params.id;
            const userId = req.user._id;
            await this.addressService.deleteAddress(addressId, userId);
            req.session.success = "Address deleted successfully!";
            return res.redirect("/address");
        } catch (error) {
            console.error("Error deleting address:", error);
            req.session.error = "Failed to delete address";
            return res.redirect("/address");
        }
    }
}