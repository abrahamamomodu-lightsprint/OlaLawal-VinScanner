const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('primaryNav');
navToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

const vinInput = document.getElementById('vinInput');
const ocrFill = document.getElementById('ocrFill');
const decodeBtn = document.getElementById('decodeBtn');
const vinState = document.getElementById('vinState');
const vinTruth = document.getElementById('vinTruth');

const decodeFromNhtsa = async (vin) => {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const getVal = (name) => data.Results.find((r) => r.Variable === name)?.Value || 'Unknown';
  const make = getVal('Make');
  const model = getVal('Model');
  const year = getVal('Model Year');
  const bodyClass = getVal('Body Class');
  const series = getVal('Series');
  const plant = getVal('Plant Country');
  const note = getVal('Note');

  const accidental = /salvage|collision|rebuilt|total loss/i.test(String(note)) ? 'Likely reported accident history' : 'No accident clue in this VIN decode payload';
  return { make, model, year, bodyClass, series, plant, accidental };
};

ocrFill.addEventListener('click', () => {
  vinInput.value = '1HGCM82633A004352';
  vinState.textContent = 'OCR demo filled sample VIN.';
});

decodeBtn.addEventListener('click', async () => {
  const vin = vinInput.value.trim().toUpperCase();
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    vinState.textContent = 'VIN must be exactly 17 chars (excluding I, O, Q).';
    vinTruth.textContent = '';
    return;
  }
  vinState.textContent = 'Decoding VIN with NHTSA...';
  try {
    const r = await decodeFromNhtsa(vin);
    vinState.textContent = 'VIN decoded successfully.';
    vinTruth.textContent = `VIN Truth\n- Vehicle: ${r.year} ${r.make} ${r.model}\n- Body: ${r.bodyClass} (${r.series})\n- Plant region: ${r.plant}\n- Accident signal: ${r.accidental}\n- Total body detail: ${r.bodyClass}`;
  } catch (err) {
    vinState.textContent = 'VIN decode failed. Try again.';
    vinTruth.textContent = `Error: ${err.message}`;
  }
});

const quizForm = document.getElementById('quizForm');
const quizResult = document.getElementById('quizResult');
quizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(quizForm);
  const use = fd.get('use');
  const budget = fd.get('budget');
  const fuel = fd.get('fuel');

  let rec = 'Compact crossover';
  if (use === 'family') rec = '3-row SUV';
  if (use === 'adventure') rec = 'AWD wagon/SUV';
  if (budget === 'low') rec = `Certified pre-owned ${rec}`;
  if (budget === 'high' && fuel === 'power') rec = `Performance-oriented ${rec}`;
  if (fuel === 'economy') rec = `Hybrid ${rec}`;

  quizResult.textContent = `AI Assistant: Based on your profile, target a ${rec} with complete service records and verified VIN history.`;
});

const calcBtn = document.getElementById('calcBtn');
const calcOut = document.getElementById('calcOut');
calcBtn.addEventListener('click', () => {
  const miles = Number(document.getElementById('miles').value);
  const fuelPrice = Number(document.getElementById('fuelPrice').value);
  const mpg = Number(document.getElementById('mpg').value);
  const price = Number(document.getElementById('price').value);
  const tax = Number(document.getElementById('tax').value) / 100;
  const fees = Number(document.getElementById('fees').value);

  const fuelCostPerMile = fuelPrice / mpg;
  const outDoor = price + (price * tax) + fees;
  calcOut.textContent = `Fuel cost/mile: $${fuelCostPerMile.toFixed(3)} | Out-the-door estimate: $${outDoor.toFixed(2)}`;
});

const tooltip = document.getElementById('tooltip');
document.querySelectorAll('.term').forEach((t) => {
  t.addEventListener('mouseenter', () => { tooltip.textContent = `${t.textContent}: ${t.dataset.tip}`; });
  t.addEventListener('mouseleave', () => { tooltip.textContent = 'Tip: hover a term to learn more.'; });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}
