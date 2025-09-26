// comprehensive-security-test.js
const fetch = require('node-fetch'); // npm i node-fetch@2
//const url = 'http://localhost:8000/api/tasks'; // Ensure this URL is correct
const url = 'http://localhost/api/tasks'; //comprehensive-security-test

const payloads = {
  "XSS (Cross-Site Scripting)": [
    { title: "<script>alert('Stored XSS 1')</script>" },
    { title: "<img src=x onerror=alert('Stored XSS 2')>" },
    { title: "My Task\" onmouseover=\"alert('Stored XSS 3')" },
    { title: "<a href=\"javascript:alert('Stored XSS 4')\">Click Me</a>" }
  ],
  "DOM Manipulation (Potential precursor to DOM XSS)": [
    { title: "<h1>This should not be a heading</h1>" },
    { title: "<div id=\"new_element\">Injecting a div</div>" }
  ],
  "NoSQL Injection (e.g., MongoDB)": [
    { title: "{\"$ne\": \"some_value\"}" }, // Operator Injection
    { title: "{\"$gt\": \"\"}" },          // Operator Injection
    { title: "{\"$where\": \"sleep(1000)\"}" } // JavaScript Execution
  ],
  "Template & JS Injection (SSTI & CSTI)": [
    { title: "{{7*7}}" },                // Server-Side (Jinja2/Twig)
    { title: "<%= 7*7 %>" },              // Server-Side (EJS/Ruby)
    { title: "${alert('Client-Side')}" } // Client-Side (JS Template Literal)
  ],
  "Broken JSON & Payload Tampering": [
    { title: "Valid Title", "done": true, "injected_field": "pwned" }, // Extra field
    { title: 12345 }, // Wrong data type for title
    { title: ["a","b"] }, // Wrong data type for title
    { title: null } // Null value
  ]
};

const malformedRequests = [
  "This is not JSON",
  "{\"title\": \"Unclosed JSON",
  "[{\"title\":\"Sent an array instead of object\"}]"
];

const sendRequest = async (url, method, headers, body) => {
  try {
    const res = await fetch(url, { method, headers, body });
    console.log(`Sent: ${String(body).slice(0, 60)}...`);
    console.log(`----> Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`----> Response: ${text.slice(0, 200)}\n`);
  } catch (e) {
    console.error(`Error sending payload: ${String(body).slice(0, 60)}...`);
    console.error(`----> Error: ${e.message}\n`);
  }
};


(async () => {
  console.log('--- Starting Comprehensive Security Test ---\n');

  // --- Test well-formed but malicious payloads ---
  for (const category in payloads) {
    console.log(`--- Testing Category: ${category} ---\n`);
    for (const p of payloads[category]) {
      await sendRequest(url, 'POST', {'Content-Type': 'application/json'}, JSON.stringify(p));
    }
  }

  // --- Test malformed/broken requests ---
  console.log(`--- Testing Category: Malformed Raw Requests ---\n`);
  for (const rawBody of malformedRequests) {
    // Sending as text/plain to ensure it's not parsed as JSON by mistake
    await sendRequest(url, 'POST', {'Content-Type': 'text/plain'}, rawBody);
  }

  console.log('--- Test Complete ---');
})();