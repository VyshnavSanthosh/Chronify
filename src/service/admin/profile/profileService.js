import { deleteFromCloudinary } from "../../../utils/cloudinary.js";
export default class ProfileService {
    constructor(userRepository) {
        this.userRepository = userRepository
    }

    async findUser(email) {
        return await this.userRepository.findByEmail(email)
    }

    async updateUser(userObj, userdata, imageObj) {
        const user = await this.userRepository.findById(userdata._id)
        if (user.profileImage?.publicId != null && imageObj.url) {
            try {
                await deleteFromCloudinary(user.profileImage.publicId)
            } catch (error) {
                console.log("Couldn't delete image from cloudinary");
            }
        }
        if (imageObj && imageObj.url != null) {
            userObj.profileImage = imageObj
        }
        return await this.userRepository.updateUserById(userdata._id, userObj);
    }
}