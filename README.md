
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
