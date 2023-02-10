import s3 from './s3';
import { Express } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';

type Photo = {
    name: string;
    width: number;
    height: number;
};

const resizeAndUpload = (file: Express.Multer.File): Photo => {
    s3.send(
        new PutObjectCommand({
            Bucket: 'veloinfo',
            Key: 'test',
            Body: file.buffer,
        }),
    );

    return { name: 'test', width: 100, height: 100 };
};

export { Photo, resizeAndUpload };
