// --- 😈 SABOTAGE SCRIPT ---

// Check if data exists
if (!window.allCapturedHotels || window.allCapturedHotels.length === 0) {
    throw new Error("No hotels loaded! Run the Spy Script first.");
}

// 1. CREATE A DUPLICATE (Breaks Duplicate Check)
// We take the first hotel and add a copy to the end of the list.
const firstHotel = window.allCapturedHotels[0];
window.allCapturedHotels.push(firstHotel);
console.log(`😈 Sabotage 1: Added duplicate of "${firstHotel.name}"`);

// 2. BREAK SORTING (Breaks Zone 1 -> Zone 2 order)
// If the first hotel was Zone 1, adding it to the very end (after Zone 2s) 
// will make the list look like: 1, 1, ... 2, 2, 1. 
// The drop from 2 to 1 will trigger the Sorting Error.
console.log(`😈 Sabotage 2: Moves a Zone ${firstHotel.proximityInfo.areaLevel} hotel to the end of the list.`);

// 3. CREATE A FAR HOTEL (Breaks Radius Check)
// We make a copy and teleport it to the Equator (0,0)
const farHotel = JSON.parse(JSON.stringify(firstHotel));
farHotel.id = "FAKE_AFRICA_HOTEL";
farHotel.name = "⚠️ FAKE HOTEL IN AFRICA";
farHotel.address.coordinates.latitude = 0;
farHotel.address.coordinates.longitude = 0;
// Force Zone 2 so it doesn't mess up sorting check further
farHotel.proximityInfo.areaLevel = 2; 

window.allCapturedHotels.push(farHotel);
console.log(`😈 Sabotage 3: Added a hotel at 0,0 coordinates.`);
