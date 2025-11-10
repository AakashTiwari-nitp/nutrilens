import ImageKit from "imagekit";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const getFileIdFromUrl = async (url) => {
    try {
        if (!url) return null;

        // Extract the file path from the full URL
        const base = process.env.IMAGEKIT_URL_ENDPOINT;

        // Remove the base URL to get just the file path
        const filePath = url.replace(base, '');

        // console.log("Original URL:", url);
        // console.log("File Path:", filePath);

        // getFileDetails expects fileId, not URL
        // Use listFiles to search by name instead
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];

        // console.log("Searching for filename:", filename);

        const files = await imagekit.listFiles({
            searchQuery: `name="${filename}"`
        });

        if (files && files.length > 0) {
            // console.log("✅ File found:");
            // console.log(files[0]);
            // console.log(`\n🆔 File ID: ${files[0].fileId}`);
            return files[0].fileId;
        }

        console.log("❌ File not found");
        return null;

    } catch (error) {
        console.error("❌ Error fetching file details:", error.message);
        return null;
    }
}


// Delete file from ImageKit
const deleteFromImageKit = async (fileId) => {
    try {
        if (!fileId) return { error: true, message: "No fileId provided" };

        await imagekit.deleteFile(fileId);

        return {
            error: false,
            message: "File deleted successfully"
        };
    } catch (error) {
        return {
            error: true,
            message: error.message || "Error deleting file from ImageKit"
        };
    }
};

const uploadAvatarOnImageKit = async (localFilePath, userName) => {
    try {
        if (!localFilePath) return null;

        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(localFilePath);
        const base64File = fileBuffer.toString('base64');

        const response = await imagekit.upload({
            file: base64File,
            fileName: `${userName}_${Date.now()}`,
            folder: '/users'
        });

        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);

        return {
            error: false,
            url: response.url,
            fileId: response.fileId
        };

    } catch (error) {
        // Delete local file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return {
            error: true,
            message: error.message || "Error uploading image to ImageKit"
        };
    }
}

const uploadProductOnImageKit = async (localFilePath, productId) => {
    try {
        if (!localFilePath) return null;

        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(localFilePath);
        const base64File = fileBuffer.toString('base64');

        const response = await imagekit.upload({
            file: base64File,
            fileName: `${productId}_${Date.now()}`,
            folder: '/proucts',
        });

        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);

        return {
            error: false,
            url: response.url,
            fileId: response.fileId
        };

    } catch (error) {
        // Delete local file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return {
            error: true,
            message: error.message || "Error uploading image to ImageKit"
        };
    }
}

const uploadNewsImageOnImageKit = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(localFilePath);
        const base64File = fileBuffer.toString('base64');

        const response = await imagekit.upload({
            file: base64File,
            fileName: `news_${Date.now()}`,
            folder: '/news'
        });

        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);

        return {
            error: false,
            url: response.url,
            fileId: response.fileId
        };

    } catch (error) {
        // Delete local file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return {
            error: true,
            message: error.message || "Error uploading image to ImageKit"
        };
    }
}

export { uploadAvatarOnImageKit, uploadProductOnImageKit, deleteFromImageKit, getFileIdFromUrl, uploadNewsImageOnImageKit };