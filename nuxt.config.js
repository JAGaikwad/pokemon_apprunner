import { defineNuxtConfig } from "nuxt/config";

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
//bucketName: "km-sd25-pokemon-ohio",
export default defineNuxtConfig({
  css: ["animate.css"],
  runtimeConfig: {
    region: "us-east-1",
    bucketName: "",
    public: {
      backendOrigin: undefined,
    },
  },
});
