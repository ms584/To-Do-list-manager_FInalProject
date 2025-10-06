# Full-Stack To-Do List Application

<!-- Badges -->
![GitHub license](https://img.shields.io/github/license/ms584/To-Do-list-manager_FInalProject)
![GitHub stars](https://img.shields.io/github/stars/ms584/To-Do-list-manager_FInalProject?style=social)
[![Python](https://img.shields.io/badge/Python-3.9-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-20.10-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

A complete full-stack web application featuring a modern frontend, a robust backend, and a fully containerized deployment environment using Docker. The application allows users to sign in with their Google account to create, view, update, delete, and export their personal to-do lists.

---

## Live Demo

**Check out the live application hosted on Render:**

**[https://to-do-list-manager-73ch.onrender.com](https://to-do-list-manager-73ch.onrender.com)**

*(Note: The free tier on Render may cause the backend to "spin down" after 15 minutes of inactivity. The first request after a break might take 30-60 seconds while the service "wakes up.")*

---

## Application Preview

![Screenshot of the To-Do List Application](https://github.com/user-attachments/assets/e332707b-1e3c-4b84-88c3-45cbb1e7bf96)

*(To add a screenshot: take a picture of the app, go to the "Issues" tab in this GitHub repo, create a "New Issue", drag-and-drop the image into the text box, copy the generated URL, and paste it here.)*

---

## Features

*   **Secure Authentication:** Users can sign in securely using their **Google Account (OAuth 2.0)**.
*   **Multi-Tenancy:** Each user has their own private to-do list; data is securely isolated.
*   **Full CRUD Functionality:** Create, Read, Update, and Delete tasks.
*   **Task Prioritization:** Assign a priority level (High, Medium, Low) to each task.
*   **Task Scheduling:** Add a specific time to each task.
*   **Data Export:** Users can export their current to-do list as a formatted **PDF document**.
*   **Responsive Design:** The UI is optimized for a seamless experience on both desktop and mobile devices.
*   **Containerized:** The entire stack is containerized with **Docker** and orchestrated with **Docker Compose** for easy, reproducible development and deployment.

---

## Tech Stack

| Category      | Technology                                           |
| :------------ | :--------------------------------------------------- |
| **Frontend**  | React, React Router, Axios, `@react-oauth/google`    |
| **Backend**   | Python 3.9, FastAPI, Pydantic v2                     |
| **Database**  | MongoDB (with Beanie ODM)                            |
| **Web Server**| Nginx (as a Reverse Proxy)                           |
| **DevOps**    | Docker, Docker Compose, GitHub Actions (CI/CD)       |
| **Auth**      | JWT (JSON Web Tokens), OAuth 2.0                     |
| **Deployment**| Render (PaaS)                                        |

---

## Project Structure

The project is organized into a clean, modern monorepo structure with clear separation between the frontend, backend, and infrastructure configuration.

```
To-Do-list-manager_FInalProject/
│
├── .gitignore               # Specifies all files and folders for Git to ignore (e.g., node_modules, .env).
├── README.md                # This documentation file.
├── docker-compose.yml       # The master file to run the entire application stack locally.
├── package.json             # Dependencies for local utility scripts (e.g., security test).
├── package-lock.json        # Locks dependency versions for local scripts.
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
│   ├── repositories.py      # Data Access Layer (handles direct DB communication, e.g., finding a user).
│   ├── schemas.py           # Pydantic models (defines API data shapes & validation for requests/responses).
│   └── services.py          # Business Logic Layer (implements core features like creating a task).
│
├── backend-data/            # (Ignored by Git) Stores persistent data for the local MongoDB volume.
│
└── frontend/
    ├── .env.example         # Example environment variables required for the frontend.
    ├── Dockerfile           # Blueprint to build the React frontend and Nginx server.
    ├── nginx.conf           # Configuration for the Nginx web server and reverse proxy.
    ├── package.json         # Dependencies (React, Axios, etc.) for the frontend app.
    │
    ├── public/              # Static assets and the main HTML shell for the app.
    │   └── index.html       # The main HTML template where the React app is loaded.
    │
    └── src/                 # The React application's source code.
        ├── App.css          # Main stylesheet for the application.
        ├── App.js           # The main React component with UI, logic, and routing.
        ├── index.css        # Global styles for the application.
        └── index.js         # The entry point that renders the React app into the DOM.
```

---

## Local Development Setup

These instructions will get the project running on your local machine for development and testing.

### Prerequisites

*   **Docker & Docker Compose:** The only essential requirement.
    *   [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
*   **Git:** For cloning the repository.
    *   [Install Git](https://git-scm.com/downloads)
*   **Google Client ID:** You will need to create your own OAuth 2.0 Client ID from the [Google Cloud Console](https://console.cloud.google.com/).

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ms584/To-Do-list-manager_FInalProject.git
    cd To-Do-list-manager_FInalProject
    ```

2.  **Create Environment Files:**
    *   Create a `.env` file in the project's root directory and add your Google Client ID and a secret key:
        ```
        GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
        SECRET_KEY=a-very-strong-and-random-secret-key
        ```
    *   Create a `.env` file in the `frontend/` directory and add your Google Client ID:
        ```
        REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
        ```

3.  **Build and run the containers:**
    This single command builds the images, creates the containers, and starts the entire application stack.
    ```bash
    docker compose up --build
    ```
    *   Add the `-d` flag (`docker compose up --build -d`) to run in the background.

4.  **Access the application:**
    Once the containers are running, open your web browser and navigate to:
    > **`http://localhost`**

To stop the application, press `Ctrl+C`. If running in the background, use `docker compose down -v`.

---

## Deployment on Render

This application is deployed using **Render's** free tier.

1.  **Deploy the Database:** Create a **MongoDB** database on Render (or use a free service like MongoDB Atlas) and get the **Internal Connection String**.
2.  **Deploy the Backend:**
    *   Create a new **Web Service** on Render, pointing to your GitHub repository.
    *   Set the **Environment** to **Docker** and the **Root Directory** to `backend`.
    *   Add the required Environment Variables: `DATABASE_URL` (from your database), `GOOGLE_CLIENT_ID`, and `SECRET_KEY`.
3.  **Deploy the Frontend:**
    *   Create a new **Static Site** on Render.
    *   Set the **Root Directory** to `frontend`, **Build Command** to `npm run build`, and **Publish Directory** to `build`.
    *   Add an Environment Variable with the key `REACT_APP_API_URL` and the value set to your backend's URL with `/api` appended. Also add `REACT_APP_GOOGLE_CLIENT_ID`.
4.  **Update Google Cloud Console:** Add your final frontend URL to the list of "Authorized JavaScript origins" in your OAuth Client ID settings.

---

## License

This project is open source and available under the [MIT License](https://opensource.org/license/MIT).