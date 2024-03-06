export const useRuntimeConfig = () => ({
  region: process.env.NUXT_REGION ?? "us-east-2",
  bucketName: process.env.NUXT_BUCKET_NAME ?? "",//"km-sd25-pokemon-ohio",
});
