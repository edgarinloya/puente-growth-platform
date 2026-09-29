import fs from "fs";
import OpenAI from "openai";

const client = new OpenAI();

const aiResponse = fs.readFileSync("sample_response.txt", "utf8");

const prompt = `
You are extracting factual product claims from an AI shopping response.

Return ONLY valid JSON.

AI response:
${aiResponse}

Extract these fields:

product_name
price
water_protection
warranty
availability

If a field is not mentioned, use null.

Example format:

{
  "product_name": "Example Backpack",
  "price": 149,
  "water_protection": "waterproof",
  "warranty": "1 year",
  "availability": "in stock"
}
`;

const response = await client.responses.create({
  model: "gpt-6-astra",
  input: prompt
});

console.log("Extracted Claims:");
console.log(response.output_text);