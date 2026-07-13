import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderTemplate } from './render.js';
import { templates } from './templates.js';

// Helper: find template by id and render with given values, applying the
// template's derived() step first — mirrors generateAlertText() in script.js.
function renderWith(tmpl, values) {
  const merged = typeof tmpl.derived === 'function'
    ? { ...values, ...tmpl.derived(values) }
    : values;
  return renderTemplate(tmpl.template, merged);
}

const template360 = templates.find(t => t.id === 'autism-elopement-360');
assert.ok(template360, 'autism-elopement-360 template must exist');
function render(values) {
  return renderWith(template360, values);
}

const template90 = templates.find(t => t.id === 'autism-elopement-90');
assert.ok(template90, 'autism-elopement-90 template must exist');
function render90(values) {
  return renderWith(template90, values);
}

// --- renderTemplate ----------------------------------------------------------

describe('renderTemplate', () => {
  test('replaces simple {{field}} tokens', () => {
    const result = renderTemplate('Hello {{name}}!', { name: 'World' });
    assert.equal(result, 'Hello World!');
  });

  test('replaces missing {{field}} with empty string', () => {
    const result = renderTemplate('Hello {{name}}!', {});
    assert.equal(result, 'Hello !');
  });

  test('includes {{#field}} block when value is truthy', () => {
    const result = renderTemplate('a{{#x}}, b{{/x}}', { x: 'yes' });
    assert.equal(result, 'a, b');
  });

  test('omits {{#field}} block when value is falsy', () => {
    const result = renderTemplate('a{{#x}}, b{{/x}}', { x: '' });
    assert.equal(result, 'a');
  });

  test('omits {{#field}} block when key is absent', () => {
    const result = renderTemplate('a{{#x}}, b{{/x}}', {});
    assert.equal(result, 'a');
  });
});

// --- Autism elopement 360 template -------------------------------------------

describe('autism-elopement-360 template', () => {

  // Agency
  test('agency renders with colon prefix (no brackets) when present', () => {
    const out = render({ agency: 'Cary PD', 'child-name': 'Alex' });
    assert.match(out, /^Cary PD: /);
  });

  test('no agency prefix when agency is absent', () => {
    const out = render({ 'child-name': 'Alex' });
    assert.match(out, /^MISSING CHILD/);
  });

  // Descriptor field order: name, age, race & gender, clothing, descriptor
  test('fields render in order: name, age, race & gender, clothing, descriptor', () => {
    const out = render({
      'child-name': 'Jane Doe',
      'race-gender': 'white female',
      age: '4',
      clothing: 'pink pajamas',
      descriptor: 'barefoot',
    });
    assert.ok(
      out.includes('Jane Doe, age 4, white female, pink pajamas, barefoot'),
      `Unexpected order in: ${out}`
    );
  });

  test('age renders with "age" prefix', () => {
    const out = render({ 'child-name': 'Alex', age: '7' });
    assert.ok(out.includes('Alex, age 7'), `Expected "Alex, age 7" in: ${out}`);
  });

  // Location
  test('location renders with "Last seen near" prefix', () => {
    const out = render({ location: '800 Hill Avenue' });
    assert.ok(out.includes('Last seen near 800 Hill Avenue.'));
  });

  test('empty location omits the last seen clause', () => {
    const out = render({ location: '' });
    assert.ok(!out.includes('Last seen near'));
  });

  // Water list (ponds before pools)
  test('water list begins with ponds, pools', () => {
    const out = render({});
    assert.ok(out.includes('(ponds, pools, drains, spas, tanks - even if covered or dirty)'));
  });

  // Optional field skipping
  test('missing clothing produces no orphan comma', () => {
    const out = render({ 'child-name': 'Alex', 'race-gender': 'white male', clothing: '' });
    assert.ok(!out.includes(', ,'), `Orphan comma in: ${out}`);
    assert.ok(!out.includes(',  '), `Double-space comma in: ${out}`);
  });

  test('missing race & gender is skipped cleanly', () => {
    const out = render({ 'child-name': 'Alex', 'race-gender': '', age: '7' });
    assert.ok(out.includes('Alex, age 7'));
  });

  // Checkboxes
  test('non-speaking: true includes NONSPEAKING', () => {
    const out = render({ 'child-name': 'Alex', 'non-speaking': true });
    assert.ok(out.includes('NONSPEAKING'));
  });

  test('non-speaking: false omits NONSPEAKING', () => {
    const out = render({ 'child-name': 'Alex', 'non-speaking': false });
    assert.ok(!out.includes('NONSPEAKING'));
  });

  // Empty / default state — no dangling comma when no name is entered, and
  // NONSPEAKING still shows even when it is the only descriptor element
  test('empty render (no name) has no dangling comma before NONSPEAKING', () => {
    const out = render({ 'non-speaking': true });
    assert.ok(!out.includes(', NONSPEAKING'), `Dangling comma in: ${out}`);
    assert.ok(!out.includes('RISK. ,'), `Dangling comma in: ${out}`);
    assert.ok(out.includes('EXTREME DROWNING RISK. NONSPEAKING. SEARCH ALL WATER NOW'), `Unexpected joint in: ${out}`);
  });

  test('may-hide: true includes "Child may HIDE."', () => {
    const out = render({ 'may-hide': true });
    assert.ok(out.includes('Child may HIDE.'));
  });

  test('may-hide: false omits "Child may HIDE."', () => {
    const out = render({ 'may-hide': false });
    assert.ok(!out.includes('Child may HIDE.'));
  });

  // Static directives always present
  test('SEARCH ALL WATER NOW always present', () => {
    const out = render({});
    assert.ok(out.includes('SEARCH ALL WATER NOW'));
  });

  test('"Stay at water if safe" always present', () => {
    const out = render({});
    assert.ok(out.includes('Stay at water if safe'));
  });

  test('alert ends with "IF SEEN, call 9-1-1."', () => {
    const out = render({});
    assert.ok(out.endsWith('IF SEEN, call 9-1-1.'), `Unexpected ending in: ${out}`);
  });

  // Smoke test — full alert within character limit
  test('full alert with all fields is ≤ 360 characters', () => {
    const out = render({
      agency: 'Smithtown Police Department',
      'child-name': 'Jane Doe',
      'race-gender': 'white female',
      age: '4',
      clothing: 'pink pajamas',
      descriptor: 'barefoot, on foot',
      location: '800 Hill Avenue',
      'non-speaking': true,
      'may-hide': true,
    });
    assert.ok(
      out.length <= 360,
      `Alert is ${out.length} characters (limit: 360):\n${out}`
    );
  });
});

// --- Autism elopement 90 template --------------------------------------------

describe('autism-elopement-90 template', () => {

  // Static text
  test('MISSING CHILD w/ AUTISM always present', () => {
    assert.ok(render90({}).includes('MISSING CHILD w/ AUTISM'));
  });

  test('SEARCH WATER NOW always present', () => {
    assert.ok(render90({}).includes('SEARCH WATER NOW.'));
  });

  // Agency
  test('agency renders with colon prefix (no brackets) when present', () => {
    const out = render90({ agency: 'Cary PD' });
    assert.match(out, /^Cary PD: /);
  });

  test('no agency prefix when agency is absent', () => {
    const out = render90({});
    assert.match(out, /^MISSING CHILD w\/ AUTISM/);
  });

  // Descriptor: age, race & gender, clothing
  test('age, race & gender, and clothing render between AUTISM and SEARCH', () => {
    const out = render90({ 'race-gender': 'white female', age: '4', clothing: 'pink pajamas' });
    assert.ok(
      out.includes('MISSING CHILD w/ AUTISM, age 4, white female, pink pajamas. SEARCH WATER NOW.'),
      `Unexpected descriptor in: ${out}`
    );
  });

  test('static-only render has no orphan punctuation', () => {
    const out = render90({});
    assert.equal(out, 'MISSING CHILD w/ AUTISM. SEARCH WATER NOW.');
  });

  // Smoke test — static-only render within character limit
  test('static-only render is ≤ 90 characters', () => {
    const out = render90({});
    assert.ok(
      out.length <= 90,
      `Static alert is ${out.length} characters (limit: 90):\n${out}`
    );
  });
});
