import { Client } from "@upstash/qstash";

export const qstashClient = new Client({
  // This baseUrl is key! It tells the SDK to talk to your local CLI
  baseUrl: process.env.QSTASH_URL, 
  token: process.env.QSTASH_TOKEN!,
});