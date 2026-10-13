// mishgoldenberg/claude-mods 의 prompt-coach 0.1.2 를 고친 것.
// 원본은 보내는 프롬프트마다 검토한다. 이건 "코치 <대충 쓴 말>"로 부를 때만 동작한다.
import type { EngineInterface, Register } from 'claude-code'

const MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM = `You help a developer who is unsure how to phrase a request to an AI coding agent (Claude Code).
They give you a rough note; you write the prompt they should send.
Use the recent conversation to resolve what "it", "that", "그거", "아까 그" refer to, and name the concrete file, screen or feature when the conversation shows it.
Keep their intent and the KIND of message: a bug report stays a bug report, a request stays a request, a question stays a question.
Never add a requirement, deliverable or question they did not imply. Keep the scoping words ("for now", "just", "일단", "만") and constraints they stated.
Add only what makes it clear (the target, what should change, how to tell it worked) and only where the note or the conversation supports it.
If something essential cannot be known, leave it out rather than guess.
Write in the language of the note. Keep it short: one to four sentences.
Answer ONLY with JSON: {"rewrite":"<the prompt>"}`

const CALL = /^\s*코치(?:[\s,:!~]+|$)/

/** "코치" 뒤에 적은 말. 코치를 부른 게 아니면 undefined. */
export function roughNote(text: string): string | undefined {
  const call = CALL.exec(text)
  return call === null ? undefined : text.slice(call[0].length).trim()
}

/** 볼트(~/04note)에서는 "코치"가 헬스 코치 스킬을 부르는 말이라 끼어들지 않는다. */
export function isVault(root: string): boolean {
  return /[\\/]04note(?:[\\/]|$)/.test(root)
}

export function parseRewrite(text: string): string | undefined {
  const json = /\{[\s\S]*\}/.exec(text)?.[0]
  if (json === undefined) return undefined
  try {
    const rewrite = (JSON.parse(json) as { rewrite?: unknown }).rewrite
    return typeof rewrite === 'string' && rewrite.trim() !== '' ? rewrite.trim() : undefined
  } catch {
    return undefined
  }
}

/** 최근 몇 턴, 오래된 것부터. 코치가 "그거"가 무엇인지 알 수 있을 만큼만. */
function recentTurns(messages: { role: string; text: string }[], max = 6, perMessage = 700): string {
  return messages
    .filter(m => m.text.trim() !== '')
    .slice(-max)
    .map(m => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.text.length > perMessage ? `…${m.text.slice(-perMessage)}` : m.text}`)
    .join('\n\n')
}

async function sharpen($: EngineInterface, note: string, root: string): Promise<string | undefined> {
  const messages = await $.session.messages().catch(() => [])
  const conversation = Array.isArray(messages) ? recentTurns(messages) : ''
  const project = root.split(/[\\/]/).at(-1) ?? ''
  const stop = new AbortController()
  const timer = $.clock.after(15000, () => stop.abort())
  const result = await $.model.complete(
    {
      model: MODEL,
      system: SYSTEM,
      maxTokens: 700,
      prompt: `Project folder: ${project}\nRecent conversation, oldest first (may be empty):\n"""${conversation}"""\n\nRough note:\n"""${note}"""`,
    },
    { signal: stop.signal },
  )
  timer.cancel()

  return result.isAnswered ? parseRewrite(result.text) : undefined
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    const isPerson = e.origin.kind === 'composer' || e.origin.kind === 'sdk' || e.origin.kind === 'bridge'
    const note = isPerson ? roughNote(e.text) : undefined
    if (note === undefined) return next(e)
    const root = await $.session.root()
    if (isVault(root)) return next(e)
    if (note === '') return { drop: '코치 뒤에 하고 싶은 말을 적어 주세요. 예: 코치 로그인 그거 좀 고쳐' }

    $.ui.status('코치: 다듬는 중…')
    let rewrite: string | undefined
    try {
      rewrite = await sharpen($, note, root)
    } catch {
      rewrite = undefined
    } finally {
      $.ui.status(undefined)
    }
    if (rewrite === undefined) {
      // 다듬지 못했으면 아무것도 보내지 않고 적은 말을 입력창에 돌려준다
      $.clock.after(150, () => void $.prompt.fill({ text: note }))

      return { drop: '코치가 다듬지 못했습니다. 적은 말을 입력창에 돌려놓았습니다.' }
    }

    const SEND_NEW = '다듬은 걸로 보내기'
    const SEND_MINE = '내 말 그대로 보내기'
    const EDIT = '고쳐서 보내기'
    let choice: string
    try {
      choice = await $.ui.ask(`코치가 다듬은 프롬프트:\n\n${rewrite}\n\n어느 걸 보낼까요?`, {
        header: '코치',
        options: [SEND_NEW, SEND_MINE, EDIT],
      })
    } catch {
      // 창을 닫았으면 아무것도 보내지 않는다
      $.clock.after(150, () => void $.prompt.fill({ text: note }))

      return { drop: '보내지 않았습니다. 적은 말을 입력창에 돌려놓았습니다.' }
    }

    if (choice === SEND_NEW) {
      $.ui.log(`코치가 다듬은 걸 보냈습니다:\n${rewrite}`)

      return next({ ...e, text: rewrite })
    }
    if (choice === SEND_MINE) return next({ ...e, text: note })
    if (choice === EDIT) {
      const filled = rewrite
      $.clock.after(150, () => void $.prompt.fill({ text: filled }))

      return { drop: '다듬은 걸 입력창에 넣었습니다. 고친 뒤 엔터를 누르세요.' }
    }

    // "Other"에 직접 적은 말: 그걸 보낸다
    return next({ ...e, text: choice })
    // 훅이 깨져도 프롬프트는 막지 않고 그대로 보낸다
  }).catch(($, e, next) => next(e))
}
