# VitalFit - BMI & Health Dashboard

VitalFit is a web application for calculating Body Mass Index (BMI), Basal Metabolic Rate (BMR), and Total Daily Energy Expenditure (TDEE) with progress tracking over time.

## Features

- **Unit Switching**: Toggle between Metric (kg, cm) and Imperial (lbs, in).
- **Interactive Gauge**: Visual color-coded category meter (Underweight, Normal, Overweight, Obese).
- **Health Calculations**: Ideal weight range, BMR (Mifflin-St Jeor formula), TDEE, and daily hydration target.
- **History Tracking**: Local storage history log with CSV export option.
- **Progress Chart**: Line chart visualizer powered by Chart.js.

## Usage

Simply open `index.html` in your browser, or start a local static server:

```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## License
[MIT](LICENSE)
