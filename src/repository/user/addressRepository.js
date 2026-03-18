import Address from "../../models/user/addressSchema.js";
export default class AddressRepository {
    async saveAddress(data, userId) {
        try {
            const address = await Address.create({
                user: userId,
                name: data.name,
                phone: data.phone,
                address: data.address,
                district: data.district,
                state: data.state,
                landmark: data.landmark || "",
                pinCode: data.pinCode,
                addressType: data.addressType || "home",
                isDefault: data.makeDefault
            });

            return address;
        } catch (error) {
            console.error("Error saving address in db :", error);
            throw error;
        }
    }

    async getAllAddressByUserId(userId) {
        return await Address.find({ user: userId })
            .sort({ isDefault: -1, createdAt: -1 });

    }

    async getAddressById(id, userId) {
        return await Address.findOne({ _id: id, user: userId });
    }

    async updateAddress(id, userId, data) {
        try {            
            return await Address.findOneAndUpdate(
                { _id: id, user: userId },
                {
                    name: data.name,
                    phone: data.phone,
                    address: data.address,
                    district: data.district,
                    state: data.state,
                    landmark: data.landmark || "",
                    pinCode: data.pinCode,
                    addressType: data.addressType || "home",
                    isDefault: data.makeDefault
                },
                { new: true }
            );
        } catch (error) {
            console.error("Error updating address in db :", error);
            throw error;
        }
    }

    async deleteAddress(id, userId) {
        return await Address.findOneAndDelete({ _id: id, user: userId });
    }
}