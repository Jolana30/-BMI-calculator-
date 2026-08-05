document.addEventListener('DOMContentLoaded', () => {
  let unitSystem = 'metric';
  let gender = 'male';
  let historyData = [];
  let trendChart = null;

  const btnMetric = document.getElementById('btnMetric');
  const btnImperial = document.getElementById('btnImperial');
  const heightUnitLabel = document.getElementById('heightUnitLabel');
  const weightUnitLabel = document.getElementById('weightUnitLabel');
  
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const ageInput = document.getElementById('age');
  const activitySelect = document.getElementById('activity');
  const btnMale = document.getElementById('btnMale');
  const btnFemale = document.getElementById('btnFemale');
  const bmiForm = document.getElementById('bmiForm');

  const bmiValueEl = document.getElementById('bmiValue');
  const bmiCategoryEl = document.getElementById('bmiCategory');
  const gaugeNeedle = document.getElementById('gaugeNeedle');
  const idealWeightEl = document.getElementById('idealWeight');
  const bmrValueEl = document.getElementById('bmrValue');
  const tdeeValueEl = document.getElementById('tdeeValue');
  const waterValueEl = document.getElementById('waterValue');

  const historyListEl = document.getElementById('historyList');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnClearHistory = document.getElementById('btnClearHistory');

  initHistory();
  initChart();
  calculateAndRender();

  btnMetric.addEventListener('click', () => setUnitSystem('metric'));
  btnImperial.addEventListener('click', () => setUnitSystem('imperial'));

  btnMale.addEventListener('click', () => setGender('male'));
  btnFemale.addEventListener('click', () => setGender('female'));

  bmiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateAndRender(true);
  });

  if (btnExportCSV) btnExportCSV.addEventListener('click', exportCSV);
  if (btnClearHistory) btnClearHistory.addEventListener('click', clearHistory);

  function setUnitSystem(system) {
    if (unitSystem === system) return;
    unitSystem = system;

    if (system === 'metric') {
      btnMetric.classList.add('active');
      btnImperial.classList.remove('active');
      heightUnitLabel.textContent = 'cm';
      weightUnitLabel.textContent = 'kg';
      
      if (heightInput.value) heightInput.value = Math.round(parseFloat(heightInput.value) * 2.54);
      if (weightInput.value) weightInput.value = (parseFloat(weightInput.value) * 0.453592).toFixed(1);
    } else {
      btnImperial.classList.add('active');
      btnMetric.classList.remove('active');
      heightUnitLabel.textContent = 'in';
      weightUnitLabel.textContent = 'lbs';

      if (heightInput.value) heightInput.value = Math.round(parseFloat(heightInput.value) / 2.54);
      if (weightInput.value) weightInput.value = (parseFloat(weightInput.value) / 0.453592).toFixed(1);
    }
    calculateAndRender();
  }

  function setGender(g) {
    gender = g;
    if (g === 'male') {
      btnMale.classList.add('active');
      btnFemale.classList.remove('active');
    } else {
      btnFemale.classList.add('active');
      btnMale.classList.remove('active');
    }
    calculateAndRender();
  }

  function calculateAndRender(saveToHistory = false) {
    const rawHeight = parseFloat(heightInput.value);
    const rawWeight = parseFloat(weightInput.value);
    const age = parseInt(ageInput.value) || 25;
    const activityMultiplier = parseFloat(activitySelect.value) || 1.375;

    if (!rawHeight || !rawWeight || rawHeight <= 0 || rawWeight <= 0) return;

    let heightCm = unitSystem === 'metric' ? rawHeight : rawHeight * 2.54;
    let weightKg = unitSystem === 'metric' ? rawWeight : rawWeight * 0.453592;

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    let category = '';
    let badgeClass = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      badgeClass = 'badge-underweight';
    } else if (bmi < 25.0) {
      category = 'Normal Weight';
      badgeClass = 'badge-normal';
    } else if (bmi < 30.0) {
      category = 'Overweight';
      badgeClass = 'badge-overweight';
    } else {
      category = 'Obese';
      badgeClass = 'badge-obese';
    }

    bmiValueEl.textContent = bmi.toFixed(1);
    bmiCategoryEl.textContent = category;
    bmiCategoryEl.className = `badge ${badgeClass}`;

    let gaugePercent = ((bmi - 15) / (35 - 15)) * 100;
    if (gaugePercent < 0) gaugePercent = 0;
    if (gaugePercent > 100) gaugePercent = 100;
    gaugeNeedle.style.left = `${gaugePercent}%`;

    const minIdealKg = 18.5 * (heightM * heightM);
    const maxIdealKg = 24.9 * (heightM * heightM);

    if (unitSystem === 'metric') {
      idealWeightEl.textContent = `${minIdealKg.toFixed(1)} - ${maxIdealKg.toFixed(1)} kg`;
    } else {
      const minIdealLbs = minIdealKg / 0.453592;
      const maxIdealLbs = maxIdealKg / 0.453592;
      idealWeightEl.textContent = `${minIdealLbs.toFixed(1)} - ${maxIdealLbs.toFixed(1)} lbs`;
    }

    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;
    bmrValueEl.textContent = `${Math.round(bmr)} kcal`;

    const tdee = bmr * activityMultiplier;
    tdeeValueEl.textContent = `${Math.round(tdee)} kcal`;

    const waterLiters = (weightKg * 0.035).toFixed(1);
    waterValueEl.textContent = `${waterLiters} L/day`;

    if (saveToHistory) {
      const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now(),
        weight: unitSystem === 'metric' ? `${weightKg.toFixed(1)} kg` : `${(weightKg / 0.453592).toFixed(1)} lbs`,
        weightKg: weightKg,
        bmi: bmi.toFixed(1),
        category: category
      };
      historyData.unshift(entry);
      saveHistoryData();
      renderHistory();
      updateChart();
    }
  }

  function initHistory() {
    const stored = localStorage.getItem('vitalfit_bmi_history');
    if (stored) {
      try {
        historyData = JSON.parse(stored);
      } catch (e) {
        historyData = [];
      }
    }

    if (!historyData || historyData.length === 0) {
      historyData = [
        { id: 1, date: 'Jul 29, 2024', timestamp: 1722262193000, weight: '88.5 kg', weightKg: 88.5, bmi: '28.9', category: 'Overweight' },
        { id: 2, date: 'Nov 12, 2024', timestamp: 1731415200000, weight: '85.2 kg', weightKg: 85.2, bmi: '27.8', category: 'Overweight' },
        { id: 3, date: 'Mar 05, 2025', timestamp: 1741178400000, weight: '81.0 kg', weightKg: 81.0, bmi: '26.4', category: 'Overweight' },
        { id: 4, date: 'Oct 18, 2025', timestamp: 1760791200000, weight: '76.4 kg', weightKg: 76.4, bmi: '24.9', category: 'Normal Weight' },
        { id: 5, date: 'Aug 05, 2026', timestamp: 1785933600000, weight: '74.2 kg', weightKg: 74.2, bmi: '24.2', category: 'Normal Weight' }
      ];
      saveHistoryData();
    }
    renderHistory();
  }

  function saveHistoryData() {
    localStorage.setItem('vitalfit_bmi_history', JSON.stringify(historyData));
  }

  function renderHistory() {
    if (!historyListEl) return;
    historyListEl.innerHTML = '';

    if (historyData.length === 0) {
      historyListEl.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 1rem;">No history records yet.</p>';
      return;
    }

    historyData.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div>
          <div class="history-date">${item.date}</div>
          <div class="history-weight">${item.weight}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="history-bmi">${item.bmi} BMI</div>
          <button class="delete-btn" data-id="${item.id}" title="Delete Record">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;
      historyListEl.appendChild(div);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        historyData = historyData.filter(h => h.id !== id);
        saveHistoryData();
        renderHistory();
        updateChart();
      });
    });
  }

  function clearHistory() {
    if (confirm('Clear all recorded health history?')) {
      historyData = [];
      saveHistoryData();
      renderHistory();
      updateChart();
    }
  }

  function exportCSV() {
    if (historyData.length === 0) {
      alert('No history records to export.');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,Date,Weight,BMI,Category\n';
    historyData.forEach(r => {
      csvContent += `"${r.date}","${r.weight}","${r.bmi}","${r.category}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'VitalFit_BMI_History.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function initChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    const sorted = [...historyData].reverse();
    const labels = sorted.map(d => d.date);
    const bmiValues = sorted.map(d => parseFloat(d.bmi));

    trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'BMI Trend Over Time',
          data: bmiValues,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#06b6d4',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { size: 11 } }
          }
        }
      }
    });
  }

  function updateChart() {
    if (!trendChart) return;
    const sorted = [...historyData].reverse();
    trendChart.data.labels = sorted.map(d => d.date);
    trendChart.data.datasets[0].data = sorted.map(d => parseFloat(d.bmi));
    trendChart.update();
  }
});
