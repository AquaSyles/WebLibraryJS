# WebLibraryJS

## Dependencies
"dependencies": {
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "ejs": "^3.1.10",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.12.0",
    "nodemon": "^3.1.9"
}

## Running the Project
You can run the project, with the following script:

"dev": nodemon -r dotenv/config src/index.js dotenv_config_path=$ENV_PATH

Make sure to set `ENV_PATH` to the path of your `.env` file before running the script.
