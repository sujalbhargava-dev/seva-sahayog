import fs from 'fs';
import path from 'path';
import { translate } from 'bing-translate-api';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, 'src', 'locales');
const langs = ['hi', 'bn', 'mr', 'ta', 'te'];

const bingLangs = { hi: 'hi', bn: 'bn', mr: 'mr', ta: 'ta', te: 'te' };

const enPath = path.join(localesDir, 'en', 'translation.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

async function translateMissing(enObj, langObj, langCode) {
  let count = 0;
  async function traverse(enNode, langNode) {
    for (const key in enNode) {
      if (typeof enNode[key] === 'object' && enNode[key] !== null) {
        if (!langNode[key]) langNode[key] = {};
        await traverse(enNode[key], langNode[key]);
      } else {
        if (!langNode[key] || langNode[key] === enNode[key]) {
          try {
            const res = await translate(enNode[key], null, bingLangs[langCode]);
            langNode[key] = res.translation;
            count++;
            if (count % 10 === 0) console.log(`Translated ${count} missing items for ${langCode}...`);
            await new Promise(r => setTimeout(r, 100)); // small delay
          } catch (e) {
            console.error(`Error translating to ${langCode}:`, e.message);
            langNode[key] = enNode[key]; // fallback to english
          }
        }
      }
    }
  }
  await traverse(enObj, langObj);
  return count;
}

async function processTranslations() {
  for (const lang of langs) {
    const filePath = path.join(localesDir, lang, 'translation.json');
    let existing = {};
    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    
    console.log(`Checking missing translations for ${lang}...`);
    const count = await translateMissing(enData, existing, lang);
    
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
    console.log(`Saved ${lang}/translation.json. Translated ${count} missing items.`);
  }
}

processTranslations().then(() => console.log('Done!'));
