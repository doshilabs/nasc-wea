/**
 * Autistic Elopement — 360 characters
 *
 * Based on the NASC SafeSearch for Autism protocol.
 * See: https://www.autismsafetycouncil.org
 *
 * Template syntax:
 *   {{field}}                     — insert field value
 *   {{#field}}...{{/field}}       — include only if field is present / checkbox is checked
 */

export default {
  id: 'autism-elopement-360',
  name: 'Autistic Elopement — 360 characters',
  charLimit: 360,

  template:
    '{{#agency}}{{agency}}: {{/agency}}' +
    'MISSING CHILD with AUTISM. EXTREME DROWNING RISK. ' +
    '{{child-desc}}' +
    '{{#location}}Last seen near {{location}}. {{/location}}' +
    'SEARCH ALL WATER NOW (ponds, pools, drains, spas, tanks - even if covered or dirty) and inside cars.' +
    '{{#may-hide}} Child may HIDE.{{/may-hide}} ' +
    'Stay at water if safe. IF SEEN, call 9-1-1.',

  // Builds the child-description clause by joining only the fields that are
  // present, so the list shows whenever ANY element (including NONSPEAKING) is
  // set — without a leading comma or filler word, and omitted entirely if empty.
  derived(v) {
    const parts = [];
    if (v['child-name'])   parts.push(v['child-name']);
    if (v['age'])          parts.push('age ' + v['age']);
    if (v['race-gender'])  parts.push(v['race-gender']);
    if (v['clothing'])     parts.push(v['clothing']);
    if (v['descriptor'])   parts.push(v['descriptor']);
    if (v['non-speaking']) parts.push('NONSPEAKING');
    return { 'child-desc': parts.length ? parts.join(', ') + '. ' : '' };
  },

  fields: [
    {
      id: 'agency',
      label: 'Issuing agency',
      type: 'text',
      placeholder: 'e.g. Smithtown Police Department',
      hint: "Consider removing 'department' or 'office' from agency names if you need to shorten the message.",
    },
    {
      id: 'child-name',
      label: "Child's full name",
      type: 'text',
      placeholder: 'e.g. Jane Doe',
    },
    {
      id: 'age',
      label: 'Age',
      type: 'number',
      placeholder: 'e.g. 4',
      min: 1,
      max: 17,
    },
    {
      id: 'race-gender',
      label: 'Race & gender',
      type: 'text',
      placeholder: 'e.g. white female',
      autocapitalize: 'none',
    },
    {
      id: 'clothing',
      label: 'Clothing',
      type: 'text',
      placeholder: 'e.g. pink pajamas',
      autocapitalize: 'none',
    },
    {
      id: 'descriptor',
      label: 'Identifiable clothing or description',
      type: 'text',
      placeholder: 'e.g. barefoot',
      hint: 'e.g. in diapers, on foot, barefoot',
      autocapitalize: 'none',
    },
    {
      id: 'location',
      label: 'Last seen',
      type: 'text',
      placeholder: 'e.g. 800 Hill Avenue',
      autocapitalize: 'none',
    },
  ],

  checkboxes: [
    {
      id: 'non-speaking',
      label: 'NONSPEAKING',
      description: 'Child cannot verbally communicate or call for help',
      default: true,
    },
    {
      id: 'may-hide',
      label: 'Child may HIDE',
      description: 'Child may hide from rescuers rather than approach them',
      default: true,
    },
  ],
};
