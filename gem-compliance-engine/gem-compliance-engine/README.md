# GEM Compliance Engine

A React dashboard component (`ProcurementOfficerDashboard`) for reviewing bid compliance — GSTIN/Udyam checks, Make-in-India local content thresholds, rule-by-rule pass/warning/fail status, and AI-generated explanations per rule.

## Install

Copy `src/GemComplianceEngine.jsx` into your project, or install this folder as a local package:

```bash
npm install ./gem-compliance-engine
```

## Requirements

- React >= 17
- `lucide-react` (icons)
- Tailwind CSS classes are used for styling (e.g. `bg-amber-200`) — a Tailwind-configured project is expected for correct rendering.

## Usage

```jsx
import ProcurementOfficerDashboard from 'gem-compliance-engine/src/GemComplianceEngine.jsx';

function App() {
  return <ProcurementOfficerDashboard />;
}

export default App;
```

## Notes

- The component ships with seeded sample bidder/rule data (`INITIAL_BIDDERS`) for demo purposes — replace or wire this to a real data source as needed.
- Fully self-contained: no external API calls are made.
