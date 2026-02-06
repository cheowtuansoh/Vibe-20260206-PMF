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
                <h2>Enter Activity Notifications</h2>
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
            </style>
            <div class="activity-table-container">
                <h2>Organized Activities</h2>
                <table id="activitiesTable">
                    <thead>
                        <tr>
                            <th>Activity Info</th>
                            <th>Schedule Date and Time</th>
                            <th>Place</th>
                            <th>Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Activities will be inserted here -->
                    </tbody>
                </table>
                <p id="noActivitiesMessage" class="no-activities">No activities to display yet. Enter some text above!</p>
            </div>
        `;
    }

    addActivity(activity) {
        const tbody = this.shadowRoot.getElementById('activitiesTable').querySelector('tbody');
        const noActivitiesMessage = this.shadowRoot.getElementById('noActivitiesMessage');

        if (noActivitiesMessage) {
            noActivitiesMessage.style.display = 'none'; // Hide "no activities" message
        }

        const row = tbody.insertRow();
        row.insertCell().textContent = activity['Activity Info'] || 'N/A';
        row.insertCell().textContent = activity['Schedule Date and Time'] || 'N/A';
        row.insertCell().textContent = activity['Place'] || 'N/A';
        row.insertCell().textContent = activity['Remark'] || 'N/A';
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
async function mockGeminiApi(text) {
    console.log('Mocking Gemini API call with text:', text);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Define a more robust set of mock responses based on keywords
    if (text.toLowerCase().includes('soccer practice')) {
        return {
            activities: [
                {
                    "Activity Info": "U10 Soccer Practice",
                    "Schedule Date and Time": "Friday, Feb 7, 2026, 4:00 PM - 5:30 PM",
                    "Place": "Community Sports Field",
                    "Remark": "Bring water bottle and shin guards."
                }
            ]
        };
    } else if (text.toLowerCase().includes('parent-teacher conference')) {
        return {
            activities: [
                {
                    "Activity Info": "Parent-Teacher Conference (Grade 5)",
                    "Schedule Date and Time": "Thursday, Feb 6, 2026, 3:30 PM",
                    "Place": "School Auditorium, Room 101",
                    "Remark": "Please arrive 10 minutes early. Meeting with Mrs. Davis."
                }
            ]
        };
    } else if (text.toLowerCase().includes('art class')) {
        return {
            activities: [
                {
                    "Activity Info": "After-school Art Class",
                    "Schedule Date and Time": "Wednesday, Feb 5, 2026, 3:00 PM - 4:00 PM",
                    "Place": "School Art Room",
                    "Remark": "New project: pottery. Wear old clothes."
                }
            ]
        };
    } else {
        // Default mock response for other inputs
        return {
            activities: [
                {
                    "Activity Info": "General Activity",
                    "Schedule Date and Time": "TBD",
                    "Place": "TBD",
                    "Remark": "Could not extract specific details. Please refine input."
                }
            ]
        };
    }
}

console.log('main.js loaded.');