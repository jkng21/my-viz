# Seasonal Sales Trend - Project Brief

## What is this?
A single-page interactive data visualization that tells the story of seasonal sales patterns for a local pet store.
- When sales peak and decline
- Whether seasonal patterns repeat year over year
- Which product categories and SKUs drive those patterns
- What meaningful business insights emerge from the data
The experience should feel like an interactive data story, not a static.
The prinary goal is data storytelling through exploration.

## Data
Generate a fake dataset as a JSON file (scr/data/metrics.json) from Jan 2024 - Dec 2025 including:
- Sales
- Transactions
- Foot traffic
- Conversion rate
- Product category
- SKU/product
- Sales by category
- Sales by SKU/product
Use realistic pet store categories and products, and meaningful seasonal variation.

## Visual Story
Design the page around a narratigve that answers these three questions:
- What is the seasonal pattern?
    - Show visual of monthly sales across the full 2024 - 2025 period.
    - Make seasonal peaks and valleys visible.
- What drives the pattern?
    - Show an interactive metric toggle for sales, foot traffic, transactions, conversion rate, and units sold.
    - The chart should update when the metric changes.
- Which categories drive it?
    - Show interactive category visualization showing how product categories contribute to seasonal sales. 
    - When categories are selected, update the related charts.

## Interactions
- Use interactive controls where useful. 
- Selections should update across visualizations where relevant.
- Use short, dynamic annotations to call attention to meaningful patterns in the data.


## Style
- Dark theme by default (Vuetify dark theme)
- Clean, minimal, lots of whitespace
- Charts should use a cohesive color palette - no rainbow
- Use consistent category colors.
- Mobile responsive - visuals and components stack on small screen
- Avoid a wall of cards or unrelated charts.

## Tech
- Vue 3 + Typescript + Vuetify 3
- Chart.js via vue-chartjs for all charts
- Fake data from a local JSON file (no API calls)
- Single page - no routing needed