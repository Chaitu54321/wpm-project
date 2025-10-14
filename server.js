// const express = require("express");
// const path = require("path");
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.static(path.join(__dirname, "public")));

// // API: /api/eval?expr=10+50-70*30/2
// app.get("/api/eval", (req, res) => {
//   const expr = req.query.expr;
//   if (!expr) {
//     return res.status(400).json({ error: "Provide an expression, e.g. /api/eval?expr=10+20*3" });
//   }

//   try {
//     // ⚠️ Use Function constructor instead of eval for safety
//     const result = Function(`"use strict"; return (${expr})`)();
//     res.json({ expr, result });
//   } catch (err) {
//     res.status(400).json({ error: "Invalid expression" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
// });

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/expression_calc", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Define schema & model
const calcSchema = new mongoose.Schema({
  expr: String,
  result: Number,
  time: { type: Date, default: Date.now },
});

const Calc = mongoose.model("Calc", calcSchema);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// 🧮 Evaluate API
app.get("/api/eval", async (req, res) => {
  const expr = req.query.expr;
  if (!expr)
    return res
      .status(400)
      .json({ error: "Provide an expression, e.g. /api/eval?expr=10+20*3" });

  try {
    const result = Function(`"use strict"; return (${expr})`)();

    // 💾 Save to MongoDB
    const record = new Calc({ expr, result });
    await record.save();

    res.json({ expr, result });
  } catch (err) {
    res.status(400).json({ error: "Invalid expression" });
  }
});

// 📜 Fetch last 10 calculations
app.get("/api/history", async (req, res) => {
  const history = await Calc.find().sort({ time: -1 }).limit(10);
  res.json(history);
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
