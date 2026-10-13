import { expect, test } from 'claude-code/testing'

import { isVault, parseRewrite, roughNote } from '../hooks/register'

test('"코치"로 시작할 때만 부른 것으로 본다', () => {
  expect(roughNote('코치 로그인 그거 좀 고쳐')).toBe('로그인 그거 좀 고쳐')
  expect(roughNote('  코치, 표 정렬')).toBe('표 정렬')
  expect(roughNote('코치')).toBe('')
  expect(roughNote('로그인 고쳐줘')).toBeUndefined()
  expect(roughNote('코치님 안녕')).toBeUndefined()
  expect(roughNote('헬스 코치 불러줘')).toBeUndefined()
})

test('볼트에서는 끼어들지 않는다', () => {
  expect(isVault('/Users/hanju/04note')).toBe(true)
  expect(isVault('/Users/hanju/04note/work/engsoft')).toBe(true)
  expect(isVault('/Users/hanju/01dev/13engsoft')).toBe(false)
  expect(isVault('/Users/hanju/04notebook')).toBe(false)
})

test('모델 답에서 다듬은 프롬프트만 꺼낸다', () => {
  expect(parseRewrite('{"rewrite":" 로그인 버튼이 눌리지 않는 문제를 고쳐줘 "}')).toBe('로그인 버튼이 눌리지 않는 문제를 고쳐줘')
  expect(parseRewrite('설명 {"rewrite":"a"} 끝')).toBe('a')
  expect(parseRewrite('{"rewrite":""}')).toBeUndefined()
  expect(parseRewrite('JSON 아님')).toBeUndefined()
})
