'use strict';

/**
 * Schedule email warning (docs/designs/multi-mailbox.md, Section 4):
 * When a schedule's agent has email off, show a short note on that schedule
 * ("Pam cannot check email") in the On a schedule section and the office schedule.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (rel) => fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

test('schedulesSection.cannotCheckEmail exists in all three languages without dashes', () => {
  // Value: protects=every language tells the owner when an agent cannot check email; fails_when=a translation is missing or carries a dash; why_new=multi-mailbox.md Section 4 schedule email warning; seam=locales
  for (const loc of ['en', 'zh-CN', 'ar']) {
    const d = JSON.parse(read(`src/renderer/src/i18n/locales/${loc}.json`));
    const text = d.schedulesSection?.cannotCheckEmail;
    assert.equal(typeof text, 'string', `${loc}: schedulesSection.cannotCheckEmail must be a string`);
    assert.ok(text.includes('{{name}}'), `${loc}: schedulesSection.cannotCheckEmail must include {{name}}`);
    assert.doesNotMatch(text, /[–—]| - /, `${loc}: schedulesSection.cannotCheckEmail must not have dashes`);
  }
});

test('ScheduleList shows cannotCheckEmail note in both AgentSchedules and OfficeSchedules when email is off', () => {
  // Value: protects=a schedule belonging to an agent without email warns that the agent cannot check email; fails_when=the note is dropped or missing from On a schedule or Office schedule; why_new=multi-mailbox.md Section 4 schedule email warning; seam=none
  const list = read('src/renderer/src/components/triggers/ScheduleList.tsx');
  assert.match(list, /emailOff\?:\s*boolean;/, 'RowProps accepts emailOff');
  assert.match(list, /data-email-warning/, 'renders data-email-warning attribute');
  assert.match(list, /emailOff && !heartbeat/, 'gates warning on emailOff and not heartbeat');
  assert.match(list, /t\('schedulesSection\.cannotCheckEmail', \{ name: ownerName \}\)/, 'uses schedulesSection.cannotCheckEmail with ownerName');
  assert.match(list, /emailOff=\{emailOff\}/, 'AgentSchedules passes emailOff to ScheduleRow');
  assert.match(list, /emailOff=\{ownerEmailOff\}/, 'OfficeSchedules passes ownerEmailOff to ScheduleRow');
});
