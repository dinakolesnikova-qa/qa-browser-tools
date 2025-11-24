// 😈 SABOTAGE SCRIPT (BREAK THE DATA)
// ==========================================

// Check if we have data to break
if (!window.allCapturedHotels || window.allCapturedHotels.length === 0) {
    throw new Error("❌ No hotels found! Run the Network Spy first.");
}

console.log(`Original count: ${window.allCapturedHotels.length} hotels.`);

// --- 1. CREATE A DUPLICATE (Breaks Duplicate Check) ---
// We take the first hotel and add a clone of it to the end of the list.
const firstHotel = window.allCapturedHotels[0];
window.allCapturedHotels.push(firstHotel);
console.log(`😈 Sabotage 1: Added duplicate of "${firstHotel.name}"`);


// --- 2. BREAK SORTING (Breaks Zone 1 -> Zone 2 order) ---
// We create a fake Zone 1 hotel and put it at the VERY END of the list.
// Since the list likely ends with Zone 2 hotels, putting a Zone 1 after them breaks the logic.
const badSortHotel = JSON.parse(JSON.stringify(firstHotel)); // Deep copy
badSortHotel.id = "FAKE_SORT_ID";
badSortHotel.name = "⚠️ FAKE BAD SORT HOTEL";
badSortHotel.proximityInfo.areaLevel = 1; // Force it to be Zone 1
// Keep it within radius so it doesn't trigger the radius error
badSortHotel.address.coordinates.latitude = 51.50746; 
badSortHotel.address.coordinates.longitude = -0.127673;

window.allCapturedHotels.push(badSortHotel);
console.log(`😈 Sabotage 2: Added a Zone 1 hotel at the end of the list (after Zone 2s).`);


// --- 3. BREAK RADIUS (Breaks 30km Limit) ---
// We create a hotel located at 0,0 coordinates (Middle of the ocean/Africa)
const farHotel = JSON.parse(JSON.stringify(firstHotel)); // Deep copy
farHotel.id = "FAKE_AFRICA_ID";
farHotel.name = "⚠️ FAKE HOTEL IN AFRICA";
farHotel.address.coordinates.latitude = 0;
farHotel.address.coordinates.longitude = 0;
farHotel.proximityInfo.areaLevel = 2; // Force Zone 2 to not mess up sorting

window.allCapturedHotels.push(farHotel);
console.log(`😈 Sabotage 3: Added a hotel at 0,0 coordinates (thousands of km away).`);

console.log(`\n📉 New count: ${window.allCapturedHotels.length} hotels. Ready for validation!`);
