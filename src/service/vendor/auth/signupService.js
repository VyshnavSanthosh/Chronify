const {hashString, compareString} = require('../../../utils/bcrypt');

module.exports = class VendorAuthService{
    constructor(vendorRepository){
        this.vendorRepository = vendorRepository;
    }

    async register(vendordata){
        const {brandName, brandEmail, mobileNumber,  password} = vendordata

        const exist = await this.vendorRepository.findByEmail(brandEmail)

        if (exist && exist.isVerified) {
            throw new Error("Email already registered");
        }

        if (exist && !exist.isVerified) {
            await this.vendorRepository.deleteById(exist._id);
        }
        const passwordHash = await hashString(password)

        const newVendorData = {
            brandName: brandName,
            brandEmail: brandEmail,
            mobileNumber: mobileNumber,
            passwordHash: passwordHash
        }
        try {
            const vendorobj = await this.vendorRepository.createVendor(newVendorData)

            // sanitize
            let vendorObj = typeof vendorobj.toObject === "function"? vendorobj.toObject() : { ...vendorobj }; 

            delete vendorObj.passwordHash;
            return vendorObj;

        } catch (err) {
            throw err; // let controller handle messaging
        }
    }
}