# Project Overview

This project is a web-based DeFi analytics dashboard that allows users to track their investment records and analyze profit and loss (PnL). The frontend is built with vanilla JavaScript, HTML, and CSS, using Vite for development and bundling. It communicates with a GraphQL API to fetch and display DeFi data.

The application features a tabbed interface to switch between "Records" and "PnL" views. Users can filter data by date range, accounts, Uniswap V2 pairs, and Uniswap V3 pools. The "Records" tab displays a detailed history of transactions, while the "PnL" tab is intended for future implementation of profit and loss analysis.

Authentication is handled via Google Identity Services, and the application dynamically populates filter options and displays data based on user-specific information retrieved from the backend.

# Building and Running

To run the project locally for development, use the following command:

```bash
npx vite --port 8099 --host
```

To deploy the project, you can use a service like Surge:

```bash
# Install Surge CLI globally (if not already installed)
npm install --global surge

# Deploy the project from app directory
cd app
surge ./ defimap-myrecords.surge.sh
```

# Development Conventions

*   **Frontend:** The frontend is written in vanilla JavaScript, organized into modules for handling the API, filters, records, and main application logic.
*   **API:** The application communicates with a GraphQL API. The available queries and mutations are defined in the `schema.graphqls` file.
*   **Styling:** The UI is styled using plain CSS, as defined in `app/styles.css`.
*   **Authentication:** Google Identity Services is used for user authentication.
*   **Dependencies:** The project uses `vite` for development. There is no `package.json` file, so dependencies are likely managed globally or through other means.
