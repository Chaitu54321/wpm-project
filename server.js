const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

// API: /api/eval?expr=10+50-70*30/2
app.get("/api/eval", (req, res) => {
  const expr = req.query.expr;
  if (!expr) {
    return res.status(400).json({ error: "Provide an expression, e.g. /api/eval?expr=10+20*3" });
  }

  try {
    // ⚠️ Use Function constructor instead of eval for safety
    const result = Function(`"use strict"; return (${expr})`)();
    res.json({ expr, result });
  } catch (err) {
    res.status(400).json({ error: "Invalid expression" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
