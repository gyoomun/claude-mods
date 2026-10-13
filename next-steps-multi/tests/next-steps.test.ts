import { expect, test } from 'claude-code/testing'

import { joined, toggle } from '../hooks/register'

const ITEMS = [
  { label: '테스트', prompt: '방금 쓴 테스트를 돌려줘' },
  { label: '설정 화면', prompt: '설정 화면에도 똑같이 적용해줘' },
  { label: '커밋', prompt: '커밋해줘' },
]

test('숫자를 누를 때마다 체크가 켜지고 꺼진다', () => {
  expect(toggle([], 2)).toEqual([2])
  expect(toggle([2], 0)).toEqual([0, 2])
  expect(toggle([0, 2], 2)).toEqual([0])
})

test('하나면 그대로, 여럿이면 번호를 붙여 넣는다', () => {
  expect(joined(ITEMS, [1])).toBe('설정 화면에도 똑같이 적용해줘')
  expect(joined(ITEMS, [0, 2])).toBe('1. 방금 쓴 테스트를 돌려줘\n2. 커밋해줘')
})
