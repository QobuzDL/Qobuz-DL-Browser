# Qobuz-DL-Browser

A static web application for downloading music from [Qobuz](https://www.qobuz.com/), supporting audio qualities up to 24-bit / 192kHz FLAC.

## Features

- Search for any album or track.
- Download music files directly from your browser.
- Simple and clean user interface.

## Prerequisites

- Python 3.8 or higher
- Flask
- Qobuz tokens (free tokens can be found [here](https://rentry.org/firehawk52#qobuz-tokens))

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/QobuzDL/Qobuz-DL-Browser
   ```

2. **Navigate to the project directory:**

   ```bash
   cd Qobuz-DL-Browser
   ```

3. **Install Flask:**

   ```bash
   pip install flask
   ```

6. **Enter Qobuz tokens into static/tokens.json:**

   Tokens should be entered in JSON array format:

   ```json
   ["Token1", "Token2"]
   ```

## Usage

1. **Run the application:**

   ```bash
   py main.py
   ```

   The app will start on `http://127.0.0.1:25565/` by defualt.

2. **Access the web interface:**

   Open your web browser and navigate to `http://127.0.0.1:25565/` to use the application.

3. **Search and download music:**

   Use the search bar to find music tracks. Click on the download button next to an album/track to download it.

## Discord Server

We have a public Discord server for discussing music and changes to this app. If you would like to help contribute or whatever, join the server: https://discord.gg/mWQ6bCfkfA.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.