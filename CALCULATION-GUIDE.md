# Finance Dashboard — Calculation Logic Reference

Ye document teeno files (`index.html`, `transactions.html`, `cashflow.html`) ke
**saare calculation/formula parts** ko ek jagah list karta hai — file, function
name aur (approx.) line number ke saath — taaki future mein koi bhi formula
change karna ho to seedha sahi jagah jaake edit kiya ja sake.

> 💡 Tip: Har file mein `Ctrl+F` se function ka naam search kar lo, seedha wahin
> pahunch jaoge.

---

## 📁 FILE 1: `index.html` — Main Dashboard

### A. Raw Excel data se numbers banana → `buildDataFromWorkbook(wb)`
Ye sabse important function hai — Excel ki **Transactions** sheet padh ke
saare KPIs/charts ke liye base data taiyaar karta hai.

Har transaction row ke liye, `type` column ke hisaab se:

```js
if (typeNorm === 'income')     { yd.income += amt;     balanceTotal += amt; }
else if (typeNorm === 'expense')    { yd.expense += amt;    balanceTotal -= amt; }
else if (typeNorm === 'investment') { yd.investment += amt; balanceTotal -= amt; }
```

**Kahan change karna hai agar...**
| Kya change karna hai | Kahan |
|---|---|
| Balance calculate karne ka tarika (kaunsa type add/subtract ho) | `buildDataFromWorkbook()` — upar wala if/else block |
| Naya transaction type add karna ho (e.g. "Loan") | Same block mein naya `else if` add karo + `ensureYear()` mein naya bucket |

### B. Category totals (Expense add, Income/Investment subtract)
```js
const catAmt = (typeNorm === 'expense') ? amt : -amt;
```
- "Salary" aur "Other Income" categories `EXCLUDED_CATS` list mein hain — ye
  category charts mein kabhi nahi dikhtin.
- Change karna ho: `buildDataFromWorkbook()` ke andar `EXCLUDED_CATS` array
  aur `catAmt` wali line.

### C. Monthly breakdown
Har row apne month-index (0-11) ke hisaab se `monthly_income` /
`monthly_expense` / `monthly_investment` arrays mein add hoti hai — same
function ke andar.

### D. Main KPI formulas → `render(year)` function
```js
const net  = y.income - y.expense - y.investment;      // Net Savings
const rate = y.income ? net / y.income : 0;             // Savings Rate
const ratio = y.income ? y.expense / y.income : 0;       // Expense-to-Income gauge
```
**Kahan change karna hai:** `render()` function ke shuru mein, jahan
`kSavings`, `kRate`, `gaugeNum` set ho rahe hain.

### E. YoY (Year-over-Year) delta/growth %
```js
const change = prev !== 0 ? (cur - prev) / Math.abs(prev) : 0;
```
Function: `delta(elId, cur, prev)` — `render()` ke andar hi define hai.
Income/Expense/Investment/Savings — chaaron isi function se calculate hote hain.

### F. "All Years" (ALL) view ka aggregation
Function: `getViewData(sel)` (line ~369) — jab dropdown mein "All Years"
select karte ho, tab ye har saal ka data sum karke ek combined object banata
hai. Agar ALL-years view ka formula alag chahiye to yahin change karo.

### G. Year-wise summary table + Grand Total row
`render()` function ke end mein (`yearTableBody` wala part):
```js
const n = d.income - d.expense - d.investment;   // per-year Net
```
aur last mein ek reduce() se **Total (Gross)** row banti hai — sabhi saalon
ka sum.

### H. "Balance in A/C" KPI
Ye Year selector se independent hai — hamesha `DATA.balance` (poore
all-time balanceTotal) dikhata hai:
```js
document.getElementById('kBalance').textContent = fmtINR(DATA.balance || 0);
```

---

## 📁 FILE 2: `transactions.html` — All Transactions page

### Summary cards → `renderSummary()`
```js
// Expense + Investment dono "paisa bahar gaya" (Given) maana jaata hai
const given = sum of (Expense + Investment amounts)
const received = sum of (Income amounts)
const net = received - given
```
**Kahan change karna hai:** `renderSummary()` function — agar Investment ko
"given" na maankar alag rakhna ho, to yahan ka condition badlo.

### Table ke neeche wala running "Net" total → `renderPage()`
```js
const netTotal = sum of (Expense/Investment = negative, Income = positive)
```
Same logic, dusri jagah use hota hai (filtered rows ke liye).

### Filters (year/month/type/category/search) → `applyFilters()`
Ye sirf filtering hai, calculation nahi — lekin agar naya filter add karna ho
to yahin add hoga.

---

## 📁 FILE 3: `cashflow.html` — Lender Ledger

### KPI cards → `renderKPIs()`
```js
Given    = sum of amount where type === 'Given'
Received = sum of amount where type === 'Received'
Net Balance = Given - Received
```
Ye alag hi Excel sheet ("Cashflow") se aata hai — Transactions sheet se koi
lena-dena nahi. Iska raw parsing `index.html` ke andar
`parseCashflowSheet(wb)` function mein hota hai (data yahin se generate hoke
`data.js` / `data.json` mein save hota hai).

### Table ke neeche "Net" total → `renderPage()`
Same formula, filtered rows ke liye.

---

## 🔑 Quick Cheat-Sheet — "Mujhe X change karna hai, kahan jaaun?"

| Change karna hai | File | Function |
|---|---|---|
| Balance kaise calculate ho (kaunsa type +/-) | index.html | `buildDataFromWorkbook()` |
| Net Savings ka formula | index.html | `render()` |
| Savings Rate % | index.html | `render()` |
| Category chart mein kaun-si categories exclude hon | index.html | `buildDataFromWorkbook()` → `EXCLUDED_CATS` |
| Expense/Investment "paisa bahar" maana jaaye ya nahi | transactions.html | `renderSummary()`, `renderPage()` |
| Lender-wise Given/Received/Net | cashflow.html | `renderKPIs()` |
| Cashflow sheet se data kaise parse ho | index.html | `parseCashflowSheet()` |
| YoY growth % ka formula | index.html | `delta()` (inside `render()`) |
| "All Years" view ka total kaise bane | index.html | `getViewData('ALL')` |

---

### ⚠️ Ek important baat
Actual numbers **Excel workbook se `buildDataFromWorkbook()` (index.html)**
mein hi calculate hote hain, aur phir `data.json` / `data.js` mein save ho
jaate hain. `transactions.html` aur `cashflow.html` sirf us already-calculated
data ko **read/filter/display** karte hain — wahan naye totals sirf filtered
subset ke liye bante hain (jaise summary cards), raw Excel data wahan nahi
padha jaata.

Isliye: agar **core calculation logic** (balance, category rule, income/expense
type) change karna hai → hamesha **`index.html`** mein jaake
`buildDataFromWorkbook()` edit karo, aur phir Excel wapas load/push karo taaki
`data.js`/`data.json` refresh ho jaaye.
