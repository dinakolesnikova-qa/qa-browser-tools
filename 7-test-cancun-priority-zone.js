/**
 * 🎯 TEST: PRIORITY ZONE VALIDATOR (With Real Index)
 * Verifies that hotels inside "Cancun Hotel Zone" are FIRST.
 * OUTPUT: Full table with Real Array Index (0-based).
 */

// ==========================================
// 📝 CONFIGURATION
// ==========================================

const ZONE_NAME = "Cancun Hotel Zone";
const EXPECTED_ZONE_ID = "692619dc0fbb1306ce079500"; 

const ZONE_POLYGON = [
    [-86.828232, 21.130976], [-86.822105, 21.144357], [-86.819863, 21.174878],
    [-86.806864, 21.178768], [-86.721974, 21.135698], [-86.773598, 21.021549],
    [-86.801062, 21.032002], [-86.785253, 21.111842], [-86.828232, 21.130976]
];

// ==========================================


// --- STEP 1: CONNECT TO SPY ---
const allHotels = window.allCapturedHotels || [];

if (allHotels.length === 0) {
    console.error("❌ No hotels found! Run '1-network-spy.js' and scroll down.");
} else {
    console.log(`🎯 Starting Analysis for '${ZONE_NAME}'...`);

    // --- MATH: RAY CASTING ALGORITHM ---
    function isPointInPolygon(latitude, longitude, polygon) {
        let x = longitude, y = latitude;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            let xi = polygon[i][0], yi = polygon[i][1];
            let xj = polygon[j][0], yj = polygon[j][1];
            let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // --- ANALYSIS ---
    const analyzedHotels = allHotels.map((hotel, index) => {
        const hLat = hotel.address?.coordinates?.latitude;
        const hLon = hotel.address?.coordinates?.longitude;
        const actualId = hotel.leisureSearchPriorityZoneId;
        
        let isGeoMatch = false; 
        if (hLat && hLon) {
            isGeoMatch = isPointInPolygon(hLat, hLon, ZONE_POLYGON);
        }

        return {
            realIndex: index, // 0, 1, 2... (Как в массиве)
            name: hotel.name,
            id: hotel.id,
            zoneId: actualId,
            lat: hLat,
            lon: hLon,
            isPriority: (actualId === EXPECTED_ZONE_ID) || isGeoMatch,
            debugGeo: isGeoMatch ? "Inside" : "Outside"
        };
    });

    // --- VERIFICATION LOGIC ---
    let sortingBugFound = false;
    let bugDetails = null;
    let firstNonPriorityIndex = -1;
    const priorityHotels = analyzedHotels.filter(h => h.isPriority);

    for (let i = 0; i < analyzedHotels.length; i++) {
        const current = analyzedHotels[i];
        if (current.isPriority) {
            if (firstNonPriorityIndex !== -1) {
                sortingBugFound = true;
                bugDetails = { badIndex: current.realIndex, hotelName: current.name, firstNonPriorityIndex: firstNonPriorityIndex };
                break;
            }
        } else {
            if (firstNonPriorityIndex === -1) firstNonPriorityIndex = current.realIndex;
        }
    }

    // --- REPORT ---
    console.log(`\n------ 🗺️ PRIORITY ZONE REPORT: ${ZONE_NAME} ------`);
    
    if (sortingBugFound) {
        console.error(`🚨 FAIL: Priority Sorting is Broken!`);
        console.log(`Hotel "${bugDetails.hotelName}" is INSIDE the zone but appears at Index #${bugDetails.badIndex}.`);
    } else {
        console.log(`%c✅ PASS: All ${priorityHotels.length} priority hotels are at the top!`, "color: green; font-weight: bold; font-size: 14px");
    }

    // --- DETAILED TABLE (Real Index) ---
    console.log(`\n📋 FULL LIST OF PRIORITY HOTELS (${priorityHotels.length} items):`);
    console.table(priorityHotels.map(h => ({
        "Index": h.realIndex, // 0, 1, 2...
        "Name": h.name,
        "Is Priority?": h.isPriority ? "✅ YES" : "❌ NO",
        "Geo Check": h.debugGeo,
        "Lat": h.lat,
        "Lon": h.lon,
        "Zone ID": h.zoneId
    })));
}
