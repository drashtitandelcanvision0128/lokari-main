import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.join(__dirname, 'templates');

const cache = new Map();

function registerHelpers() {
  Handlebars.registerHelper('eq', (a, b) => a === b);
}

function compileTemplate(relativePath) {
  const key = relativePath.replace(/\\/g, '/');
  if (cache.has(key)) {
    return cache.get(key);
  }

  const fullPath = path.join(templatesRoot, relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const compiled = Handlebars.compile(source);
  cache.set(key, compiled);
  return compiled;
}

/** Render a template file relative to templates/ (e.g. "otp/html.hbs"). */
export function renderTemplate(relativePath, context = {}) {
  registerHelpers();
  const template = compileTemplate(relativePath);
  return template({
    year: new Date().getFullYear(),
    ...context,
  });
}

/**
 * Render HTML with base layout + plain-text body.
 * @param {{ html: string, text: string }} parts — paths relative to templates/
 */
export function renderEmail(parts, context = {}) {
  const shared = {
    year: new Date().getFullYear(),
    ...context,
  };

  const bodyHtml = renderTemplate(parts.html, shared);
  const html = renderTemplate('layouts/base.hbs', {
    ...shared,
    body: bodyHtml,
  });
  const text = parts.text ? renderTemplate(parts.text, shared) : undefined;

  return { html, text };
}

/** Clear compiled cache (useful in tests). */
export function clearTemplateCache() {
  cache.clear();
}
