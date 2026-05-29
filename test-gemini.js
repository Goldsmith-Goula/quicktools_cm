const KEY = "AQ.Ab8RN6J-UowIFTSxCfAMo0mn4Tpqtwwfw4kKRhFtcxMBe9QdpQ";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`;

async function testConnection() {
  try {
    console.log("Sending request directly via Node.js fetch...");
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Explain 2+2" }] }]
      })
    });

    const data = await response.json();
    console.log("\n--- TEST RESULTS ---");
    console.log("HTTP Status Code:", response.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Network Fetch Failure:", error);
  }
}

testConnection();