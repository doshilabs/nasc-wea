import { templates } from './templates.js';
import { renderTemplate, normalizeValues } from './render.js';

// --- State -------------------------------------------------------------------

let activeTemplate = templates[0];
let isEditMode = false;
let editOriginalText = '';

// --- DOM refs ----------------------------------------------------------------

const templateSelect   = document.getElementById('template-select');
const fieldsContainer  = document.getElementById('fields-container');
const cbContainer      = document.getElementById('checkboxes-container');
const previewEl        = document.getElementById('alert-preview');
const charCountEl      = document.getElementById('char-count');
const charCounterEl    = document.getElementById('char-counter');
const charBadgeEl      = document.getElementById('char-badge');
const copyBtn          = document.getElementById('copy-btn');
const editBtn          = document.getElementById('edit-btn');
const copyConfirmEl    = document.getElementById('copy-confirm');
const editingBadgeEl   = document.getElementById('editing-badge');
const formPanel        = document.querySelector('.form-panel');

// --- Template selector -------------------------------------------------------

function populateSelector() {
  templateSelect.innerHTML = '';
  for (const t of templates) {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    templateSelect.appendChild(opt);
  }
}

// --- Dynamic form rendering --------------------------------------------------

function buildFieldGroup(field) {
  const group = document.createElement('div');
  group.className = 'field-group' + (field.type === 'number' ? ' field-group--age' : '');

  const label = document.createElement('label');
  label.htmlFor = field.id;
  label.textContent = field.label;
  group.appendChild(label);

  if (field.hint) {
    const hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.textContent = field.hint;
    group.appendChild(hint);
  }

  const input = document.createElement('input');
  input.type = field.type || 'text';
  input.id = field.id;
  input.placeholder = field.placeholder || '';
  input.autocomplete = 'off';
  input.autocorrect = 'off';
  input.spellcheck = false;
  if (field.min !== undefined) input.min = field.min;
  if (field.max !== undefined) input.max = field.max;
  if (field.type === 'number') input.inputMode = 'numeric';
  group.appendChild(input);

  return group;
}

function buildCheckbox(cb) {
  const label = document.createElement('label');
  label.className = 'checkbox-label';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = cb.id;
  input.checked = cb.default !== false;

  const custom = document.createElement('span');
  custom.className = 'checkbox-custom';

  const text = document.createElement('span');
  text.className = 'checkbox-text';

  const strong = document.createElement('strong');
  strong.textContent = cb.label;

  const desc = document.createElement('span');
  desc.className = 'checkbox-desc';
  desc.textContent = cb.description;

  text.appendChild(strong);
  text.appendChild(desc);
  label.appendChild(input);
  label.appendChild(custom);
  label.appendChild(text);

  return label;
}

function loadTemplate(tmpl) {
  activeTemplate = tmpl;

  document.getElementById('template-desc').innerHTML = tmpl.description || '';
  document.getElementById('char-limit-display').textContent = tmpl.charLimit;
  document.getElementById('wea-note-limit').textContent = tmpl.charLimit;

  fieldsContainer.innerHTML = '';
  for (const field of tmpl.fields) {
    fieldsContainer.appendChild(buildFieldGroup(field));
  }

  cbContainer.innerHTML = '';
  for (const cb of tmpl.checkboxes) {
    cbContainer.appendChild(buildCheckbox(cb));
  }

  attachFieldListeners();
  updatePreview();
}

// --- Value collection --------------------------------------------------------

function getFieldValues() {
  const values = {};
  for (const field of activeTemplate.fields) {
    const el = document.getElementById(field.id);
    values[field.id] = el ? el.value.trim() : '';
  }
  for (const cb of activeTemplate.checkboxes) {
    const el = document.getElementById(cb.id);
    values[cb.id] = el ? el.checked : cb.default !== false;
  }
  return values;
}

// --- Alert generation --------------------------------------------------------

function generateAlertText() {
  const raw = getFieldValues();
  const normalized = normalizeValues(activeTemplate.fields, raw);
  return renderTemplate(activeTemplate.template, normalized);
}

// --- Preview + counter -------------------------------------------------------

function getCharState(len) {
  if (len > activeTemplate.charLimit) return 'over';
  if (len >= activeTemplate.charCaution) return 'caution';
  return 'safe';
}

function updateCounter(len) {
  const state = getCharState(len);
  charCountEl.textContent = len;
  charCounterEl.dataset.state = state;

  if (state === 'safe') {
    charBadgeEl.hidden = true;
  } else {
    charBadgeEl.hidden = false;
    charBadgeEl.textContent = state === 'caution' ? 'Near limit' : 'Over limit';
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderPreview(alertText, rawValues) {
  let html = escapeHtml(alertText);
  // Highlight entered field values with semi-bold
  const vals = Object.values(rawValues).filter(v => v && typeof v === 'string');
  for (const val of vals) {
    const escaped = escapeHtml(val);
    html = html.replace(escaped, '<span class="dynamic-field">' + escaped + '</span>');
  }
  return html;
}

function updatePreview() {
  if (isEditMode) return;

  const alertText = generateAlertText();
  const raw = getFieldValues();
  previewEl.innerHTML = renderPreview(alertText, raw);
  updateCounter(alertText.length);
  updateCopyButton(alertText.length);
}

function updateCopyButton(len) {
  if (len > activeTemplate.charLimit) {
    copyBtn.textContent = 'Copy Anyway (Over Limit)';
    copyBtn.classList.add('over-limit');
  } else {
    copyBtn.textContent = 'Copy to Clipboard';
    copyBtn.classList.remove('over-limit');
  }
}

// --- Edit mode ---------------------------------------------------------------

function enterEditMode() {
  const alertText = generateAlertText();
  editOriginalText = alertText;

  // Replace div with textarea
  const ta = document.createElement('textarea');
  ta.id = 'alert-edit';
  ta.value = alertText;
  ta.setAttribute('aria-label', 'Edit alert text');
  previewEl.style.display = 'none';
  previewEl.parentNode.insertBefore(ta, previewEl);

  // Wire counter to textarea
  ta.addEventListener('input', () => {
    updateCounter(ta.value.length);
    updateCopyButton(ta.value.length);
  });

  // Gray out form
  formPanel.classList.add('form-panel--disabled');
  editingBadgeEl.hidden = false;

  editBtn.textContent = 'Reset';
  isEditMode = true;
}

function exitEditMode(force = false) {
  const ta = document.getElementById('alert-edit');
  if (!ta) return;

  const hasChanges = ta.value !== editOriginalText;
  if (!force && hasChanges) {
    if (!confirm('Discard manual edits and regenerate from fields?')) return;
  }

  ta.remove();
  previewEl.style.display = '';
  formPanel.classList.remove('form-panel--disabled');
  editingBadgeEl.hidden = true;
  editBtn.textContent = 'Edit';
  isEditMode = false;

  updatePreview();
}

// --- Copy to clipboard -------------------------------------------------------

let copyResetTimer = null;

function getAlertTextForCopy() {
  if (isEditMode) {
    const ta = document.getElementById('alert-edit');
    return ta ? ta.value : '';
  }
  return generateAlertText();
}

function showCopyFeedback() {
  copyConfirmEl.hidden = false;
  copyConfirmEl.textContent = 'Copied!';
  if (copyResetTimer) clearTimeout(copyResetTimer);
  copyResetTimer = setTimeout(() => { copyConfirmEl.hidden = true; }, 2500);
}

async function handleCopy() {
  const text = getAlertTextForCopy();
  try {
    await navigator.clipboard.writeText(text);
    showCopyFeedback();
  } catch (_err) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showCopyFeedback();
    } catch (_fallbackErr) {
      const range = document.createRange();
      range.selectNodeContents(previewEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copyConfirmEl.hidden = false;
      copyConfirmEl.textContent = 'Text selected — press Ctrl+C / Cmd+C to copy';
    }
  }
}

// --- Event wiring ------------------------------------------------------------

function attachFieldListeners() {
  const inputs = fieldsContainer.querySelectorAll('input[type="text"], input[type="number"]');
  const checkboxes = cbContainer.querySelectorAll('input[type="checkbox"]');
  inputs.forEach(el => el.addEventListener('input', updatePreview));
  checkboxes.forEach(el => el.addEventListener('change', updatePreview));
}

function init() {
  populateSelector();

  templateSelect.addEventListener('change', () => {
    const tmpl = templates.find(t => t.id === templateSelect.value);
    if (tmpl) loadTemplate(tmpl);
  });

  copyBtn.addEventListener('click', handleCopy);

  editBtn.addEventListener('click', () => {
    if (isEditMode) exitEditMode();
    else enterEditMode();
  });

  loadTemplate(activeTemplate);
}

document.addEventListener('DOMContentLoaded', init);
