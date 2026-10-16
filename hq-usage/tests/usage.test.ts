import { describe, expect, test } from 'claude-code/testing'

import { usageJson } from '../hooks/register'

describe('usage', () => {
  test('the file keeps each window with its percent and reset time', () => {
    const out = JSON.parse(usageJson([{ kind: 'five_hour', percentUsed: 23.5, resetsAt: '2026-10-16T05:00:00Z' }, { kind: 'seven_day', percentUsed: 41 }], 1000))
    expect(out).toEqual({ at: 1000, limits: [
      { kind: 'five_hour', percentUsed: 23.5, resetsAt: '2026-10-16T05:00:00Z' },
      { kind: 'seven_day', percentUsed: 41, resetsAt: null },
    ] })
  })
})
