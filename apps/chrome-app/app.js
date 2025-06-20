export const app = _component("chrome-app", html`
    <main-container>
        <h1>Search the Web</h1>
        <div class="search-container">
            <input type="text" id="search-input" placeholder="Enter your search query">
            <button id="search-button">Search</button>
        </div>
    </main-container>
    <style>
        :host {
            --background-color: #121212;
            --text-color: #ffffff;
            --input-bg-color: #1e1e1e;
            --input-text-color: #ffffff;
            --button-bg-color: #6200ea;
            --button-hover-bg-color: #3700b3;
            --button-text-color: #ffffff;
        }

        main-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: var(--background-color);
            color: var(--text-color);
            font-family: 'Roboto', Arial, sans-serif;
            text-align: center;
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
        }

        .search-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }

        input {
            width: 300px;
            padding: 10px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            background-color: var(--input-bg-color);
            color: var(--input-text-color);
            outline: none;
        }

        button {
            padding: 10px 20px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            background-color: var(--button-bg-color);
            color: var(--button-text-color);
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        button:hover {
            background-color: var(--button-hover-bg-color);
        }
    </style>
`, boot_up_app);

// App name
export const app_name = "chrome-app";

// Boot-up function to handle search
function boot_up_app(app) {
    const searchInput = app.querySelector("#search-input");
    const searchButton = app.querySelector("#search-button");

    if (searchInput && searchButton) {
        searchButton.addEventListener("click", () => {
            const query = searchInput.value.trim();
            if (!query) {
                alert("Please enter a search query.");
                return;
            }

            // Redirect to a search engine (e.g., Google)
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(searchUrl, "_blank");
        });
    }
}