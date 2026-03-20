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

  description:
    'Based on the NASC <strong>S-E-A-R-C-H</strong> protocol. ' +
    '<a href="https://cdn.prod.website-files.com/691df36c2bfdd23b8c789f03/69a70c2680bdb2d968255577_SafeSearch%20for%20Autism.pdf" ' +
    'target="_blank" rel="noopener">Download the SafeSearch for Autism protocol (PDF)</a>.',

  template:
    '{{#agency}}[{{agency}}]: {{/agency}}' +
    'MISSING CHILD with AUTISM. EXTREME DROWNING RISK. ' +
    '{{child-name}}' +
    '{{#description}}, {{description}}{{/description}}' +
    '{{#age}}, age {{age}}{{/age}}' +
    '{{#hair}}, {{hair}}{{/hair}}' +
    '{{#clothing}}, {{clothing}}{{/clothing}}' +
    '{{#non-speaking}}, NON-SPEAKING{{/non-speaking}}. ' +
    '{{#location}}LAST SEEN: {{location}}. {{/location}}' +
    'SEARCH ALL WATER NOW (nearby ponds/pools/lakes/all types even if dirty) and inside cars.' +
    '{{#may-hide}} Child may HIDE.{{/may-hide}} ' +
    'STAY AT WATER if able. IF SEEN, call 9-1-1',

  fields: [
    {
      id: 'agency',
      label: 'Issuing agency',
      type: 'text',
      placeholder: 'e.g. BPD',
    },
    {
      id: 'child-name',
      label: "Child's full name",
      type: 'text',
      placeholder: 'e.g. John Doe',
    },
    {
      id: 'description',
      label: 'Physical description',
      type: 'text',
      placeholder: 'e.g. white female',
      hint: 'Include race and gender',
    },
    {
      id: 'age',
      label: 'Age',
      type: 'number',
      placeholder: 'e.g. 8',
      min: 1,
      max: 17,
    },
    {
      id: 'hair',
      label: 'Hair',
      type: 'text',
      placeholder: 'e.g. brown',
      normalize: 'hair',
    },
    {
      id: 'clothing',
      label: 'Clothing',
      type: 'text',
      placeholder: 'e.g. blue jeans, gray t-shirt',
    },
    {
      id: 'location',
      label: 'Last seen',
      type: 'text',
      placeholder: 'e.g. 100 block of Main St',
    },
  ],

  checkboxes: [
    {
      id: 'non-speaking',
      label: 'NON-SPEAKING',
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
