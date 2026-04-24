function normalize(text) {
  return text.toUpperCase().replace(/[^A-Z0-9 ]/g, "");
}

function extractModality(desc) {
  if (desc.includes("MRI")) return "MRI";
  if (desc.includes("CT")) return "CT";
  if (desc.includes("XRAY") || desc.includes("X-RAY")) return "XRAY";
  return "OTHER";
}

function extractBodyPart(desc) {
  const parts = ["BRAIN", "HEAD", "CHEST", "ABDOMEN", "SPINE"];
  for (let part of parts) {
    if (desc.includes(part)) return part;
  }
  return "OTHER";
}

function keywordOverlap(a, b) {
  const wordsA = new Set(a.split(" "));
  const wordsB = new Set(b.split(" "));
  let count = 0;

  for (let word of wordsA) {
    if (wordsB.has(word) && word.length > 3) count++;
  }
  return count;
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a.split(" "));
  const setB = new Set(b.split(" "));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

function calculateScore(current, prior) {
  const currDesc = normalize(current.study_description);
  const priorDesc = normalize(prior.study_description);

  let score = 0;

  const currMod = extractModality(currDesc);
  const priorMod = extractModality(priorDesc);

  const currBody = extractBodyPart(currDesc);
  const priorBody = extractBodyPart(priorDesc);

  if (currMod === priorMod && currBody === priorBody) score += 4;
  if (currBody === priorBody) score += 2;
  if (currMod === priorMod) score += 2;

  score += Math.min(3, keywordOverlap(currDesc, priorDesc));

  const sim = jaccardSimilarity(currDesc, priorDesc);
  if (sim > 0.5) score += 3;
  else if (sim > 0.3) score += 1;

  const currDate = new Date(current.study_date);
  const priorDate = new Date(prior.study_date);
  const diffYears = (currDate - priorDate) / (1000 * 60 * 60 * 24 * 365);

  if (diffYears <= 3) score += 2;
  else if (diffYears <= 6) score += 1;
  else if (diffYears > 10) score -= 2;

  if (currBody !== priorBody) score -= 3;

  return score;
}

function isRelevant(current, prior) {
  return calculateScore(current, prior) >= 4;
}

module.exports = { isRelevant };