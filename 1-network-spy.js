// --- 🕵️ NETWORK SPY SCRIPT ---

// 1. Create a global box to store our stolen hotels
window.allCapturedHotels = [];

// 2. Save the original JSON parser so we don't break the website
const originalJsonParse = JSON.parse;

// 3. Overwrite the browser's parser with our "Spy"
JSON.parse = function(jsonString) {
    // A. Let the website do its normal parsing job first
    const data = originalJsonParse.apply(this, arguments);

    // B. Secretly check if this data looks like a Hotel Response
    // We look for the "accommodations" array inside "results"
    try {
        if (data && data.results && Array.isArray(data.results.accommodations)) {
            // BINGO! We found hotels. Add them to our list.
            window.allCapturedHotels.push(...data.results.accommodations);
            
            // Tell us about it in the console
            console.log(`🕵️ Spy: Captured ${data.results.accommodations.length} new hotels! (Total: ${window.allCapturedHotels.length})`);
        }
    } catch (err) {
        // If our spy logic fails, do nothing, so the website keeps working
    }

    // C. Return the data to the website so it can display the hotels
    return data;
};

console.log("✅ Network Spy is active! Search and start scrolling now...");
