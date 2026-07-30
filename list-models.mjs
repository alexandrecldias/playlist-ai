import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";

const env = fs.readFileSync(".env.local", "utf8");

const apiKey = env
  .match(/^GEMINI_API_KEY=(.+)$/m)?.[1]
  ?.trim();

if (!apiKey) {
  throw new Error("GEMINI_API_KEY não encontrada.");
}

const client = new GoogleGenAI({ apiKey });

const pager = await client.models.list();

for await (const model of pager) {
  console.log(model.name);
}