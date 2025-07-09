# Game Tracker

This project is a web application that scrapes gaming data from various sources, analyzes it, and presents it through a user-friendly interface. It's designed to provide insights into game popularity and social media mentions.

## How it Works

The application scrapes data from [steamcharts.com](https://steamcharts.com/) to get the top 10 most played games. It retrieves information about current players, total hours played, and hours played in the last 30 days for each game. Additionally, it uses the Reddit API to analyze the number of mentions each game has received in the last 30 days.

The backend is built with Node.js and Express, and it serves the scraped data through a REST API. The frontend is a React application built with Vite, which consumes the API and visualizes the data using `recharts`. The application also implements a caching mechanism to improve performance.

## Tech Stack

-   **Backend**: Node.js, Express
-   **Frontend**: React, Vite
-   **Web Scraping**: Puppeteer
-   **Data Validation**: Zod
-   **Data Fetching & Caching**: React Query
-   **Deployment**: Docker

## Features

-   Scrapes top 10 games from steamcharts.com
-   Analyzes game mentions on Reddit
-   Provides data on current players, total hours played, and recent play hours
-   Visualizes data with interactive charts
-   Caches data to reduce load times and API calls
-   Containerized with Docker for easy setup and deployment

## Folder Structure

The project is organized into two main parts: the `client` directory, which contains the frontend application, and the `src` directory, which holds the backend code.

```
.
├── client/         # Contains the frontend React application
│   ├── public/     # Public assets
│   └── src/        # Frontend source code
├── data/           # Stores scraped data in .json and .csv format
├── src/            # Contains the backend Node.js/Express application
│   ├── cache/      # Caching logic
│   ├── controllers/ # Request handlers
│   ├── middleware/ # Express middleware
│   ├── scrapers/   # Web scraping scripts
│   ├── types/      # TypeScript type definitions
│   └── utils/      # Utility functions
├── .env.example    # Example environment file
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile      # Dockerfile for the backend
└── ...
```

## Getting Started

### Prerequisites

-   Docker
-   Node.js
-   A Reddit account with API keys

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/johnmerga/game-tracker.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd game-tracker
    ```
3.  Create a `.env` file by copying the example file:
    ```bash
    cp .env.example .env
    ```
4.  Fill in the required environment variables in the `.env` file. You can get your Reddit API keys from [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps).

## Usage

To run the application, use Docker Compose:

```bash
docker-compose up --build
```

This will build the Docker images and start the containers for the backend and frontend. The application will be available at `http://localhost:3001`.

## Environment Variables

The following environment variables are required:

-   `PORT`: The port for the backend server.
-   `CACHE_DURATION_SECONDS`: The duration for caching data in seconds.
-   `REDDIT_CLIENT_ID`: Your Reddit client ID.
-   `REDDIT_CLIENT_SECRET`: Your Reddit client secret.
-   `REDDIT_USER_AGENT`: Your Reddit user agent.
-   `REDDIT_USERNAME`: Your Reddit username.
-   `REDDIT_PASSWORD`: Your Reddit password.
-   `VITE_API_BASE_URL`: The base URL for the API.
-   `CLIENT_PORT`: The port for the client application.

## Deployment

The application is deployed and can be accessed at [https://game-tracker.mbwin.bet/](https://game-tracker.mbwin.bet/).