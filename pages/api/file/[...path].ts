import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  endpoint: process.env.AWS_S3_ENDPOINT || 'https://s3.us-west-2.amazonaws.com',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { path } = req.query;

  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ message: 'Invalid file path' });
  }

  const filePath = path.join('/');
  const bucketName = 'osu-corelab-storage';

  try {
    console.log('Fetching file from S3:', bucketName, filePath);

    // Get the file from S3
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return res.status(404).json({
        message: 'File not found',
        path: filePath
      });
    }

    // Get the content type from S3 metadata or determine from file extension
    const contentType = response.ContentType || getContentType(filePath);

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    if (response.ContentLength) {
      res.setHeader('Content-Length', response.ContentLength.toString());
    }

    // Stream the file data
    const bodyContents = await response.Body.transformToByteArray();
    res.status(200).send(Buffer.from(bodyContents));

  } catch (error: any) {
    console.error('Error fetching file from S3:', error);

    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({
        message: 'File not found',
        path: filePath
      });
    }

    return res.status(500).json({
      message: 'Error fetching file',
      error: error.message
    });
  }
};

// Helper function to determine content type based on file extension
function getContentType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'csv': 'text/csv',
    'txt': 'text/plain',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
  };

  return mimeTypes[extension || ''] || 'application/octet-stream';
}