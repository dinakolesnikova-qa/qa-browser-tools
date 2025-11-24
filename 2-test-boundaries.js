// 🕵️ ULTIMATE VALIDATOR (Sorting + Radius + Duplicates)
// ======================================================

// --- CONFIGURATION: PASTE YOUR COORDINATES HERE ---
const centerLat = 51.50746;
const centerLon = -0.127673;

console.log(`📍 Starting Analysis. Center: ${centerLat}, ${centerLon}`);


// --- STEP 1: CONNECT TO THE SPY ---
const allHotels = window.allCapturedHotels || [];

if (allHotels.length === 0) {
    console.error("❌ Error: No hotels found! Did you run the Spy Script and scroll down first?");
} else {
    console.log(`📊 Loaded ${allHotels.length} hotels from the Spy.`);

    // ============================
    // 🧠 LOGIC SECTION
    // ============================

    // --- 1. SORTING LOGIC ---
    const areaLevels = allHotels.map(hotel => hotel.proximityInfo.areaLevel);
    const hasZone1 = areaLevels.includes(1);
    const hasZone2 = areaLevels.includes(2);

    const isSorted = areaLevels.every((level, index, array) => {
        if (index === 0) return true;
        return level >= array[index - 1];
    });

    // --- 2. RADIUS LOGIC (MATH) ---
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; 
    }

    const badRadiusHotels = [];
    
    // NEW: Object to track the Furthest Hotel Name + Distance
    let furthestHotel = {
        name: "None",
        distance: 0
    };

    allHotels.forEach(hotel => {
        const hLat = hotel.address.coordinates.latitude;
        const hLon = hotel.address.coordinates.longitude;
        const dist = getDistance(centerLat, centerLon, hLat, hLon);
        
        // Update Furthest Hotel Info
        if (dist > furthestHotel.distance) {
            furthestHotel = {
                name: hotel.name,
                distance: dist
            };
        }

        // Check 30.1km limit
        if (dist > 30.1) {
            badRadiusHotels.push({
                id: hotel.id,
                name: hotel.name,
                realDistance: dist.toFixed(2) + " km"
            });
        }
    });

    // --- 3. DUPLICATE LOGIC ---
    const allIds = allHotels.map(h => h?.id);
    const uniqueIds = new Set(allIds);
    const duplicateCount = allIds.length - uniqueIds.size;


    // ============================
    // 📝 REPORT SECTION
    // ============================

    console.log("\n------ 📊 SORTING CHECK (Zone 1 -> Zone 2) ------");
    if (!isSorted) {
        console.error("❌ FAIL: Sorting order is broken! (Zone 1 must be before Zone 2)");
    } else if (hasZone1 && hasZone2) {
        console.log("✅ PASS: Perfect! Both zones found, sorting is correct.");
    } else if (hasZone2 && !hasZone1) {
        console.warn("⚠️ PASS (Radius Only): Sorting is correct, but found ONLY Zone 2.");
    } else if (hasZone1 && !hasZone2) {
        console.warn("⚠️ PASS (Polygon Only): Sorting is correct, but found ONLY Zone 1.");
    }

    console.log("\n------ 📏 RADIUS CHECK (Max 30km) ------");
    if (badRadiusHotels.length === 0) {
        console.log(`%c✅ PASS: All ${allHotels.length} hotels are inside the 30km radius.`, "color: green; font-weight: bold");
        // UPDATED LOG: Shows Name AND Distance
        console.log(`ℹ️ Furthest hotel is "${furthestHotel.name}" at ${furthestHotel.distance.toFixed(2)} km away.`);
    } else {
        console.error(`🚨 FAIL: Found ${badRadiusHotels.length} hotels outside 30km!`);
        console.table(badRadiusHotels);
    }

    console.log("\n------ 👯 DUPLICATE CHECK ------");
    if (duplicateCount === 0) {
        console.log(`%c✅ PASS: No duplicates found!`, "color: green; font-weight: bold");
    } else {
        console.error(`🚨 FAIL: Found ${duplicateCount} duplicate hotels!`);
        
        const seen = new Set();
        const duplicates = [];
        allHotels.forEach((hotel, index) => {
            if (seen.has(hotel.id)) {
                duplicates.push({id: hotel.id, name: hotel.name, position: index});
            } else {
                seen.add(hotel.id);
            }
        });
        console.table(duplicates);
    }
}
