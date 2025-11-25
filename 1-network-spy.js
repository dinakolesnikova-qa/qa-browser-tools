/**
 * 🕵️ NETWORK SPY (v2 - With Stop Button)
 * Run this script BEFORE searching to capture all hotel data.
 * To STOP capturing: set window.isSpyActive = false;
 */

// 1. Create a global box to store our hotels
window.allCapturedHotels = [];

// 2. Control Switch (Active by default)
window.isSpyActive = true;

// 3. Save the original JSON parser
const originalJsonParse = JSON.parse;

// 4. Overwrite with our Spy
JSON.parse = function(jsonString) {
    const data = originalJsonParse.apply(this, arguments);

    // Only capture if the switch is ON
    if (window.isSpyActive) {
        try {
            // Look for the "accommodations" array inside "results"
            if (data && data.results && Array.isArray(data.results.accommodations)) {
                window.allCapturedHotels.push(...data.results.accommodations);
                console.log(`🕵️ Spy: Captured ${data.results.accommodations.length} new hotels! (Total: ${window.allCapturedHotels.length})`);
            }
        } catch (err) {
            // Ignore errors
        }
    }

    return data;
};

console.log("✅ Network Spy is active! Go ahead and search.");
console.log("👉 When finished scrolling, run: window.isSpyActive = false;");
