import { S3 } from 'aws-sdk';

export class S3Function {
    private readonly s3: S3;

    constructor() {
        // Initialize AWS S3 client
        this.s3 = new S3();
    }

    /**
     * Deletes a file from AWS S3
     * @param fileUrl - The full URL of the file to delete
     * @throws Error if bucket name or file URL is missing
     */
    async deleteFileFromS3(fileUrl: string): Promise<void> {
        const bucketName = process.env.AWS_S3_BUCKET_NAME;

        if (!bucketName || !fileUrl) {
            throw new Error('Bucket name or file URL is missing.');
        }

        // Delete the file from S3
        await this.s3.deleteObject({
            Bucket: bucketName,
            Key: fileUrl,
        }).promise();
    }
}
