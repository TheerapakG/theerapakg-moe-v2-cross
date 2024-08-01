import { S3 } from "@aws-sdk/client-s3";

let s3: S3 | null = null;

export const useS3 = () => {
  if (!s3) {
    const config = useRuntimeConfig();
    s3 = new S3({
      forcePathStyle: false,
      endpoint: config.s3OriginEndpoint,
      region: "us-east-1",
      credentials: {
        accessKeyId: config.s3Key,
        secretAccessKey: config.s3Secret,
      },
    });
  }
  return s3;
};
