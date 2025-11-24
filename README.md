
# QA Browser Tools 🛠️

Collection of JS scripts to validate Hotel Search results in Chrome Console.

## How to use

### Step 1: Capture Data 🕵️
1. Open `1-network-spy.js`.
2. Copy code and paste into Console BEFORE searching.
3. Search and scroll down to load all hotels.

### Step 2: Validate ✅

**If testing Location with Boundaries (Zone 1 + Zone 2):**
* Use `2-test-boundaries.js`.
* Updates `centerLat` / `centerLon` inside the script.
* Checks: Sorting order, 30km Radius, Duplicates.

**If testing Location without Boundaries (Radius Only):**
* Use `3-test-radius-only.js`.
* Updates `centerLat` / `centerLon` inside the script.
* Checks: 30km Radius, Duplicates.

---

## 🧪 Verification (Sabotage Mode)

Use these scripts to intentionally **break the data** in the browser memory. This ensures that the tools are correctly identifying bugs (Negative Testing).

### 1. Verify "Boundaries Flow" (Zone 1 + Zone 2)
* **Goal:** Ensure `2-test-boundaries.js` catches bugs.
* **Steps:**
  1. Run `1-network-spy.js` and load hotels.
  2. Run `validate-2-test-boundaries.js` (Injects duplicates, breaks sorting).
  3. Run `2-test-boundaries.js`.
  4. Here is exactly what you should see if the code works:
SORTING REPORT:
Result: ❌ FAIL: Sorting order is broken!
Why: Because we put a Zone 1 hotel at the very end of the list.
RADIUS REPORT:
Result: 🚨 FAIL: Found 1 hotels outside 30km!
Table: Should show "⚠️ FAKE HOTEL IN AFRICA" with a distance of ~5,000+ km.
DUPLICATE REPORT:
Result: 🚨 FAIL: Found 1 duplicate hotels!
Table: Should show the name of the hotel we copied.
If you see all 3 RED failures, your test script is perfect.

  5: The Cleanup Script 😇
Once you are satisfied that the test works, run this to remove the bad data so you can continue working without refreshing the page.
JavaScript
** 5.  🧪  The Cleanup**
// We added 3 fake items, so we remove the last 3.
window.allCapturedHotels.pop(); // Removes Far Hotel
window.allCapturedHotels.pop(); // Removes Bad Sort Hotel
window.allCapturedHotels.pop(); // Removes Duplicate


### 2. Verify "Radius Only Flow" (No Boundaries)
* **Goal:** Ensure `3-test-radius-only.js` catches bugs.
* **Steps:**
  1. Run `1-network-spy.js` and load hotels.
  2. Run `validate-3-test-radius-only.js` (Injects far-away hotel & duplicate).
  3. Run `3-test-radius-only.js`.
  4. **Result:** Expected Results (If the script is correct):
     
SORTING CHECK:
Result: ❌ FAIL: Sorting order is broken!
Why: Because we added a Zone 1 hotel at the very end.
RADIUS CHECK:
Result: 🚨 FAIL: Found 1 hotels outside 30km!
Table: Should show "⚠️ FAKE HOTEL IN AFRICA".
DUPLICATE CHECK:
Result: 🚨 FAIL: Found 1 duplicate hotels!
Table: Should show the name of the first hotel in your list.
If you see all 3 RED failures, your code is perfect.

  **5.  🧪  The Cleanup**
Once you have verified the script works, run this to remove the fake data so you can continue working.
JavaScript
// ==========================================
// 😇 CLEANUP SCRIPT (UNDO SABOTAGE)
// ==========================================

// We added 3 fake items, so we remove the last 3.
window.allCapturedHotels.pop(); // Removes Far Hotel
window.allCapturedHotels.pop(); // Removes Bad Sort Hotel
window.allCapturedHotels.pop(); // Removes Duplicate

console.log("✅ Cleanup complete. Data is clean again.");




> **Note:** After running a verification test, refresh the page to clear the "fake" data.
