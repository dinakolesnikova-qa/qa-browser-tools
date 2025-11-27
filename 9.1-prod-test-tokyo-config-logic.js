/**
 * 🇯🇵 TEST: TOKYO CONFIGURATION LOGIC (With Score)
 * Logic: "Lowest Priority Number wins" (1 > 2).
 * Output: Table + CSV with Score, Proximity Info, etc.
 */

// ==========================================
// 📝 CONFIGURATION
// ==========================================

const ZONES = [
    {
        name: "Greater Tokyo",
        id: "69289263818033be3500afc8", // Updated ID
        priority: 1, // High Priority (Winner)
        polygon: [[139.6971384688801,35.63065289209633],[139.728200478537,35.59791618940665],[139.8556578444647,35.58488334185081],[139.8487890553017,35.64068868993853],[139.8480920979912,35.67769008743585],[139.857296506435,35.69285571753716],[139.8574969285491,35.70452334873142],[139.82937148809,35.7312281628164],[139.8196643813785,35.74688987718261],[139.8080135733967,35.75856007085335],[139.7949099796945,35.75960433736065],[139.7720110236833,35.75785162779295],[139.7589532713952,35.76535676357075],[139.7176406372214,35.75820383786334],[139.6941125929551,35.73711265348722],[139.6758891968116,35.70044725830307],[139.6787616976647,35.65506556597344],[139.6971384688801,35.63065289209633]]
    },
    {
        name: "Shinjuku",
        id: "69289263818033be3500afc6", // Updated ID
        priority: 2, // Low Priority (Loser)
        polygon: [[139.6742951911626,35.7206869920934],[139.6796589084739,35.71751491155253],[139.6796439515206,35.71123586105774],[139.6934857619967,35.71090075395719],[139.6894830903509,35.70418677447945],[139.6824285939972,35.68863887444572],[139.6882499829713,35.68237121924612],[139.7053582263411,35.68619947771163],[139.713489017017,35.68188980218732],[139.7120250272752,35.67580880705012],[139.7196908598978,35.67365665857677],[139.7296207918473,35.6813862988467],[139.7315495130982,35.68917970346508],[139.7360021843602,35.6910644439217],[139.7452640803582,35.70264417270466],[139.7426949970612,35.70758932747187],[139.7050339908254,35.71509984637103],[139.706979593343,35.72149682826352],[139.7050593050204,35.72276516487442],[139.6960656080423,35.72204939002463],[139.6926811815192,35.72272472762583],[139.6841024780395,35.7228384056643],[139.6818069777958,35.72740851821494],[139.6762612914884,35.73003957160611],[139.6742951911626,35.7206869920934]]
    },
    {
        name: "Shibuya",
        id: "69289263818033be3500afc7", // Updated ID
        priority: 2, // Low Priority (Loser)
        polygon: [[139.6720244932245,35.6716092579873],[139.6724840029435,35.66863268598503],[139.6756594542828,35.66384992505856],[139.6883025951356,35.65986547615429],[139.7104654999363,35.64113806616708],[139.7189285562436,35.64097245222174],[139.7241858310884,35.64579491897488],[139.7232581810025,35.65602005922273],[139.7104708379446,35.66295950483679],[139.7199174051532,35.67134655481068],[139.7177058365082,35.67923598774834],[139.7060937980564,35.68740297495167],[139.6884487282414,35.68327206645285],[139.6857032055007,35.68579462965918],[139.6880531697949,35.6889951609424],[139.6861272456927,35.69108451696838],[139.6617393827268,35.67597355461587],[139.6618066685479,35.67145625673013],[139.6720244932245,35.6716092579873]]
    }
];

// ==========================================

// --- STEP 1: CONNECT TO SPY ---
const allHotels = window.allCapturedHotels || [];

if (allHotels.length === 0) {
    console.error("❌ No hotels found! Run '1-network-spy.js' first.");
} else {
    console.log(`🎯 Validating Configuration Logic for ${allHotels.length} hotels...`);

    // --- MATH: POINT IN POLYGON ---
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
    const tableData = allHotels.map((hotel, index) => {
        const hLat = hotel.address?.coordinates?.latitude;
        const hLon = hotel.address?.coordinates?.longitude;
        const actualZoneId = hotel.leisureSearchPriorityZoneId || "NULL";

        // Proximity Info (Zone 1/2 and Distance)
        const zoneLevel = hotel.proximityInfo?.areaLevel ?? "-";
        const distKm = hotel.proximityInfo?.distanceFromCenter?.km ?? "-";
        
        // NEW: SCORE EXTRACTION
        const scoreVal = (hotel.scores && hotel.scores[0]) ? hotel.scores[0].score : "-";

        // Coordinate String
        const coordString = (hLat && hLon) ? `${hLat}, ${hLon}` : "N/A";

        // 1. Find ALL zones this hotel geographically falls into
        const geoZones = [];
        if (hLat && hLon) {
            ZONES.forEach(zone => {
                if (isPointInPolygon(hLat, hLon, zone.polygon)) {
                    geoZones.push(zone);
                }
            });
        }

        // 2. Determine Expected Winner based on Config
        let expectedWinner = null;
        let status = "N/A";
        let winnerReason = "";

        if (geoZones.length > 0) {
            // SORT BY PRIORITY (Low number = High Priority)
            geoZones.sort((a, b) => a.priority - b.priority);
            expectedWinner = geoZones[0];

            // 3. Compare Actual vs Expected
            if (actualZoneId === expectedWinner.id) {
                status = "✅ PASS";
                winnerReason = `Matches P${expectedWinner.priority} (${expectedWinner.name})`;
            } else {
                status = "🚨 FAIL";
                winnerReason = `Expected P${expectedWinner.priority} (${expectedWinner.name})`;
            }
        } else {
            status = "⚪ OUTSIDE";
            winnerReason = "-";
        }

        return {
            "Index": index + 1,
            "Name": hotel.name,
            "Coordinates": coordString,
            "Zone (1/2)": zoneLevel,
            "Score": scoreVal, // NEW COLUMN
            "Km from Center": distKm,
            "Actual Zone ID": actualZoneId,
            "Status": status,
            "Logic Check": winnerReason
        };
    });

    // --- PRINT TABLE (Top 100) ---
    console.log("\n🇯🇵 CONFIGURATION LOGIC REPORT");
    console.table(tableData.slice(0, 100)); // Show preview

    // --- 📥 EXPORT TO CSV (FULL DATA) ---
    const headers = Object.keys(tableData[0]).join(",");
    const rows = tableData.map(obj => Object.values(obj).map(val => `"${val}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tokyo_config_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ Full Report downloaded as 'tokyo_config_report.csv'");
}
