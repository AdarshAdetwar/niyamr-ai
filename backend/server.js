import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import pdf from "pdf-parse-fork";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ----------------------------------------------------
//  🔥 Extract text using pdf-parse-fork
// ----------------------------------------------------
async function extractTextFromPDF(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

// ----------------------------------------------------
//  🔍 Evaluate Rules Endpoint
// ----------------------------------------------------
app.post("/check", upload.single("pdf"), async (req, res) => {
  try {
    const rules = JSON.parse(req.body.rules);
    const pdfBuffer = req.file.buffer;

    // 1️⃣ Extract text
    const text = await extractTextFromPDF(pdfBuffer);

    const results = [];

    // 2️⃣ Evaluate each rule with Groq Llama 3.1 8B
    for (const rule of rules) {
      const prompt = `
Evaluate this PDF text for the rule:

Rule: "${rule}"

Document Text:
${text}

Return ONLY valid JSON:
{
  "status": "pass" or "fail",
  "evidence": "one short sentence from the document",
  "reasoning": "brief explanation",
  "confidence": number between 0-100
}
`;

      // ✅ FIXED: Use correct model name
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      const raw = response.choices[0].message.content;

      let parsed;
      try {
        const jsonText = raw.match(/\{[\s\S]*\}/)[0];
        parsed = JSON.parse(jsonText);
      } catch (err) {
        parsed = {
          status: "fail",
          evidence: "Invalid JSON returned",
          reasoning: raw,
          confidence: 0,
        };
      }

      results.push({ rule, ...parsed });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Backend Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});