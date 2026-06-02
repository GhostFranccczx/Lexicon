const input = document.getElementById('word-input');
const btn = document.getElementById('search-btn');
const area = document.getElementById('result-area');
const suggestions = document.querySelector('.suggestions');

btn.addEventListener('click', () => lookup(input.value.trim()));

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    lookup(input.value.trim());
  }
});

suggestions.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const chip = event.target.closest('[data-word]');
  if (chip) {
    lookup(chip.dataset.word);
  }
});

area.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const wordChip = event.target.closest('[data-word]');
  if (wordChip) {
    lookup(wordChip.dataset.word);
    return;
  }

  const playButton = event.target.closest('[data-audio]');
  if (playButton) {
    playAudio(playButton.dataset.audio);
  }
});

function lookup(word) {
  if (!word) return;

  input.value = word;
  area.innerHTML = '<div class="loading">Consulting the lexicon&hellip;</div>';

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.title === 'No Definitions Found') {
        area.innerHTML = `
          <div class="error-card">
            <h3>Word not found</h3>
            <p>No definitions found for "<em>${escapeHTML(word)}</em>". Try a different spelling.</p>
          </div>`;
        return;
      }

      renderResults(data);
    })
    .catch(() => {
      area.innerHTML = `
        <div class="error-card">
          <h3>Connection error</h3>
          <p>Could not reach the dictionary. Please check your connection.</p>
        </div>`;
    });
}

function renderResults(entries) {
  let html = '';

  entries.forEach((entry) => {
    let phoneticText = entry.phonetic || '';
    let audioUrl = '';

    if (entry.phonetics && entry.phonetics.length) {
      const withAudio = entry.phonetics.find((phonetic) => phonetic.audio);
      if (withAudio) {
        audioUrl = safeURL(withAudio.audio);
        phoneticText = phoneticText || withAudio.text || '';
      }

      if (!phoneticText) {
        const withText = entry.phonetics.find((phonetic) => phonetic.text);
        if (withText) phoneticText = withText.text;
      }
    }

    const playBtn = audioUrl
      ? `<button class="play-btn" type="button" data-audio="${escapeAttr(audioUrl)}" title="Hear pronunciation" aria-label="Hear pronunciation">
          <svg class="play-icon" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><polygon points="1,0 9,5 1,10"/></svg>
         </button>`
      : '';

    let meaningsHTML = '<div class="meanings-list">';
    (entry.meanings || []).forEach((meaning) => {
      meaningsHTML += `<div class="meaning-block">
        <div class="pos-label">${escapeHTML(meaning.partOfSpeech)}</div>`;

      (meaning.definitions || []).slice(0, 3).forEach((definition, index) => {
        meaningsHTML += `
          <div class="definition-item">
            <span class="def-num">${index + 1}.</span>
            <div class="def-content">
              <div class="def-text">${escapeHTML(definition.definition)}</div>
              ${definition.example ? `<div class="example-text">${escapeHTML(definition.example)}</div>` : ''}
            </div>
          </div>`;
      });

      if (meaning.synonyms && meaning.synonyms.length) {
        meaningsHTML += `
          <div class="synonyms-row">
            <span class="syn-label">Synonyms</span>${renderWordChips(meaning.synonyms)}
          </div>`;
      }

      if (meaning.antonyms && meaning.antonyms.length) {
        meaningsHTML += `
          <div class="antonyms-row">
            <span class="syn-label">Antonyms</span>${renderWordChips(meaning.antonyms)}
          </div>`;
      }

      meaningsHTML += '</div>';
    });
    meaningsHTML += '</div>';

    const originHTML = entry.origin
      ? `<div class="origin-section">
          <div class="origin-title">Etymology</div>
          <div class="origin-text">${escapeHTML(entry.origin)}</div>
        </div>`
      : '';

    const sourceUrl = safeURL(entry.sourceUrls && entry.sourceUrls[0]);

    html += `
      <div class="word-card">
        <div class="word-header">
          <div>
            <div class="word-title">${escapeHTML(entry.word)}</div>
            <div class="phonetics-row">
              ${phoneticText ? `<span class="phonetic-text">${escapeHTML(phoneticText)}</span>` : ''}
              ${playBtn}
            </div>
          </div>
          ${sourceUrl
            ? `<a class="origin-tag" href="${escapeAttr(sourceUrl)}" target="_blank" rel="noopener">Source &nearr;</a>`
            : ''}
        </div>
        ${meaningsHTML}
        ${originHTML}
      </div>`;
  });

  area.innerHTML = html;
}

function renderWordChips(words) {
  return words
    .slice(0, 4)
    .map((word) => `<button class="word-chip" type="button" data-word="${escapeAttr(word)}">${escapeHTML(word)}</button>`)
    .join('');
}

function playAudio(url) {
  const audioUrl = safeURL(url);
  if (!audioUrl) return;

  new Audio(audioUrl).play().catch(() => {});
}

function safeURL(url) {
  const value = String(url || '').trim();
  if (!value) return '';

  try {
    const parsed = value.startsWith('//')
      ? new URL(`https:${value}`)
      : new URL(value, window.location.href);

    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));
}

function escapeAttr(value) {
  return escapeHTML(value);
}
