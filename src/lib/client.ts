import { env } from "@env/client.mjs";
import sanityClient from "@sanity/client";

export const client = sanityClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "production",
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: true,
  token: env.NEXT_PUBLIC_SANITY_TOKEN,
});
