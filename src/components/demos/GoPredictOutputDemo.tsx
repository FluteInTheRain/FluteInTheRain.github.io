import React, { useState } from 'react';

// Every "output" below was captured from a real `go run` on Go 1.27.1 (darwin/arm64).
// The select card is non-deterministic: the counts are from one run, the explanation says so.
type Choice = { text: string; right?: boolean };
type Card = {
  id: string;
  titleEn: string;
  titleVi: string;
  code: string;
  choices: Choice[];
  output: string;
  whyEn: string;
  whyVi: string;
};

const CARDS: Card[] = [
  {
    id: 'append',
    titleEn: 'append on a shared slice',
    titleVi: 'append trên slice dùng chung mảng',
    code: `package main

import "fmt"

func main() {
	a := make([]int, 3, 4)
	b := append(a, 1)
	c := append(a, 2)
	fmt.Println(a, b, c)
	fmt.Println(len(a), cap(a))
}`,
    choices: [
      { text: '[0 0 0] [0 0 0 1] [0 0 0 2]  /  3 4' },
      { text: '[0 0 0] [0 0 0 2] [0 0 0 2]  /  3 4', right: true },
      { text: '[0 0 0 2] [0 0 0 2] [0 0 0 2]  /  4 4' },
    ],
    output: '[0 0 0] [0 0 0 2] [0 0 0 2]\n3 4',
    whyEn:
      'a has room for a fourth element (cap 4), so both appends write into the same slot of the same array. The second write (2) replaces the first (1). a itself still has len 3, so it never shows the new slot.',
    whyVi:
      'a còn chỗ cho phần tử thứ tư (cap 4), nên cả hai lần append cùng ghi vào một ô của một mảng. Lần ghi sau (2) đè lần trước (1). Bản thân a vẫn có len 3 nên không thấy ô mới.',
  },
  {
    id: 'defer',
    titleEn: 'defer in a loop',
    titleVi: 'defer trong vòng lặp',
    code: `package main

import "fmt"

func main() {
	for i := 0; i < 3; i++ {
		defer fmt.Println("defer", i)
	}
	fmt.Println("loop done")
}`,
    choices: [
      { text: 'defer 0 / defer 1 / defer 2 / loop done' },
      { text: 'loop done / defer 0 / defer 1 / defer 2' },
      { text: 'loop done / defer 2 / defer 1 / defer 0', right: true },
    ],
    output: 'loop done\ndefer 2\ndefer 1\ndefer 0',
    whyEn:
      'A deferred call waits for the surrounding function, not for the loop iteration, and deferred calls run last in, first out. The value of i is copied at the defer line, so each call keeps its own number.',
    whyVi:
      'Lời gọi defer chờ hàm bao ngoài kết thúc chứ không chờ hết lượt lặp, và chạy theo thứ tự vào sau ra trước. Giá trị i được sao chép ngay tại dòng defer nên mỗi lời gọi giữ số của riêng nó.',
  },
  {
    id: 'select',
    titleEn: 'select with two ready cases',
    titleVi: 'select khi hai case cùng sẵn sàng',
    code: `package main

import "fmt"

func main() {
	a := make(chan string, 1)
	b := make(chan string, 1)
	counts := map[string]int{}
	for i := 0; i < 1000; i++ {
		a <- "a"
		b <- "b"
		select {
		case v := <-a:
			counts[v]++
			<-b
		case v := <-b:
			counts[v]++
			<-a
		}
	}
	fmt.Println("a:", counts["a"], "b:", counts["b"])
}`,
    choices: [
      { text: 'a: 1000 b: 0  (the first case always wins)' },
      { text: 'a: 0 b: 1000  (the last case always wins)' },
      { text: 'about half each, and the numbers change on every run', right: true },
    ],
    output: 'a: 484 b: 516',
    whyEn:
      'When several cases are ready, select picks one at random. The numbers above are from one real run; yours will differ, usually close to 500 each. Never write code that depends on which case wins.',
    whyVi:
      'Khi nhiều case cùng sẵn sàng, select chọn ngẫu nhiên một case. Số liệu trên là của một lần chạy thật, máy bạn sẽ ra số khác, thường gần 500 mỗi bên. Đừng viết code phụ thuộc vào case nào thắng.',
  },
  {
    id: 'typednil',
    titleEn: 'a nil pointer inside an error',
    titleVi: 'con trỏ nil nằm trong error',
    code: `package main

import "fmt"

type MyErr struct{}

func (*MyErr) Error() string { return "my error" }

func find(fail bool) error {
	var e *MyErr
	if fail {
		e = &MyErr{}
	}
	return e
}

func main() {
	err := find(false)
	fmt.Println(err == nil)
	fmt.Printf("%T %v\\n", err, err == nil)
}`,
    choices: [
      { text: 'true  /  <nil> true' },
      { text: 'false  /  *main.MyErr false', right: true },
      { text: 'it does not compile' },
    ],
    output: 'false\n*main.MyErr false',
    whyEn:
      'An interface value holds a type and a value. find returns an error whose type is *MyErr and whose value is nil. That is not the same as an error that holds nothing, so err == nil is false. Return a plain nil instead of a nil *MyErr.',
    whyVi:
      'Một giá trị interface chứa một kiểu và một giá trị. find trả về error có kiểu *MyErr và giá trị nil. Điều đó khác với error không chứa gì, nên err == nil là false. Hãy trả về nil trơn thay vì một *MyErr nil.',
  },
  {
    id: 'loopvar',
    titleEn: 'closures over a loop variable',
    titleVi: 'closure bắt biến vòng lặp',
    code: `package main

import "fmt"

func main() {
	var fs []func()
	for i := 0; i < 3; i++ {
		fs = append(fs, func() { fmt.Print(i, " ") })
	}
	for _, f := range fs {
		f()
	}
	fmt.Println()
}

// go.mod A: "go 1.21"      go.mod B: "go 1.22"`,
    choices: [
      { text: '0 1 2 in both modules' },
      { text: '3 3 3 in both modules' },
      { text: 'go 1.21: 3 3 3     go 1.22: 0 1 2', right: true },
    ],
    output: 'go 1.21 module:  3 3 3\ngo 1.22 module:  0 1 2',
    whyEn:
      'Before Go 1.22 the loop had one i for the whole loop, and every closure saw its final value, 3. From Go 1.22 each iteration gets its own i. The language version comes from the go line in go.mod, not from the toolchain you run: both runs used Go 1.27.1.',
    whyVi:
      'Trước Go 1.22 cả vòng lặp chỉ có một biến i, mọi closure đều thấy giá trị cuối là 3. Từ Go 1.22 mỗi lượt lặp có i riêng. Phiên bản ngôn ngữ lấy từ dòng go trong go.mod chứ không phải từ toolchain bạn chạy: cả hai lần đều chạy Go 1.27.1.',
  },
  {
    id: 'nilmap',
    titleEn: 'writing to a nil map',
    titleVi: 'ghi vào map nil',
    code: `package main

import "fmt"

func main() {
	var m map[string]int
	fmt.Println(m["a"], len(m))
	m["a"] = 1
	fmt.Println("unreachable")
}`,
    choices: [
      { text: '0 0  then  unreachable' },
      { text: '0 0  then a panic', right: true },
      { text: 'a panic before anything is printed' },
    ],
    output: '0 0\npanic: assignment to entry in nil map\n\ngoroutine 1 [running]:\nmain.main()\n\tpredict/main.go:8 +0xa4\nexit status 2',
    whyEn:
      'Reading from a nil map is fine: you get the zero value, and len is 0. Writing is not, so the program panics on line 8 and exits with status 2. Create the map with make or a map literal before you write.',
    whyVi:
      'Đọc từ map nil thì an toàn: bạn nhận giá trị zero và len là 0. Ghi thì không, chương trình panic ở dòng 8 và thoát với status 2. Hãy tạo map bằng make hoặc map literal trước khi ghi.',
  },
];

export default function GoPredictOutputDemo() {
  // picked[id] = index of the choice the reader tapped; opened[id] = answer shown
  const [picked, setPicked] = useState<Record<string, number | undefined>>({});
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  const setOpen = (id: string, v: boolean) => setOpened((o) => ({ ...o, [id]: v }));
  const allOpen = CARDS.every((c) => opened[c.id]);
  const score = CARDS.filter((c) => picked[c.id] !== undefined && c.choices[picked[c.id] as number].right).length;
  const guessed = CARDS.filter((c) => picked[c.id] !== undefined).length;

  return (
    <div className="gpo">
      <div className="sd-controls">
        <button
          type="button"
          className="sd-btn"
          onClick={() => setOpened(Object.fromEntries(CARDS.map((c) => [c.id, !allOpen])))}
        >
          <span data-lang-en>{allOpen ? 'Hide all answers' : 'Show all answers'}</span>
          <span data-lang-vi>{allOpen ? 'Ẩn mọi đáp án' : 'Hiện mọi đáp án'}</span>
        </button>
        <button type="button" className="sd-btn" onClick={() => { setPicked({}); setOpened({}); }}>
          <span data-lang-en>Reset</span>
          <span data-lang-vi>Làm lại</span>
        </button>
        <span className="gpo-score" aria-live="polite">
          <span data-lang-en>{guessed === 0 ? 'Pick an answer on each card' : `${score} of ${guessed} guesses right`}</span>
          <span data-lang-vi>{guessed === 0 ? 'Chọn một đáp án ở mỗi thẻ' : `Đúng ${score} trên ${guessed} lần đoán`}</span>
        </span>
      </div>

      {CARDS.map((c, n) => {
        const pick = picked[c.id];
        const open = !!opened[c.id];
        return (
          <div className="gpo-card" key={c.id}>
            <p className="gpo-title">
              <span className="gpo-n">{n + 1}</span>
              <span data-lang-en>{c.titleEn}</span>
              <span data-lang-vi>{c.titleVi}</span>
            </p>
            <pre className="gpo-code"><code>{c.code}</code></pre>
            <p className="gpo-q">
              <span data-lang-en>What does it print?</span>
              <span data-lang-vi>Chương trình in ra gì?</span>
            </p>
            <div className="gpo-choices">
              {c.choices.map((ch, i) => {
                const state = pick === i ? (ch.right ? ' is-right' : ' is-wrong') : '';
                return (
                  <button
                    type="button"
                    key={i}
                    className={'gpo-choice' + state}
                    aria-pressed={pick === i}
                    onClick={() => { setPicked((p) => ({ ...p, [c.id]: i })); setOpen(c.id, true); }}
                  >
                    {ch.text}
                  </button>
                );
              })}
            </div>
            <details
              className="gpo-answer"
              open={open}
              onToggle={(e) => setOpen(c.id, (e.currentTarget as HTMLDetailsElement).open)}
            >
              <summary>
                <span data-lang-en>Answer and explanation</span>
                <span data-lang-vi>Đáp án và giải thích</span>
              </summary>
              <pre className="gpo-out"><code>{c.output}</code></pre>
              <p>
                <span data-lang-en>{c.whyEn}</span>
                <span data-lang-vi>{c.whyVi}</span>
              </p>
            </details>
          </div>
        );
      })}
    </div>
  );
}
