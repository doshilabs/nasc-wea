/**
 * Autistic Elopement — 90 characters (Standard WEA)
 *
 * Based on the NASC SafeSearch for Autism protocol.
 * See: https://www.autismsafetycouncil.org
 *
 * Template syntax:
 *   {{field}}                     — insert field value
 *   {{#field}}...{{/field}}       — include only if field is present / checkbox is checked
 */

export default {
  id: 'autism-elopement-90',
  name: 'Autistic Elopement — 90 characters',
  charLimit: 90,

  template:
    '{{#agency}}{{agency}}: {{/agency}}' +
    'MISSING CHILD w/ AUTISM' +
    '{{child-desc}}' +
    '. SEARCH WATER NOW.',

  // Joins the present description fields (age before race/gender) into one
  // clause, so reordering is centralized and no dangling comma can appear.
  derived(v) {
    const parts = [];
    if (v['age'])         parts.push('age ' + v['age']);
    if (v['race-gender']) parts.push(v['race-gender']);
    if (v['clothing'])    parts.push(v['clothing']);
    return { 'child-desc': parts.length ? ', ' + parts.join(', ') : '' };
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
  ],

  checkboxes: [],
};
