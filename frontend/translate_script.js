import { Project, SyntaxKind } from 'ts-morph';
import { translate } from '@vitalets/google-translate-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const project = new Project({
  tsConfigFilePath: path.join(__dirname, 'tsconfig.app.json'), // or tsconfig.json
});

const sourceFiles = project.addSourceFilesAtPaths(['src/pages/**/*.tsx', 'src/components/**/*.tsx', 'src/App.tsx', 'src/main.tsx']);

const newTranslations = {};

function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
}

function generateKey(text) {
  let clean = text.trim().replace(/[^a-zA-Z0-9 ]/g, '');
  let words = clean.split(' ').slice(0, 4);
  let key = toCamelCase(words.join(' '));
  if (!key) key = 'text' + Math.floor(Math.random() * 10000);
  return key;
}

let filesModified = 0;

for (const sf of sourceFiles) {
  const text = sf.getFullText();
  // We no longer skip if it includes 'useTranslation' because we want to catch untranslated strings in partially translated files.
  
  let hasChanges = false;
  
  const jsxTexts = sf.getDescendantsOfKind(SyntaxKind.JsxText);
  for (const node of jsxTexts) {
    const val = node.getLiteralText().trim();
    if (val && val.match(/[a-zA-Z]/)) {
      const key = generateKey(val);
      newTranslations[key] = val;
      node.replaceWithText(`{t('newlyAdded.${key}')}`);
      hasChanges = true;
    }
  }

  const jsxAttributes = sf.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  for (const attr of jsxAttributes) {
    const name = attr.getNameNode().getText();
    if (['placeholder', 'alt', 'title'].includes(name)) {
      const init = attr.getInitializer();
      if (init && init.getKind() === SyntaxKind.StringLiteral) {
        const val = init.getLiteralText();
        if (val && val.match(/[a-zA-Z]/)) {
          const key = generateKey(val);
          newTranslations[key] = val;
          init.replaceWithText(`{t('newlyAdded.${key}')}`);
          hasChanges = true;
        }
      }
    }
  }

  if (hasChanges) {
    if (!sf.getImportDeclaration(dec => dec.getModuleSpecifierValue() === 'react-i18next')) {
      sf.addImportDeclaration({
        namedImports: ['useTranslation'],
        moduleSpecifier: 'react-i18next'
      });
    }

    const functions = sf.getFunctions();
    for (const f of functions) {
      if (f.getName() && f.getName()[0] === f.getName()[0].toUpperCase()) {
        const bodyText = f.getBody()?.getText() || '';
        if (!bodyText.includes('useTranslation()')) {
          f.insertStatements(0, 'const { t } = useTranslation();');
        }
      }
    }

    const varDecls = sf.getVariableDeclarations();
    for (const v of varDecls) {
      if (v.getName() && v.getName()[0] === v.getName()[0].toUpperCase()) {
        const init = v.getInitializer();
        if (init && (init.getKind() === SyntaxKind.ArrowFunction || init.getKind() === SyntaxKind.FunctionExpression)) {
          const body = init.getBody();
          if (body.getKind() === SyntaxKind.Block) {
             const bodyText = body.getText();
             if (!bodyText.includes('useTranslation()')) {
                 body.asKind(SyntaxKind.Block).insertStatements(0, 'const { t } = useTranslation();'); 
             }
          }
        }
      }
    }

    filesModified++;
  }
}

if (filesModified > 0) {
  project.saveSync();
  console.log(`Modified ${filesModified} files.`);
} else {
  console.log('No files modified.');
}

const localesDir = path.join(__dirname, 'src', 'locales');
const langs = ['en', 'hi', 'bn', 'mr', 'ta', 'te'];

async function processTranslations() {
  const newKeys = Object.keys(newTranslations);
  if (newKeys.length === 0) return;
  
  console.log(`Found ${newKeys.length} new strings to translate.`);

  for (const lang of langs) {
    const filePath = path.join(localesDir, lang, 'translation.json');
    let existing = {};
    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    
    if (!existing.newlyAdded) existing.newlyAdded = {};
    
    for (const key of newKeys) {
      if (!existing.newlyAdded[key]) {
        existing.newlyAdded[key] = newTranslations[key]; // Just use English as fallback
      }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
    console.log(`Saved ${lang}/translation.json`);
  }
}

processTranslations().then(() => console.log('Done!'));
