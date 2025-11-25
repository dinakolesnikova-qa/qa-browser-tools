/**
 * 📉 TEST: DEFAULT SORTING (By Score)
 * Checks if hotels are sorted by 'score' in Descending order (Highest first).
 * OUTPUT: Prints a full table of all hotels and their scores.
 */

// --- STEP 1: CONNECT TO SPY ---
const allHotels = window.allCapturedHotels || [];

if (allHotels.length === 0) {
    console.error("❌ No hotels found! Did you run '1-network-spy.js' and scroll down first?");
} else {
    console.log(`📊 Analyzing Score Sorting for ${allHotels.length} hotels...`);

    // --- STEP 2: EXTRACT SCORES ---
    // We map the data into a clean format for the table
    const tableData = allHotels.map((hotel, index) => {
        // Safety check: handle cases where scores might be missing
        const scoreVal = (hotel.scores && hotel.scores[0]) ? hotel.scores[0].score : 0;
        
        return {
            "Rank": index + 1,           // 1, 2, 3...
            "Hotel Name": hotel.name,    // "Dorsett Shepherds Bush"
            "Score": scoreVal            // 99000002.0515
        };
    });

    // --- STEP 3: VERIFY DESCENDING ORDER ---
    // Logic: Previous Score must be >= Current Score
    
    let isSorted = true;
    let failureDetails = null;

    for (let i = 1; i < tableData.length; i++) {
        const prev = tableData[i - 1];
        const curr = tableData[i];

        // CHECK: If Previous is SMALLER than Current, the order is broken.
        if (prev["Score"] < curr["Score"]) {
            isSorted = false;
            failureDetails = {
                index: i,
                goodHotel: prev,
                badHotel: curr
            };
            // We don't break here because we want to see the full table anyway
            break; 
        }
    }

    // --- STEP 4: REPORT (FULL LIST) ---
    console.log("\n------ 📉 SCORE SORTING REPORT (Full List) ------");
    
    if (isSorted) {
        console.log(`%c✅ PASS: All ${tableData.length} hotels are sorted by Score (High -> Low).`, "color: green; font-weight: bold; font-size: 14px");
    } else {
        console.error(`🚨 FAIL: Sorting broken around Rank #${failureDetails.badHotel["Rank"]}!`);
        console.log(`(See the table below to find the red flag)`);
    }

    // THIS PRINTS THE FULL LIST YOU ASKED FOR
    console.table(tableData);
}
