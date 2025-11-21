import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [rules, setRules] = useState(["", "", ""]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // 1. Create a ref to point to the results section
  const resultsRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 2. Auto-scroll to results when they appear
  useEffect(() => {
    if (results && resultsRef.current) {
      // Small timeout ensures DOM is fully painted before scrolling
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }, 100);
    }
  }, [results]);

  const handleUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a valid PDF file");
    }
  };

  const handleRuleChange = (i, value) => {
    const updated = [...rules];
    updated[i] = value;
    setRules(updated);
  };

  const checkDocument = async () => {
    if (!file) {
      setError("Please upload a PDF file");
      return;
    }

    const activeRules = rules.filter((r) => r.trim() !== "");
    if (activeRules.length === 0) {
      setError("Please enter at least one rule");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const form = new FormData();
      form.append("pdf", file);
      form.append("rules", JSON.stringify(activeRules));

      const res = await fetch("http://localhost:5000/check", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error("Failed to check document");
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: isMobile ? "20px 16px" : "40px 20px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowY: "auto", // Ensure vertical scrolling is handled gracefully
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? "20px" : "30px" }}>
          <h1
            style={{
              fontSize: isMobile ? "32px" : "48px",
              fontWeight: "800",
              color: "white",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
              textShadow: "0 4px 20px rgba(0,0,0,0.2)",
              lineHeight: "1.1",
              margin: 0,
              padding: 0,
            }}
          >
            📄 NIYAMR AI
          </h1>
          <p
            style={{
              fontSize: isMobile ? "15px" : "18px",
              color: "rgba(255,255,255,0.9)",
              fontWeight: "500",
              padding: 0,
              margin: 0,
            }}
          >
            AI-Powered PDF Compliance Checker
          </p>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: isMobile ? "16px" : "24px",
            padding: isMobile ? "20px" : "40px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.2)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Upload Section */}
          <div style={{ marginBottom: isMobile ? "24px" : "32px" }}>
            <h3
              style={{
                fontSize: isMobile ? "17px" : "19px",
                fontWeight: "700",
                marginBottom: "16px",
                color: "#1a1a2e",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                margin: "0 0 16px 0",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                1
              </span>
              Upload PDF Document
            </h3>
            
            <label
              style={{
                display: "block",
                padding: isMobile ? "24px 20px" : "32px",
                border: "3px dashed #d0d7de",
                borderRadius: isMobile ? "12px" : "16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: file ? "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" : "#f8f9fb",
              }}
              onMouseEnter={(e) => {
                if (!file) e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                if (!file) e.currentTarget.style.borderColor = "#d0d7de";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: isMobile ? "32px" : "40px", marginBottom: "12px" }}>
                {file ? "✅" : "📎"}
              </div>
              <div
                style={{
                  fontSize: isMobile ? "15px" : "17px",
                  fontWeight: "600",
                  color: file ? "#2d3748" : "#4a5568",
                  marginBottom: "6px",
                  wordBreak: "break-word",
                  padding: "0 10px",
                }}
              >
                {file ? file.name : "Click to upload or drag and drop"}
              </div>
              <div style={{ fontSize: isMobile ? "13px" : "14px", color: "#718096" }}>
                {file ? "PDF ready for analysis" : "PDF files only, up to 10MB"}
              </div>
            </label>
          </div>

          {/* Rules Section */}
          <div style={{ marginBottom: isMobile ? "24px" : "32px" }}>
            <h3
              style={{
                fontSize: isMobile ? "17px" : "19px",
                fontWeight: "700",
                marginBottom: "16px",
                color: "#1a1a2e",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                margin: "0 0 16px 0",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                2
              </span>
              Define Compliance Rules
            </h3>
            
            {rules.map((r, i) => (
              <div key={i} style={{ marginBottom: "14px", position: "relative" }}>
                <input
                  value={r}
                  onChange={(e) => handleRuleChange(i, e.target.value)}
                  placeholder={`Rule ${i + 1}: e.g., "Document must mention a date"`}
                  style={{
                    width: "100%",
                    padding: isMobile ? "14px 16px" : "16px 18px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: isMobile ? "14px" : "15px",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease",
                    fontFamily: "inherit",
                    background: "white",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            ))}
            
            <div
              style={{
                marginTop: "16px",
                padding: isMobile ? "14px" : "16px 18px",
                background: "linear-gradient(135deg, #f0f4ff 0%, #e9f0ff 100%)",
                borderRadius: "12px",
                borderLeft: "4px solid #667eea",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#4c51bf", marginBottom: "6px" }}>
                💡 Example Rules:
              </div>
              <div style={{ fontSize: isMobile ? "12px" : "13px", color: "#5a67d8", lineHeight: "1.6" }}>
                "Document must have a purpose section" • "Document must mention a date" • "Document must define at least one term"
              </div>
            </div>
          </div>

          {/* Check Button */}
          <button
            onClick={checkDocument}
            disabled={loading}
            style={{
              width: "100%",
              padding: isMobile ? "16px 24px" : "18px 32px",
              background: loading ? "#cbd5e0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: isMobile ? "16px" : "17px",
              fontWeight: "700",
              transition: "all 0.3s ease",
              boxShadow: loading ? "none" : "0 10px 30px rgba(102, 126, 234, 0.4)",
              transform: loading ? "none" : "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (!loading && !isMobile) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 15px 40px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isMobile) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 10px 30px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? "⏳ Analyzing Document..." : "🚀 Check Document"}
          </button>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: isMobile ? "14px" : "16px 18px",
                background: "linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)",
                border: "2px solid #fc8181",
                borderRadius: "12px",
                color: "#c53030",
                fontSize: isMobile ? "14px" : "15px",
                fontWeight: "600",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
              <span style={{ flex: 1 }}>{error}</span>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div 
              ref={resultsRef} 
              style={{ 
                marginTop: isMobile ? "32px" : "48px", 
                flex: 1, 
                display: "flex", 
                flexDirection: "column",
                scrollMarginTop: "40px" /* Adds breathing room when auto-scrolled */
              }}
            >
              <h2
                style={{
                  fontSize: isMobile ? "22px" : "28px",
                  fontWeight: "800",
                  marginBottom: isMobile ? "16px" : "24px",
                  color: "#1a1a2e",
                  textAlign: "center",
                  margin: "0 0 " + (isMobile ? "16px" : "24px"),
                }}
              >
                Compliance Results
              </h2>
              
              {/* Mobile Card View */}
              {isMobile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {results.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "20px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {/* Mobile Card Content (Same as before) */}
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "12px", color: "#718096", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase" }}>Rule</div>
                        <div style={{ fontWeight: "700", color: "#2d3748", fontSize: "15px" }}>{r.rule}</div>
                      </div>

                      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "8px 20px",
                            borderRadius: "24px",
                            fontSize: "13px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            background: r.status === "pass" ? "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" : "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
                            color: r.status === "pass" ? "#22543d" : "#742a2a",
                            boxShadow: r.status === "pass" ? "0 4px 15px rgba(150, 230, 161, 0.4)" : "0 4px 15px rgba(255, 154, 158, 0.4)",
                          }}
                        >
                          {r.status === "pass" ? "✓ PASS" : "✗ FAIL"}
                        </span>
                      </div>
                      {/* ... Rest of mobile card content ... */}
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "12px", color: "#718096", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase" }}>Evidence</div>
                        <div style={{ color: "#4a5568", fontSize: "14px", lineHeight: "1.5" }}>{r.evidence || "No evidence provided"}</div>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "12px", color: "#718096", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase" }}>Reasoning</div>
                        <div style={{ color: "#4a5568", fontSize: "14px", lineHeight: "1.5" }}>{r.reasoning || "No reasoning provided"}</div>
                      </div>
                      <div>
                         <div style={{ fontSize: "12px", color: "#718096", marginBottom: "8px", fontWeight: "600", textTransform: "uppercase" }}>Confidence</div>
                         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                           <div style={{ flex: 1, height: "10px", backgroundColor: "#e2e8f0", borderRadius: "10px", overflow: "hidden", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" }}>
                             <div style={{ width: `${r.confidence}%`, height: "100%", background: r.confidence >= 70 ? "linear-gradient(90deg, #48bb78 0%, #38a169 100%)" : r.confidence >= 40 ? "linear-gradient(90deg, #ecc94b 0%, #d69e2e 100%)" : "linear-gradient(90deg, #f56565 0%, #e53e3e 100%)", borderRadius: "10px" }} />
                           </div>
                           <span style={{ fontWeight: "700", minWidth: "50px", textAlign: "right", color: "#2d3748", fontSize: "16px" }}>{r.confidence}%</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Desktop Table View */
                <div style={{ overflowX: "auto", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: "0",
                      fontSize: "15px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ padding: "20px", textAlign: "left", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", borderTopLeftRadius: "12px" }}>Rule</th>
                        <th style={{ padding: "20px", textAlign: "center", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                        <th style={{ padding: "20px", textAlign: "left", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Evidence</th>
                        <th style={{ padding: "20px", textAlign: "left", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reasoning</th>
                        <th style={{ padding: "20px", textAlign: "left", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", borderTopRightRadius: "12px" }}>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr
                          key={i}
                          style={{
                            background: i % 2 === 0 ? "white" : "#f7fafc",
                            transition: "all 0.2s ease",
                          }}
                          /* 3. FIX: Removed 'scale(1.01)' which causes jitter. Used translateY instead. */
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#edf2f7";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = i % 2 === 0 ? "white" : "#f7fafc";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <td style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", fontWeight: "600", color: "#2d3748" }}>{r.rule}</td>
                          <td style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                            <span style={{ display: "inline-block", padding: "8px 20px", borderRadius: "24px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", background: r.status === "pass" ? "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" : "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", color: r.status === "pass" ? "#22543d" : "#742a2a", boxShadow: r.status === "pass" ? "0 4px 15px rgba(150, 230, 161, 0.4)" : "0 4px 15px rgba(255, 154, 158, 0.4)" }}>
                              {r.status === "pass" ? "✓ PASS" : "✗ FAIL"}
                            </span>
                          </td>
                          <td style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", maxWidth: "280px", color: "#4a5568", lineHeight: "1.6" }}>{r.evidence || "No evidence provided"}</td>
                          <td style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", maxWidth: "280px", color: "#4a5568", lineHeight: "1.6" }}>{r.reasoning || "No reasoning provided"}</td>
                          <td style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ flex: 1, height: "10px", backgroundColor: "#e2e8f0", borderRadius: "10px", overflow: "hidden", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" }}>
                                <div style={{ width: `${r.confidence}%`, height: "100%", background: r.confidence >= 70 ? "linear-gradient(90deg, #48bb78 0%, #38a169 100%)" : r.confidence >= 40 ? "linear-gradient(90deg, #ecc94b 0%, #d69e2e 100%)" : "linear-gradient(90deg, #f56565 0%, #e53e3e 100%)", transition: "width 0.6s ease", borderRadius: "10px" }} />
                              </div>
                              <span style={{ fontWeight: "700", minWidth: "50px", textAlign: "right", color: "#2d3748", fontSize: "16px" }}>{r.confidence}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: isMobile ? "20px" : "24px",
            color: "rgba(255,255,255,0.8)",
            fontSize: isMobile ? "12px" : "13px",
            padding: "10px 0",
          }}
        >
          Powered by AI • Built with precision
        </div>
      </div>
    </div>
  );
}