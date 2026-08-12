document.addEventListener('DOMContentLoaded', () => {
  // ===== STATE =====
  let unitSystem = 'metric'; // 'metric' or 'imperial'
  let gender = 'male';

  // ===== DOM REFS =====
  const btnMale = document.getElementById('btnMale');
  const btnFemale = document.getElementById('btnFemale');
  const heightSlider = document.getElementById('heightSlider');
  const weightSlider = document.getElementById('weightSlider');
  const ageSlider = document.getElementById('ageSlider');
  const heightValueEl = document.getElementById('heightValue');
  const weightValueEl = document.getElementById('weightValue');
  const ageValueEl = document.getElementById('ageValue');
  const heightUnitEl = document.getElementById('heightUnit');
  const weightUnitEl = document.getElementById('weightUnit');
  const heightMaxLabel = document.getElementById('heightMaxLabel');
  const weightMaxLabel = document.getElementById('weightMaxLabel');
  const btnCalculate = document.getElementById('btnCalculate');
  const btnBack = document.getElementById('btnBack');
  const btnToggleUnits = document.getElementById('btnToggleUnits');
  const unitLabel = document.getElementById('unitLabel');

  const screenInput = document.getElementById('screenInput');
  const screenResults = document.getElementById('screenResults');

  const resultBMI = document.getElementById('resultBMI');
  const resultCategory = document.getElementById('resultCategory');
  const gaugeIndicator = document.getElementById('gaugeIndicator');
  const insightCard = document.getElementById('insightCard');
  const insightTitle = document.getElementById('insightTitle');
  const insightText = document.getElementById('insightText');
  const statIdealWeight = document.getElementById('statIdealWeight');
  const statBMR = document.getElementById('statBMR');
  const statTDEE = document.getElementById('statTDEE');
  const statWater = document.getElementById('statWater');

  const tabItems = document.querySelectorAll('.tab-item');

  // Legend items
  const legendItems = document.querySelectorAll('.legend-item');

  // ===== INIT =====
  updateSliderDisplays();
  updateSliderFills();

  // ===== EVENTS =====

  // Gender selection
  btnMale.addEventListener('click', () => setGender('male'));
  btnFemale.addEventListener('click', () => setGender('female'));

  // Sliders
  heightSlider.addEventListener('input', () => {
    heightValueEl.textContent = Math.round(parseFloat(heightSlider.value));
    updateSliderFill(heightSlider);
  });

  weightSlider.addEventListener('input', () => {
    const val = parseFloat(weightSlider.value);
    weightValueEl.textContent = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    updateSliderFill(weightSlider);
  });

  ageSlider.addEventListener('input', () => {
    ageValueEl.textContent = ageSlider.value;
    updateSliderFill(ageSlider);
  });

  // Calculate button
  btnCalculate.addEventListener('click', () => {
    calculateBMI();
    showScreen('screenResults');
  });

  // Back button
  btnBack.addEventListener('click', () => {
    showScreen('screenInput');
  });

  // Tab navigation
  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetScreen = tab.getAttribute('data-screen');
      if (targetScreen === 'screenResults') {
        calculateBMI();
      }
      showScreen(targetScreen);
    });
  });

  // Unit toggle
  btnToggleUnits.addEventListener('click', toggleUnits);

  // ===== FUNCTIONS =====

  function setGender(g) {
    gender = g;
    if (g === 'male') {
      btnMale.classList.add('active');
      btnFemale.classList.remove('active');
    } else {
      btnFemale.classList.add('active');
      btnMale.classList.remove('active');
    }
  }

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    tabItems.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-screen') === screenId);
    });
  }

  function toggleUnits() {
    const currentHeight = parseFloat(heightSlider.value);
    const currentWeight = parseFloat(weightSlider.value);

    if (unitSystem === 'metric') {
      unitSystem = 'imperial';
      unitLabel.textContent = 'lbs/in';
      heightUnitEl.textContent = 'in';
      weightUnitEl.textContent = 'lbs';

      // Convert slider ranges and values
      heightSlider.min = 39;
      heightSlider.max = 87;
      heightSlider.step = 1;
      heightSlider.value = Math.round(currentHeight / 2.54);

      weightSlider.min = 66;
      weightSlider.max = 440;
      weightSlider.step = 1;
      weightSlider.value = Math.round(currentWeight / 0.453592);

      heightMaxLabel.textContent = '87 in';
      weightMaxLabel.textContent = '440 lbs';
    } else {
      unitSystem = 'metric';
      unitLabel.textContent = 'kg/cm';
      heightUnitEl.textContent = 'cm';
      weightUnitEl.textContent = 'kg';

      heightSlider.min = 100;
      heightSlider.max = 220;
      heightSlider.step = 1;
      heightSlider.value = Math.round(currentHeight * 2.54);

      weightSlider.min = 30;
      weightSlider.max = 200;
      weightSlider.step = 0.5;
      weightSlider.value = (currentWeight * 0.453592).toFixed(1);

      heightMaxLabel.textContent = '220 cm';
      weightMaxLabel.textContent = '200 kg';
    }

    updateSliderDisplays();
    updateSliderFills();
  }

  function updateSliderDisplays() {
    heightValueEl.textContent = Math.round(parseFloat(heightSlider.value));
    const wv = parseFloat(weightSlider.value);
    weightValueEl.textContent = wv % 1 === 0 ? wv.toFixed(0) : wv.toFixed(1);
    ageValueEl.textContent = ageSlider.value;
  }

  function updateSliderFills() {
    updateSliderFill(heightSlider);
    updateSliderFill(weightSlider);
    updateSliderFill(ageSlider);
  }

  function updateSliderFill(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(90deg, #42B9E8 0%, #7DD3F5 ${pct}%, #E2EEF5 ${pct}%, #E2EEF5 100%)`;
  }

  function calculateBMI() {
    const rawHeight = parseFloat(heightSlider.value);
    const rawWeight = parseFloat(weightSlider.value);
    const age = parseInt(ageSlider.value);

    // Convert to metric for calculations
    const heightCm = unitSystem === 'metric' ? rawHeight : rawHeight * 2.54;
    const weightKg = unitSystem === 'metric' ? rawWeight : rawWeight * 0.453592;
    const heightM = heightCm / 100;

    const bmi = weightKg / (heightM * heightM);

    // Determine category
    let category, insightTitleText, insightTextContent, color, cardClass;

    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#5BC0EB';
      cardClass = 'underweight';
      insightTitleText = 'Underweight';
      insightTextContent = 'Your BMI suggests you may be underweight. Consider consulting a healthcare provider about nutrition and a balanced diet to reach a healthier weight.';
    } else if (bmi < 25) {
      category = 'Normal';
      color = '#4ECDC4';
      cardClass = '';
      insightTitleText = 'Healthy Weight';
      insightTextContent = "Your BMI indicates that you're within the healthy weight range and don't need to lose weight. Keep maintaining your balanced lifestyle!";
    } else if (bmi < 30) {
      category = 'Overweight';
      color = '#FFB347';
      cardClass = 'overweight';
      insightTitleText = 'Overweight';
      insightTextContent = 'Your BMI indicates you are slightly above the healthy range. Regular physical activity and mindful eating can help you get back on track.';
    } else {
      category = 'Obese';
      color = '#FF6B6B';
      cardClass = 'obese';
      insightTitleText = 'Obesity';
      insightTextContent = 'Your BMI falls in the obesity range. We strongly recommend consulting with a healthcare professional for personalized guidance.';
    }

    // Update result display
    resultBMI.textContent = bmi.toFixed(1);
    resultCategory.textContent = category;
    resultCategory.style.color = color;

    // Update gauge indicator position
    updateGaugeIndicator(bmi);

    // Update legend active state
    updateLegendActive(category);

    // Update insight card
    insightCard.className = `insight-card ${cardClass}`;
    insightTitle.textContent = insightTitleText;
    insightText.textContent = insightTextContent;

    // Calculate additional stats
    const minIdealKg = 18.5 * (heightM * heightM);
    const maxIdealKg = 24.9 * (heightM * heightM);

    if (unitSystem === 'metric') {
      statIdealWeight.textContent = `${Math.round(minIdealKg)} - ${Math.round(maxIdealKg)} kg`;
    } else {
      const minLbs = Math.round(minIdealKg / 0.453592);
      const maxLbs = Math.round(maxIdealKg / 0.453592);
      statIdealWeight.textContent = `${minLbs} - ${maxLbs} lbs`;
    }

    // BMR (Mifflin-St Jeor)
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;
    statBMR.textContent = `${Math.round(bmr)} kcal`;

    // TDEE (lightly active multiplier)
    const tdee = bmr * 1.375;
    statTDEE.textContent = `${Math.round(tdee)} kcal`;

    // Water intake
    const water = (weightKg * 0.035).toFixed(1);
    statWater.textContent = `${water} L/day`;
  }

  function updateGaugeIndicator(bmi) {
    // The gauge arc goes from bottom-left (~210°) clockwise to bottom-right (~330°)
    // Spanning about 300° total. BMI range: 15 to 40.
    const minBMI = 15;
    const maxBMI = 40;
    let ratio = (bmi - minBMI) / (maxBMI - minBMI);
    ratio = Math.max(0, Math.min(1, ratio));

    // Arc: starts at 210° (bottom-left), sweeps 300° clockwise to 150° (bottom-right)
    // In standard math coords (0° = right, counter-clockwise positive)
    // But SVG is y-down, so we use clockwise
    const startAngleDeg = 210; // bottom-left start
    const arcSpanDeg = 300;    // total arc
    const angleDeg = startAngleDeg - (ratio * arcSpanDeg); // counter-clockwise in math coords
    const angleRad = (angleDeg * Math.PI) / 180;

    const cx = 100 + 85 * Math.cos(angleRad);
    const cy = 100 - 85 * Math.sin(angleRad);

    gaugeIndicator.setAttribute('cx', cx.toFixed(1));
    gaugeIndicator.setAttribute('cy', cy.toFixed(1));

    // Update indicator color based on category
    let color;
    if (bmi < 18.5) color = '#5BC0EB';
    else if (bmi < 25) color = '#4ECDC4';
    else if (bmi < 30) color = '#FFB347';
    else color = '#FF6B6B';

    gaugeIndicator.setAttribute('fill', color);
  }

  function updateLegendActive(category) {
    legendItems.forEach(item => item.classList.remove('active-legend'));

    const categoryMap = {
      'Underweight': 0,
      'Normal': 1,
      'Overweight': 2,
      'Obese': 3
    };

    const idx = categoryMap[category];
    if (idx !== undefined && legendItems[idx]) {
      legendItems[idx].classList.add('active-legend');
    }
  }
});
