import fs from 'fs';
import path from 'path';
import { translate } from 'bing-translate-api';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, 'src', 'locales');
const langs = ['hi', 'bn', 'mr', 'ta', 'te'];

// Mapping for Bing translator if necessary
const bingLangs = {
  hi: 'hi',
  bn: 'bn',
  mr: 'mr',
  ta: 'ta',
  te: 'te'
};

const enPath = path.join(localesDir, 'en', 'translation.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const newlyAdded = enData.newlyAdded || {};
const newKeys = Object.keys(newlyAdded);

async function processTranslations() {
  if (newKeys.length === 0) return;
  console.log(`Found ${newKeys.length} strings to translate.`);

  for (const lang of langs) {
    const filePath = path.join(localesDir, lang, 'translation.json');
    let existing = {};
    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    
    if (!existing.newlyAdded) existing.newlyAdded = {};
    
    let count = 0;
    for (const key of newKeys) {
      if (!existing.newlyAdded[key] || existing.newlyAdded[key] === newlyAdded[key]) {
        try {
          const res = await translate(newlyAdded[key], null, bingLangs[lang]);
          existing.newlyAdded[key] = res.translation;
          count++;
          if (count % 10 === 0) console.log(`Translated ${count} items for ${lang}...`);
          await new Promise(r => setTimeout(r, 100)); // small delay
        } catch (e) {
          console.error(`Error translating to ${lang}:`, e.message);
          existing.newlyAdded[key] = newlyAdded[key]; // fallback to english
        }
      }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
    console.log(`Saved ${lang}/translation.json. Translated ${count} items.`);
  }
}

processTranslations().then(() => console.log('Done!'));
