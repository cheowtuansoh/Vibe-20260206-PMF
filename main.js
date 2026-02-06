// main.js

// 1. Define ActivityInput Web Component
class ActivityInput extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                .activity-input-container {
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
                }
                textarea {
                    width: calc(100% - 22px); /* Account for padding and border */
                    padding: 10px;
                    margin-bottom: 15px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 1rem;
                    resize: vertical;
                    min-height: 120px;
                    box-sizing: border-box; /* Include padding and border in the element's total width and height */
                }
                button {
                    background-color: #007BFF;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    width: 100%; /* Make button full width */
                    box-sizing: border-box;
                }
                button:hover {
                    background-color: #0056b3;
                }
            </style>
            <div class="activity-input-container">
                <h2>Enter Activity</h2>
                <textarea id="activityText" placeholder="Paste or type activity notifications here..."></textarea>
                <button id="processButton">Process Activities</button>
            </div>
        `;
    }

    connectedCallback() {
        this.shadowRoot.getElementById('processButton').addEventListener('click', this._processInput.bind(this));
    }

    _processInput() {
        const activityText = this.shadowRoot.getElementById('activityText').value;
        if (activityText.trim()) {
            // Dispatch a custom event with the input text
            this.dispatchEvent(new CustomEvent('activity-submitted', {
                detail: { text: activityText },
                bubbles: true,
                composed: true
            }));
            this.shadowRoot.getElementById('activityText').value = ''; // Clear textarea
        } else {
            alert('Please enter some activity text.');
        }
    }
}
customElements.define('activity-input', ActivityInput);

// 2. Define ActivityTable Web Component
class ActivityTable extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                .activity-table-container {
                    margin-top: 30px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    overflow-x: auto;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #e9ecef;
                    color: #555;
                    font-weight: bold;
                    position: sticky;
                    top: 0;
                }
                tbody tr:nth-child(even) {
                    background-color: #f6f6f6;
                }
                tbody tr:hover {
                    background-color: #e9f7ef;
                }
                .no-activities {
                    text-align: center;
                    padding: 20px;
                    color: #777;
                }
                .delete-btn {
                    background-color: #dc3545; /* Red color for delete */
                    color: white;
                    border: none;
                    padding: 6px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: background-color 0.2s ease;
                }
                .delete-btn:hover {
                    background-color: #c82333;
                }
            </style>
            <div class="activity-table-container">
                <h2>Consolidated Schedule</h2>
                <table id="activitiesTable">
                    <thead>
                        <tr>
                            <th>Name</th> <!-- New column for name -->
                            <th>Activity Info</th>
                            <th>Schedule Date and Time</th>
                            <th>Place</th>
                            <th>Remark</th>
                            <th>Action</th> <!-- New column for delete button -->
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Activities will be inserted here -->
                    </tbody>
                </table>
                <p id="noActivitiesMessage" class="no-activities">No activities to display yet. Enter some text above!</p>
            </div>
        `;
        this._activities = []; // Array to store activity objects
    }

    connectedCallback() {
        this._loadActivitiesFromLocalStorage();
        // Event delegation for delete buttons
        this.shadowRoot.getElementById('activitiesTable').addEventListener('click', this._deleteActivity.bind(this));
    }

    _renderActivity(activity, index) {
        const tbody = this.shadowRoot.getElementById('activitiesTable').querySelector('tbody');
        const noActivitiesMessage = this.shadowRoot.getElementById('noActivitiesMessage');

        if (noActivitiesMessage) {
            noActivitiesMessage.style.display = 'none'; // Hide "no activities" message
        }

        const row = tbody.insertRow();
        row.setAttribute('data-index', index); // Store index on the row itself
        row.insertCell().textContent = activity['Name'] || 'N/A'; // Display the new Name field
        row.insertCell().textContent = activity['Activity Info'] || 'N/A';
        row.insertCell().textContent = activity['Schedule Date and Time'] || 'N/A';
        row.insertCell().textContent = activity['Place'] || 'N/A';
        row.insertCell().textContent = activity['Remark'] || 'N/A';

        const actionCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.setAttribute('data-index', index); // Redundant but good for direct button click
        actionCell.appendChild(deleteButton);
    }

    _clearAndRenderAllActivities() {
        const tbody = this.shadowRoot.getElementById('activitiesTable').querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows
        if (this._activities.length === 0) {
            const noActivitiesMessage = this.shadowRoot.getElementById('noActivitiesMessage');
            if (noActivitiesMessage) {
                noActivitiesMessage.style.display = 'block'; // Show message if no activities
            }
        } else {
            this._activities.forEach((activity, index) => this._renderActivity(activity, index));
        }
    }

    addActivity(activity) {
        this._activities.push(activity);
        this._saveActivitiesToLocalStorage();
        this._clearAndRenderAllActivities(); // Re-render to ensure indices are correct
    }

    _deleteActivity(event) {
        if (event.target.classList.contains('delete-btn')) {
            const index = parseInt(event.target.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < this._activities.length) {
                this._activities.splice(index, 1); // Remove activity from array
                this._saveActivitiesToLocalStorage(); // Update local storage
                this._clearAndRenderAllActivities(); // Re-render table
            }
        }
    }

    _loadActivitiesFromLocalStorage() {
        const storedActivities = localStorage.getItem('activio-activities');
        if (storedActivities) {
            this._activities = JSON.parse(storedActivities);
            this._clearAndRenderAllActivities(); // Render all loaded activities
        }
    }

    _saveActivitiesToLocalStorage() {
        localStorage.setItem('activio-activities', JSON.stringify(this._activities));
    }
}
customElements.define('activity-table', ActivityTable);


// 3. Main application logic for handling events and API calls
document.addEventListener('activity-submitted', async (event) => {
    const inputText = event.detail.text;
    console.log('Activity text submitted:', inputText);

    // Get the activity table component
    const activityTable = document.querySelector('activity-table');

    // Mock API call to Gemini
    const processedData = await mockGeminiApi(inputText);

    if (processedData && processedData.activities) {
        processedData.activities.forEach(activity => {
            activityTable.addActivity(activity);
        });
    } else {
        console.error('Failed to process activities or no activities found.');
        alert('Could not process the activity text. Please try again.');
    }
});

// Mock Gemini API call
// Helper function to parse date and time from text
function parseDateAndTime(text, referenceDate) {
    let activityDate = new Date(referenceDate); // Start with the reference date
    let time = '';
    let dateFound = false;

    // --- Parse Day/Date ---
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = referenceDate.getDay(); // 0 for Sunday, 5 for Friday

    // Look for specific days of the week, relative to referenceDate
    for (let i = 0; i < daysOfWeek.length; i++) {
        if (text.toLowerCase().includes(`next ${daysOfWeek[i]}`)) {
            activityDate.setDate(referenceDate.getDate() + (7 + i - currentDay) % 7);
            if (i === currentDay && text.toLowerCase().indexOf(`next ${daysOfWeek[i]}`) === text.toLowerCase().indexOf(daysOfWeek[i])) {
                // If "next Friday" on a Friday, it means 7 days later
                activityDate.setDate(activityDate.getDate() + 7);
            }
            dateFound = true;
            break;
        } else if (text.toLowerCase().includes(daysOfWeek[i]) && !text.toLowerCase().includes(`next ${daysOfWeek[i]}`)) {
            let dayDiff = i - currentDay;
            if (dayDiff < 0) { // If day has passed this week, assume next week
                dayDiff += 7;
            }
            activityDate.setDate(referenceDate.getDate() + dayDiff);
            dateFound = true;
            // If the day is today, ensure it's not from next week unless "next" is explicitly used
            if (i === currentDay && !text.toLowerCase().includes('today')) {
                // If it's "Friday" on a Friday, assume it means THIS Friday
                // unless it's already past the time for the activity that day.
                // For simplicity in mock, just use this Friday for now.
            }
            break;
        }
    }

    if (text.toLowerCase().includes('today')) {
        activityDate = new Date(referenceDate);
        dateFound = true;
    }
    if (text.toLowerCase().includes('tomorrow')) {
        activityDate.setDate(referenceDate.getDate() + 1);
        dateFound = true;
    }

    // --- Parse Time ---
    const timeRegex = /(\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)?)/gi;
    const matches = text.match(timeRegex);
    if (matches && matches.length > 0) {
        time = matches[0];
        // Basic normalization for display
        if (time.endsWith('pm') && !time.includes(':') && parseInt(time) < 12) {
            time = `${parseInt(time)}:00 PM`;
        } else if (time.endsWith('am') && !time.includes(':') && parseInt(time) === 12) {
             time = `12:00 AM`;
        } else if (time.endsWith('am') && !time.includes(':') && parseInt(time) < 12) {
            time = `${parseInt(time)}:00 AM`;
        } else if (time.endsWith('pm') && !time.includes(':') && parseInt(time) === 12) {
            time = `12:00 PM`;
        }
        // If it's just "1pm", ensure "PM" is capitalized.
        if (time.toLowerCase().endsWith('pm') && time.indexOf(' ') === -1) {
            time = time.toUpperCase();
        } else if (time.toLowerCase().endsWith('am') && time.indexOf(' ') === -1) {
            time = time.toUpperCase();
        }
        dateFound = true;
    }

    // Format the date if found, otherwise keep it as TBD
    let formattedDate = 'TBD';
    if (dateFound) {
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        formattedDate = `${activityDate.toLocaleDateString('en-US', options)}`;
        if (time) {
            formattedDate += `, ${time}`;
        }
    }


    return formattedDate;
}

// Mock Gemini API call
async function mockGeminiApi(text) {
    console.log('Mocking Gemini API call with text:', text);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let name = 'N/A'; // New field for name
    let activityInfo = 'General Activity';
    let scheduleDateAndTime = 'TBD';
    let place = 'TBD';
    let remark = '';

    // Reference date for calculations (Friday, February 6, 2026)
    const referenceDate = new Date('2026-02-06T12:00:00');

    // --- Extract Name ---
    const nameRegex = /^([A-Z][a-z]+)\s+(has|is|will\s+be|needs\s+to|going\s+to)/;
    const nameMatch = text.match(nameRegex);
    if (nameMatch) {
        name = nameMatch[1];
    }


    // --- Extract Activity Info ---
    const activityKeywords = ['tuition', 'practice', 'class', 'meeting', 'appointment', 'session'];
    for (const keyword of activityKeywords) {
        if (text.toLowerCase().includes(keyword)) {
            const regex = new RegExp(`(\\w+\\s+)*?${keyword}`, 'gi');
            const match = regex.exec(text);
            if (match) {
                activityInfo = match[0].trim().replace(/\b(next|this)\b\s*/gi, ''); // Remove "next" or "this" prefixes for cleaner info
                break;
            }
        }
    }
    // More specific parsing for "Chinese tuition"
    if (text.toLowerCase().includes('chinese tuition')) {
        activityInfo = 'Chinese Tuition';
    }


    // --- Extract Schedule Date and Time ---
    scheduleDateAndTime = parseDateAndTime(text, referenceDate);


    // --- Extract Place ---
    const placeRegex = /(at|in)\s+([A-Z][a-z0-9\s,.'-]+(?:school|hall|room|field|center|park|house|cafe|library|stadium|arena)\b)/gi;
    const placeMatch = placeRegex.exec(text);
    if (placeMatch) {
        place = placeMatch[2].trim();
    } else if (text.toLowerCase().includes('school')) {
        place = 'School';
    }


    // --- Extract Remark (anything after a key detail or a general sentence) ---
    const remarkKeywords = ['note:', 'remark:', 'please', 'bring', 'don\'t forget', 'remember to'];
    for (const keyword of remarkKeywords) {
        const index = text.toLowerCase().indexOf(keyword);
        if (index !== -1) {
            remark = text.substring(index).trim();
            break;
        }
    }
    // If no specific remark keyword, take a general trailing sentence if available
    if (!remark) {
        const lastSentenceMatch = text.match(/(\.\s*|\?\s*|!\s*)(.*)$/);
        if (lastSentenceMatch && lastSentenceMatch[2].length > 10) { // Ensure it's a significant sentence
            remark = lastSentenceMatch[2].trim();
        }
    }


    return {
        activities: [
            {
                "Name": name, // Include the extracted name
                "Activity Info": activityInfo,
                "Schedule Date and Time": scheduleDateAndTime,
                "Place": place,
                "Remark": remark
            }
        ]
    };
}

console.log('main.js loaded.');