const URL = "https://pgebqkgghiwittxsshxp.supabase.co";
const KEY = "sb_publishable_oioK85YYfmOTYuRzlg5NwA_bdLgj9PU";

async function testConnection() {
  try {
    console.log("Sending request to Supabase REST API directly via Node.js fetch...");
    const response = await fetch(`${URL}/rest/v1/crowdsourced_codes?select=*&limit=1`, {
      method: "GET",
      headers: {
        "apikey": KEY,
        "Authorization": `Bearer ${KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log("\n--- SUPABASE TEST RESULTS ---");
    console.log("HTTP Status Code:", response.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Network Fetch Failure:", error);
  }
}

testConnection();
