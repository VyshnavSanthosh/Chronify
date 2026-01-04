const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;
const { cloudinary_name, cloudinary_api_key, cloudinary_api_secret } = require("../config/index");
// Configuration
cloudinary.config({ 
    cloud_name: cloudinary_name, 
    api_key: cloudinary_api_key, 
    api_secret: cloudinary_api_secret
});

// upload file to cloudinary and delete local file

async function uploadToCloudinary(filePath, folder = "uploads"){
    let localFiledDeleted = false;

    try {
        if (!filePath) {
            throw new Error("File path is required");
        }

        // Verify file exists
        await fs.access(filePath);

        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true
        });
        // Delete local file after upload
        await fs.unlink(filePath)
        localFiledDeleted = true;

        return result

    } catch (error) {
        
        if (!localFiledDeleted) {
            await fs.unlink(filePath)
        }

        const errorMessage = `Cloudinary upload failed: ${error.message}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}

// Delete file from Cloudinary
async function deleteFromCloudinary(public_id) {
    try {
    if (!public_id) {
        throw new Error('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== 'ok') {
        throw new Error(`Failed to delete: ${result.result}`);
    }

    return result;

    } catch (error) {
        const errorMessage = `Cloudinary deletion failed: ${error.message}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}


async function getFileInfo(public_id) {
    try {
    const result = await cloudinary.api.resource(public_id);
    return result;
    } catch (error) {
        console.error('Error getting file info:', error.message);
        throw new Error(`Could not retrieve file info: ${error.message}`);
    }
}

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    getFileInfo
}