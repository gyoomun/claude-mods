# pinboard (45칸)

미정 결정, 할 일, 클로드가 만든 링크를 대화 옆 패널에 고정해 둔다. [sirkitree/pinboard](https://github.com/sirkitree/pinboard) 0.1.0 (Jerad Bitner, MIT) 에서 패널 너비만 고쳤다. 쓰는 법은 원본 README 를 본다.

## 원본과 다른 점

- 원본은 패널 너비를 정하지 않아 화면의 일정 비율로 넓게 열린다. 여기서는 패널을 열 때 45칸을 요청한다 (`hooks/register.tsx` 의 `COLUMNS`)
- 요청일 뿐이라, 패널을 끌어서 맞춘 너비가 있으면 그쪽이 우선한다

다른 너비를 원하면 `COLUMNS` 값을 바꾼다. 플러그인 이름이 원본과 같은 `pinboard` 이므로 원본과 함께 설치하지 않는다.
