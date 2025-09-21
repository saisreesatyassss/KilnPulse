# **App Name**: KilnPulse

## Core Features:

- Kiln Heartbeat Dashboard: Display real-time kiln metrics (temperature, O₂, energy) using line charts and KPI cards, updated via mocked API/BigQuery and websocket/polling.
- AI Operator Assistant: Provide a chat widget powered by Gemini that summarizes the current KPI state and gives anomaly explanations and corrective steps, with reasoning provided as a tool within the LLM, based on user queries.
- Rule-based Predictive Alerts: Implement threshold rules that trigger alerts in the UI, with each alert including a Gemini-generated explanation, using the LLM's reasoning ability to decide if or when the alert is appropriate; show optional 'confidence' score.
- Simulate Anomaly Button: Button to trigger alerts.
- Alert Creation: Backend component for generation and display of triggered alerts.

## Style Guidelines:

- Primary color: Dark slate (#2c3e50) for an industrial feel, reminiscent of heavy machinery and precision.
- Background color: Very dark slate (#243140), only slightly different hue and brightness.
- Accent color: Ember (#E1900B) to represent the 'pulse' and heat of the kiln. This vibrant color contrasts well and symbolizes energy.
- Font: 'Inter', a sans-serif with a modern, machined, objective, neutral look, suitable for headlines or body text.
- Use cards with thin shadows for a modern and clean layout.
- Subtle animations and transitions to enhance user experience.