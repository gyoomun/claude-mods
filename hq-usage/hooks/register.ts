import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

// Claude 사용량 한도(five_hour·seven_day)를 Claude Session HQ(http://127.0.0.1:7420)가 읽도록 파일에 남긴다.
// 한도는 계정 단위라 어느 세션이든 마지막에 잰 값이 맞다. 구독이 아니면(한도 없음) 남기지 않는다
export const usageJson = (limits: SessionRateLimit[], at: number) =>
  JSON.stringify({ at, limits: limits.map(l => ({ kind: l.kind, percentUsed: l.percentUsed, resetsAt: l.resetsAt ?? null })) })

async function save($: EngineInterface, limits: SessionRateLimit[]): Promise<void> {
  if (!limits.length) return
  const home = await $.env.get('HOME')
  if (home) await $.fs.write(`${home}/.claude/board/usage.json`, usageJson(limits, await $.clock.now()))
}

export const register: Register = on => {
  // 응답마다 엔진이 재고, 한도가 1%p 움직이면 알려 준다
  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) await save($, e.rateLimits)
    return next(e)
  })
}
