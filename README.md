# Full-Stack To-Do List Manager Application (Final Project)

<!-- Badges -->
[![License: MIT](https://img.shields.io/github/license/ms584/To-Do-list-manager_FInalProject?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ms584/To-Do-list-manager_FInalProject?style=social)](https://github.com/ms584/To-Do-list-manager_FInalProject/stargazers)
[![Python](https://img.shields.io/badge/Python-3.9-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-20.10-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

A complete, production-ready full-stack web application built from the ground up. This To-Do List Manager allows authenticated users to manage their personal to-do lists on a day-by-day basis, with a secure authentication system and a fully containerized deployment workflow.

---

## Live Demo

**Check out the live application hosted on Render:**

**[https://to-do-list-manager-73ch.onrender.com](https://to-do-list-manager-73ch.onrender.com)**

*(Note: The free tier may cause services to "spin down" after 15 minutes of inactivity. The first login might take 30-60 seconds to wake up the services.)*

---

## Application Preview

![Screenshot of the To-Do List Application](https://github.com/user-attachments/assets/b08de5b0-b69a-48b6-a4a9-5d33a65ff883)

---

## Features

- **Secure Authentication:** Users can log in securely using their **Google Account (OAuth 2.0)**.
- **Daily Planner:** Manage tasks on a per-day basis with a date picker for easy navigation.
- **Multi-Tenancy:** Each user has their own private daily logs; data is completely isolated between users.
- **Full CRUD Functionality:** Create, Read, Update, and Delete tasks for any given day.
- **Task Prioritization & Scheduling:** Assign a priority level (High, Medium, Low) and a specific time to each task.
- **Data Export:** Users can export their daily to-do list as a formatted **PDF document**.
- **Responsive Design:** The UI is optimized for a seamless experience on both desktop and mobile devices.
- **Containerized & Reproducible:** The entire stack is containerized with **Docker** for consistent development and deployment environments.
- **Tested & Secure:** Includes a complete **Pytest** suite for the backend API and a **k6** load testing suite.

---

## Tech Stack

| Category      | Technology                                           |
| :------------ | :--------------------------------------------------- |
| **Frontend**  | React, React Router, Axios, `@react-oauth/google`, `date-fns` |
| **Backend**   | Python 3.9, FastAPI, Pydantic v2                     |
| **Database**  | MongoDB (with Beanie ODM)                            |
| **Web Server**| Nginx (as a Reverse Proxy)                           |
| **DevOps**    | Docker, Docker Compose, GitHub Actions (CI/CD)       |
| **Testing**   | **k6 (Load Testing)**                                |
| **Deployment**| Render (PaaS)                                        |

---

## Project Structure

The project follows a clean monorepo structure, separating concerns for scalability and maintainability.

```
To-Do-list-manager_FInalProject/
│
├── .babelrc                 # Babel configuration for bundling k6 test scripts.
├── .gitignore               # Specifies all files and folders for Git to ignore.
├── README.md                # This documentation file.
├── docker-compose.yml       # The master file to orchestrate all Docker containers for local development.
├── package.json             # Dependencies for the k6/Webpack test bundling setup.
├── package-lock.json        # Locks dependency versions for the test setup.
├── webpack.config.js        # Webpack configuration to bundle k6 scripts and handle modules.
│
├── backend/
│   ├── .env.example         # Example environment variables required for the backend.
│   ├── Dockerfile           # Blueprint to build the Python backend container.
│   ├── main.py              # The FastAPI application entry point, defines API routes.
│   ├── pyproject.toml       # Project metadata and build configuration for Python.
│   ├── requirements.txt     # A list of all Python libraries for the backend.
│   │
│   ├── core/                # Core application logic (config, db connection, security).
│   │   ├── config.py        # Manages environment variables using Pydantic.
│   │   ├── db.py            # Handles the database connection logic (Beanie/MongoDB).
│   │   └── security.py      # Manages JWT creation and user authentication.
│   │
│   ├── documents.py         # Beanie ODM models (defines the database schema for Users & Tasks).
│   ├── repositories.py      # Data Access Layer (not heavily used due to ODM power, but maintains structure).
│   ├── schemas.py           # Pydantic models (defines API data shapes & validation for requests/responses).
│   └── services.py          # Business Logic Layer (implements core features like creating a task).
│
├── backend-data/            # (Ignored by Git) Stores persistent data for the local MongoDB volume.
│
├── frontend/
│   ├── .env.example         # Example environment variables required for the frontend.
│   ├── Dockerfile           # Blueprint to build the React frontend and Nginx server.
│   ├── nginx.conf           # Configuration for the Nginx web server and reverse proxy.
│   ├── package.json         # Dependencies (React, Axios, etc.) for the frontend app.
│   │
│   ├── public/              # Static assets and the main HTML shell for the app.
│   │   └── index.html       # The main HTML template where the React app is loaded.
│   │
│   └── src/                 # The React application's source code.
│       ├── App.css          # Main stylesheet for the application.
│       ├── App.js           # The main React component with UI, logic, and routing.
│       ├── index.css        # Global styles for the application.
│       └── index.js         # The entry point that renders the React app into the DOM.
│
└── tests-k6/                # Performance and Load Testing suite using k6.
    ├── .env.example         # Example of root environment variables for the test suite.
    │
    ├── common/
    │   └── scenarios.js     # Shared user behavior logic (e.g., login, add task) for all k6 tests.
    │
    ├── deploy/              # Test scripts configured for the deployed (production) environment.
    │   ├── .env.example
    │   ├── load-test.js
    │   ├── soak-test.js
    │   ├── spike-test.js
    │   └── stress-test.js
    │
    └── local/               # Test scripts configured for the local development environment.
        ├── .env.example
        ├── load-test.js
        ├── soak-test.js
        ├── spike-test.js
        └── stress-test.js
```

---

## Local Development Setup

### Prerequisites

- **Docker & Docker Compose:** [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Git:** [Install Git](https://git-scm.com/downloads)
- **Google Client ID:** Create from the [Google Cloud Console](https://console.cloud.google.com/).

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ms584/To-Do-list-manager_FInalProject.git
    cd To-Do-list-manager_FInalProject
    ```

2.  **Create Environment Files:**
    Copy the `.env.example` files in the `backend/` and `frontend/` directories to `.env` files in their respective locations, and fill in your actual values (especially your **Google Client ID**).

3.  **Build and run the containers:**
    ```bash
    docker compose up --build
    ```
    - Add the `-d` flag to run in the background.

4.  **Access the application:**
    > **`http://localhost`**

To stop the application, use `docker compose down -v`.

---

## Testing

### Performance & Load Tests (k6)

This project includes a comprehensive k6 suite for various performance tests.

1.  **Install k6:** [Follow the official installation guide](https://github.com/grafana/k6/releases/tag/v1.3.0).
2.  **Prepare the test scripts:**
    - Create a `.env` file inside `tests-k6/local/` (copy from `.env.example`) and add a valid JWT token obtained from your local application.
    - Run the Webpack bundler once to compile the test scripts:
      ```bash
      npm install
      npx webpack
      ```
3.  **Run a local test (e.g., Load Test):**
    ```bash
    k6 run dist-k6/local/load-test.js
    ```
    *(You can also run `stress-test.js`, `soak-test.js`, or `spike-test.js`)*

---

## Deployment

This application is deployed on **Render** and is configured for **Continuous Deployment**. Any push to the `main` branch will automatically trigger a new deployment.

The deployment consists of three separate services on Render:
1.  **MongoDB Database:** A free-tier instance on MongoDB Atlas.
2.  **Backend (Web Service):** Built from `backend/Dockerfile` and connected to the Atlas database.
3.  **Frontend (Static Site):** Built from the `frontend` directory and connected to the live backend API.

---

## License

This project is open source and available under the [MIT License](https://opensource.org/license/MIT).