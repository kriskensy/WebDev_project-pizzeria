# Pizzeria Web App

A modern, interactive web application for managing a pizzeria, including menu browsing, ordering, and cart management. Built with modular JavaScript, SCSS, and a JSON-based backend, this project is designed for educational and demonstration purposes.

---

## Features

- Browse a dynamic pizza menu with images and descriptions
- Add, remove, and customize products in the shopping cart
- Calculate totals and delivery fees automatically
- Interactive widgets for selecting product options and quantities
- Modular code structure for scalability and maintainability
- Responsive design for desktop and mobile devices

---

## Project Structure

```
src/
  css/            # Compiled CSS files
  db/             # JSON database (app.json)
  images/         # Product and UI images
  js/
    components/   # Modular JavaScript components (widgets, cart, etc.)
    app.js        # Main application logic
    settings.js   # Configuration and selectors
    utils.js      # Utility functions
  sass/           # SCSS source files
  vendor/         # Third-party libraries (e.g., range-slider)
index.html        # Main HTML file
```

---

## How to Run

The project is hosted online for easy access.  
**To view and test the application, visit:**  
[Pizzeria Web App](https://249851d8-f00f-4e16-bd3d-ab021c6aa05b-00-31g416mhxfeip.picard.replit.dev/#/homepage)

---

## Local Development

If you want to run the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kriskensy/WebDev_project-pizzeria
   cd pizzeria
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   - If using `json-server` for the backend, run:
     ```bash
     npx json-server --watch src/db/app.json --port 3000
     ```
   - For the frontend, open `index.html` in your browser or use a local server (e.g., Live Server extension for VS Code).

---

## Technologies Used

- JavaScript (ES6 modules)
- SCSS/SASS
- HTML5, CSS3
- [json-server](https://github.com/typicode/json-server) for mock backend
- [range-slider](https://github.com/andreruffert/range-slider) for UI components

---

## License

This project is for educational purposes.  
Feel free to use and modify for learning or demonstration.

---