const express = require("express");
const { isRelevant } = require("./utils");

const app = express();

// 🚀 Large body support
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.post("/", (req, res) => {
  const cases = req.body.cases;
  let predictions = [];

  for (let c of cases) {
    const current = c.current_study;

    for (let prior of c.prior_studies) {
      predictions.push({
        case_id: c.case_id,
        study_id: prior.study_id,
        predicted_is_relevant: isRelevant(current, prior)
      });
    }
  }

  res.json({ predictions });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
