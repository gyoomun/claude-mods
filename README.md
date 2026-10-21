# claude-mods

다른 사람이 만든 [Claude Code 모드](https://code.claude.com/docs/en/plugins/mods/overview)를 내 작업 방식에 맞게 고친 것과 직접 만든 것.

| 모드 | 원본 | 무엇을 고쳤나 |
|---|---|---|
| [`coach-on-call`](coach-on-call) | [`prompt-coach`](https://github.com/mishgoldenberg/claude-mods) 0.1.2 (Michael Goldenberg) | 모든 프롬프트를 검토하던 것을 `코치 <대충 쓴 말>`로 부를 때만 동작하게 |
| [`next-steps-multi`](next-steps-multi) | [`next-steps`](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps) 1.0.0 (Thariq Shihipar) | 제안을 하나만 고르던 것을 숫자로 여러 개 체크해 한꺼번에 넣게 |
| [`pinboard`](pinboard) | [`pinboard`](https://github.com/sirkitree/pinboard) 0.1.0 (Jerad Bitner) | 넓게 열리던 옆 패널을 45칸으로 열게 |
| [`hq-usage`](hq-usage) | 직접 만듦 | Claude 사용량 한도를 파일에 남겨 [Claude Session HQ](https://github.com/gyoomun/claude-session-hq) 머리에 보이게 |

## 설치

```bash
claude plugin marketplace add gyoomun/claude-mods
claude plugin install coach-on-call@gyoomun-mods
claude plugin install next-steps-multi@gyoomun-mods
claude plugin install pinboard@gyoomun-mods
claude plugin install hq-usage@gyoomun-mods
```

새 세션을 열거나 `/reload-plugins` 를 입력하면 반영된다. 원본과 같이 켜면 동작이 겹치므로 원본은 지우고 쓴다.

## 라이선스

고친 부분은 MIT. 각 모드 폴더의 `LICENSE` 에 원본 저작권 표기가 그대로 들어 있다.
