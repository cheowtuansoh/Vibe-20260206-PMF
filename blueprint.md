# Vibe Application Blueprint

## Overview

Vibe is a web application designed for parents to manage and declutter activity notifications for their children. It provides a simple interface to input unstructured text about upcoming activities, which is then processed by an AI to extract key information and display it in an organized table.

## User Profile

Parents who are overwhelmed by activity notifications from various sources (e.g., school emails, flyers, text messages) and need a single place to consolidate and view this information clearly.

## Features & Design

### Core Functionality
- **Input:** A text area where users can paste or type in activity information.
- **Processing:** An AI service (Gemini) processes the text to extract:
    - `Activity Info`: A brief description of the event.
    - `Schedule Date and Time`: The date and time of the activity.
    - `Place`: The location of the event.
    - `Remark`: Any additional important notes.
- **Output:** A clean, easy-to-read table that displays the structured activity information.

### Visual Design
- **Layout:** A centered, single-column layout that is simple and intuitive.
- **Color Palette:** A calming and modern color scheme with a primary color for interactive elements, a neutral background, and accent colors for notifications and highlights.
- **Typography:** Clean, legible fonts that are easy to read on all screen sizes.
- **Interactivity:** Smooth transitions and subtle animations to provide a polished user experience. Buttons and input fields will have clear hover and focus states.

## Implementation Plan

1.  **HTML Structure (`index.html`):**
    -   Set up the main HTML document with a header, a main content area, and a footer.
    -   Create the input form with a `<textarea>` and a "Process" button.
    -   Create an empty `<table>` to display the results.

2.  **Styling (`style.css`):**
    -   Apply the visual design using modern CSS.
    -   Ensure the layout is responsive and works well on both desktop and mobile devices.
    -   Style the input form, button, and table for a clean and modern look.

3.  **JavaScript Logic (`main.js`):**
    -   Use ES Modules to organize the code.
    -   Implement an event listener for the "Process" button.
    -   Create a function to handle the API call to the Gemini model. This function will take the user's input as a parameter.
    -   **For development, I will use a mock API call to simulate the response from Gemini.** This will allow me to build and test the application without needing a live API key.
    -   Implement a function to dynamically create and insert rows into the output table with the processed data.
    -   Add error handling to manage potential issues with the API call.

4.  **Web Components:**
    -   Create custom elements for the main components of the application, such as the input form and the output table, to encapsulate their functionality and make the code more reusable.
