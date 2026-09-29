const fs = require("fs");

const truth = JSON.parse(
  fs.readFileSync("product_truth.json", "utf8")
);

const claims = JSON.parse(
  fs.readFileSync("extracted_claims.json", "utf8")
);

const fieldsToCompare = [
  "product_name",
  "price",
  "water_protection",
  "warranty",
  "availability"
];

const results = {};

for (const field of fieldsToCompare) {
  const truthValue = truth[field];
  const claimValue = claims[field];

  const match =
    String(truthValue).toLowerCase().trim() ===
    String(claimValue).toLowerCase().trim();

  results[field] = {
    ai_value: claimValue,
    truth_value: truthValue,
    status: match ? "match" : "mismatch"
  };
}

console.log("Puente Validation Results:");
console.log(JSON.stringify(results, null, 2));