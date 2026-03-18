import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { cloudinary_name, cloudinary_api_key, cloudinary_api_secret } from "../config/index.js";
// Configuration
cloudinary.config({
    cloud_name: cloudinary_name,
    api_key: cloudinary_api_key,
    api_secret: cloudinary_api_secret
});



async function uploadToCloudinary(filePath, folder = "uploads") {
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

        // Delete local file after successful upload
        await fs.unlink(filePath).catch(err => 
            console.warn(`Could not delete temp file ${filePath}:`, err.message)
        );

        return result;

    } catch (error) {

        await fs.unlink(filePath).catch(() => {});


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

async function deleteFolder(folderPath) {
    try {
        if (!folderPath) {
            throw new Error('Folder path is required');
        }

        const result = await cloudinary.api.delete_folder(folderPath);
        return result;

    } catch (error) {
        const errorMessage = `Cloudinary folder deletion failed: ${error.message}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}

export {
    uploadToCloudinary,
    deleteFromCloudinary,
    getFileInfo,
    deleteFolder
};