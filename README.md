# Lexicon

Lexicon is a small browser-based English dictionary app. Search a word, view definitions, examples, synonyms, antonyms, phonetics, pronunciation audio, and source links.

## Features

- Word lookup through the Free Dictionary API
- Suggested starter words
- Definitions grouped by part of speech
- Example sentences when available
- Synonym and antonym chips that can be searched with one click
- Pronunciation audio when the API provides it
- Responsive layout for desktop and mobile screens

## Project Structure

```text
.
|-- dihhhtionary.html
|-- script.js
|-- style.css
`-- README.md
```

## Getting Started

No build step or package installation is required.

1. Open `dihhhtionary.html` in a web browser.
2. Type a word into the search box.
3. Press `Enter` or click `Look Up`.

The app needs an internet connection because it loads Google Fonts and fetches dictionary data from:

```text
https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

## Files

- `dihhhtionary.html` contains the page structure.
- `style.css` contains the visual design and responsive styles.
- `script.js` handles search, API requests, result rendering, word chips, and audio playback.

## Credits

Dictionary data is provided by the Free Dictionary API at `dictionaryapi.dev`.
