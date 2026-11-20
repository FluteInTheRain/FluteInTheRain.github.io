# DDIA post 1: 5 sample questions, round 2

Interview and AI questions are mixed. Only difficulty rises: 1, 2, 3, 4, 5.
Numbers are checked against the post (`src/content/blog/reliable-scalable-maintainable-data-systems.mdx`,
read 2026-11-20) or by running code. The correct option is shown only in the "Answer" line; on the real
page the position is shuffled.

| # | Level | Track | Type | Difficulty |
|---|---|---|---|---|
| 1 | Remember | interview | single | 1 |
| 2 | Understand | AI | diagram | 2 |
| 3 | Apply | interview | code-output | 3 |
| 4 | Analyze | AI | ai-review (goes beyond the post) | 4 |
| 5 | Evaluate | interview | scenario | 5 |

---

## Q1 · Remember · interview · difficulty 1

**EN.** An interviewer asks: "What is the difference between a fault and a failure?" Which answer is strongest?

- a. A fault is one component deviating from its spec; a failure is the whole system no longer serving users. Fault tolerance keeps the first from becoming the second.
- b. A failure is one component breaking; a fault is the whole system going down.
- c. A fault is a software bug and a failure is a hardware problem.
- d. They mean the same thing; "fault" is only the more formal word.

**VI.** Người phỏng vấn hỏi: "Fault và failure khác nhau thế nào?" Câu trả lời nào mạnh nhất?

- a. Fault là một thành phần lệch khỏi đặc tả; failure là cả hệ thống không còn phục vụ người dùng. Chịu lỗi (fault tolerance) giúp cái đầu không biến thành cái sau.
- b. Failure là một thành phần hỏng; fault là cả hệ thống sập.
- c. Fault là lỗi phần mềm, failure là lỗi phần cứng.
- d. Hai từ giống nhau; "fault" chỉ là cách nói trang trọng hơn.

**Answer:** a.

**Why right.** It gives both definitions and the link between them, which is what the interviewer is
listening for. **Why wrong.** (b) swaps the terms. (c) Both words apply to hardware and software.
(d) The distinction is the whole point of reliability design.
**Read again:** "Faults vs. failures". **Say it like this:** "A disk dying is a fault. Users losing the
service is a failure. I design so the first never causes the second."

---

## Q2 · Understand · AI · diagram · difficulty 2

**Figure (drawn on the page, site tokens).** A dashboard tile: "mean latency 19.9 ms". Beside it, a
histogram of the same 100 requests: 99 at 10 ms, 1 at 1,000 ms.

**EN.** You paste this dashboard into an AI assistant and ask for a health summary. It answers: "Latency is
excellent: the mean is under 20 ms." Which reply to it is best?

- a. "Agreed, a mean under 20 ms is healthy."
- b. "The mean is miscalculated; recompute it."
- c. "The mean is arithmetic-correct but hides the one 1,000 ms request. Show me p50, p99 and p99.9."
- d. "Drop the 1,000 ms request as an outlier and recompute."

**VI.** Bạn dán dashboard này cho AI và nhờ tóm tắt sức khỏe hệ thống. Nó trả lời: "Độ trễ rất tốt: trung bình
dưới 20 ms." Phản hồi nào tốt nhất?

- a. "Đồng ý, trung bình dưới 20 ms là khỏe."
- b. "Trung bình tính sai, tính lại đi."
- c. "Trung bình tính đúng nhưng che mất request 1.000 ms. Cho tôi p50, p99 và p99.9."
- d. "Bỏ request 1.000 ms vì là ngoại lệ rồi tính lại."

**Answer:** c.

**Why right.** (99×10 + 1×1000)/100 = 19.9 is correct arithmetic, so the fix is a better statistic, not
a recalculation. Percentiles show what users actually felt. **Why wrong.** (a) Accepts the AI's summary
without checking what the mean hides. (b) The arithmetic is fine. (d) The slow request is a real user.
**Read again:** "Why averages hide tail latency". **Habit:** when AI summarizes a metric, ask which
statistic it used and what that statistic cannot show.

---

## Q3 · Apply · interview · code-output · difficulty 3

**EN.** An interviewer says: "A page waits for 100 independent backends. Each is fast 99% of the time. What
fraction of page loads are fast?" You check it with this script. What does it print, and what is the answer?

```python
p_fast = 0.99
n = 100
print(round(p_fast ** n, 3))
```

- a. `0.99`: about 99% of page loads are fast
- b. `0.366`: about 37% of page loads are fast
- c. `0.634`: about 63% of page loads are fast
- d. `0.01`: about 1% of page loads are fast

**VI.** Người phỏng vấn nói: "Một trang chờ 100 backend độc lập. Mỗi backend nhanh 99% số lần. Bao nhiêu phần
trăm lượt tải trang là nhanh?" Bạn kiểm tra bằng script trên. Nó in ra gì và đáp án là gì? (các phương án như trên)

**Answer:** b. (Script run on 2026-11-20 prints `0.366`.)

**Why right.** The page is fast only if all 100 calls are fast: 0.99¹⁰⁰ ≈ 0.366. So 63.4% of loads hit at
least one slow call, the figure in the post's table. **Why wrong.** (a) Assumes the page inherits one
backend's rate. (c) That is the slow share (1 − 0.366), the opposite of what was asked. (d) The chance of
a single call being slow, not the page.
**Read again:** "Dean and Barroso: fan-out makes the tail worse". **Say it like this:** "99% per call
is only 37% per page at 100 calls, so I watch the tail of the whole request."

---

## Q4 · Analyze · AI · ai-review · difficulty 4 (goes beyond the post)

**EN.** An AI assistant writes this client. About 10,000 clients run it against a backend replica that is
already at full load. Choose the best review comment.

```python
def call_backend(req):
    for attempt in range(5):
        try:
            return http.post(URL, json=req)   # no timeout argument
        except Exception:
            continue
    raise RuntimeError("backend unavailable")
```

- a. Fine as is; raise the attempts to 10 for more resilience.
- b. Every client retries at once, so the loaded backend can see up to 5 × 10,000 = 50,000 calls. Add a timeout, backoff with jitter, retries only for transient errors, and a cap on total retries.
- c. The only problem is `except Exception`; catching `TimeoutError` instead fixes the overload.
- d. Replace the loop with recursion so each retry gets its own stack frame.

**VI.** AI viết client trên. Khoảng 10.000 client chạy nó vào một replica đang quá tải. Chọn nhận xét review tốt nhất.
(các phương án như trên: a) giữ nguyên, tăng lên 10 lần; b) mọi client retry cùng lúc nên backend có thể nhận tới
50.000 lệnh gọi, cần timeout, backoff kèm jitter, chỉ retry lỗi tạm thời, giới hạn tổng số retry; c) chỉ cần hẹp
`except`; d) dùng đệ quy.)

**Answer:** b.

**Why right.** Retries multiply load on a backend that is already struggling, which can turn one faulty
replica into a cascading failure (the domino the post describes). Backoff spreads retries out and jitter
stops clients retrying in step. **Why wrong.** (a) Doubles the amplification. (c) Narrowing the exception
helps a little but ignores the load; also with no timeout, `TimeoutError` never fires. (d) Changes the
structure, not the load.
**Read again:** "Three places faults come from" (cascading failure, thundering herd). **Beyond the post:**
backoff, jitter and retry budgets; verify the source before publishing (candidate: AWS Builders' Library
article on timeouts, retries and backoff with jitter; URL not yet checked).
**Say it like this:** "I check three things in AI-written clients: timeout, backoff with jitter, and
which errors it retries."

---

## Q5 · Evaluate · interview · scenario · difficulty 5

**EN.** In a feed design interview you chose fan-out on write because reads outnumber writes 50 to 1. The
interviewer says: "40 accounts have over 5 million followers, and 99.9% of accounts have under 20,000. What
do you change?" Choose the best answer.

- a. Nothing: the read/write ratio decides, and 40 accounts are too few to matter.
- b. Go back to fan-out on read for everyone, since a precomputed inbox cannot scale.
- c. Keep fan-out on write for ordinary accounts, skip write fan-out for the large ones, and merge their recent posts into the reader's feed at read time. Pick the follower threshold from measured data.
- d. Keep the design and add more queue workers, since a backlog is just a capacity problem.

**VI.** Trong buổi phỏng vấn thiết kế feed, bạn chọn fan-out on write vì lượt đọc nhiều gấp 50 lần lượt ghi.
Người phỏng vấn nói: "Có 40 tài khoản trên 5 triệu follower, còn 99,9% tài khoản dưới 20.000. Bạn đổi gì?"
Chọn câu trả lời tốt nhất. (các phương án như trên)

**Answer:** c.

**Why right.** The average ratio holds for typical accounts but ignores the skew. One post from a
5-million-follower account is 5 million writes, the "Fail Whale" case in the post. Hybrid keeps cheap
reads for most users and merges the few large accounts when reading. Choosing the threshold from measured
data is the follow-up interviewers look for. **Why wrong.** (a) Treats the average as the whole
picture. (b) Overreacts: fan-out on read was the original problem. (d) More workers do not fix a write
count that grows with followers.
**Read again:** "The hybrid that runs in production". **Say it like this:** "I check the follower
distribution before choosing a design, and I route by load instead of using one rule for everyone."

---

## Notes for Khang

- Q4 is the only sample that goes past the post. The AWS article is a candidate reference, not yet opened.
- The fan-out "AI advice" version from round 1 became Q5's interview version. Say if you want both in the
  final 40.
- Dropped from round 1: the "fault" scenario with 3 replicas (now Q1 as a spoken answer) and the
  mean-based alert code (now Q2 as an AI summary).
