# DDIA post 1: one full sample case set

Case set "The 30-million-write post". 5 questions, difficulty 1 to 5, interview and AI mixed.
Scenario figures marked *illustrative* are invented for the exercise; they are not from the post.
Computed answers were verified by running code on 2026-11-20 (a 1-second-step FIFO simulation gives 240 s for Q3).
Round 2 changes (Khang's feedback): Q3 was plug-in arithmetic, now it needs the queue idea; Q4 was easy to guess,
now multi-select with equal-length options; "the interviewer asks" is gone from every stem, the question is just asked.
The correct option is shown only in the "Answer" line; on the real page the position is shuffled.
The wording "fan-out" does not appear in the scenario, so Q1 does not get answered by the scenario text.

---

## Scenario (pinned above the questions)

**EN.** A social app stores each user's home timeline as a precomputed list (a "mailbox"). When someone
posts, background **timeline workers** copy the post ID into the mailbox of every follower. Readers just
open their own mailbox, which is fast.

*Illustrative numbers.* The worker cluster can do **2,000,000 mailbox writes per second**. Ordinary traffic
already uses **1,900,000 per second**. One celebrity with **30,000,000 followers** posts during a major
event. The post is queued behind everything else (first in, first out). Users report that timelines are
minutes behind and the app shows errors.

**Figure (drawn on the page, site tokens).** Left to right: *Post* → *Queue* → *Timeline workers* →
*30,000,000 mailboxes*. Under it, a line chart of "queue length" over time: flat near zero, a vertical jump
at the celebrity post, then a slow straight downward slope. The time axis has no numbers.

**VI.** Một ứng dụng mạng xã hội lưu timeline của mỗi người dưới dạng danh sách tính sẵn ("hộp thư"). Khi ai đó
đăng bài, các **timeline worker** chạy nền sao chép ID bài vào hộp thư của từng follower. Người đọc chỉ cần mở
hộp thư của mình, rất nhanh.

*Số liệu minh họa.* Cụm worker ghi được **2.000.000 lần/giây**. Lưu lượng thường ngày đã dùng **1.900.000 lần/giây**.
Một người nổi tiếng có **30.000.000 follower** đăng bài trong một sự kiện lớn. Bài được xếp hàng sau mọi việc
khác (vào trước ra trước). Người dùng báo timeline chậm hàng phút và app báo lỗi.

**Hình (vẽ trên trang, dùng token của site).** Từ trái sang phải: *Bài đăng* → *Hàng đợi* → *Timeline worker* →
*30.000.000 hộp thư*. Bên dưới là đường biểu diễn "độ dài hàng đợi" theo thời gian: phẳng gần 0, nhảy vọt khi
người nổi tiếng đăng, rồi dốc xuống thẳng và chậm. Trục thời gian không có số.

---

## Q1 · Remember · interview-style · difficulty 1

**EN.** What do we call one post spreading into a write for every follower?

- a. Sharding
- b. Fan-out
- c. Replication
- d. Caching

**VI.** Một bài đăng lan thành một lần ghi cho từng follower thì gọi là gì?

- a. Sharding (chia mảnh dữ liệu)
- b. Fan-out
- c. Replication (nhân bản)
- d. Caching (bộ nhớ đệm)

**Answer:** b.

**Why right.** Fan-out is one action spreading into many; here it is "on write" because the copies are made
when the post is written. **Why wrong.** (a) Sharding splits data across machines by key; it does not copy
one item to many places. (c) Replication keeps copies of the same data for safety or speed, not one write per
reader. (d) Caching stores a result to reuse it.
**Read again:** "Fan-out on write: precompute each inbox". **Say it like this:** "That is fan-out on write: I do
the work when someone posts so that reads stay cheap."

---

## Q2 · Understand · interview-style · difficulty 2

**EN.** The same design works fine for a user with 200 followers. Why does it break for the celebrity?

- a. The celebrity's post is bigger, so each of its writes takes longer.
- b. One post costs one write per follower, so the cost grows with followers.
- c. Each mailbox list cannot hold more than 1,000,000 entries.
- d. Celebrities post more often, so the queue never empties.

**VI.** Cùng thiết kế này chạy tốt với người có 200 follower. Vì sao nó hỏng với người nổi tiếng?

- a. Bài của người nổi tiếng nặng hơn, nên mỗi lần ghi lâu hơn.
- b. Một bài tốn một lần ghi cho mỗi follower, nên chi phí tăng theo số follower.
- c. Mỗi danh sách hộp thư không chứa quá 1.000.000 mục.
- d. Người nổi tiếng đăng thường xuyên hơn, nên hàng đợi không bao giờ cạn.

**Answer:** b.

**Why right.** 200 followers means 200 writes, trivial. 30,000,000 followers means 30,000,000 writes from one
post. Most accounts are small and a few are huge (a power law), so the average hides the burst.
**Why wrong.** (a) The post is a short ID; size is not the issue. (c) Nothing in the scenario limits list size.
(d) Frequency is not what changes; the cost per post does.
**Read again:** "The Catastrophe" under fan-out on write. **Say it like this:** "Cost per post is proportional
to followers, and follower counts are very skewed."

---

## Q3 · Apply · interview-style · difficulty 3

**EN.** Using the illustrative numbers, a regular user with 200 followers posts **60 seconds after** the
celebrity's post. About how long after posting do those 200 followers see it?

*Formulas given:*
- spare capacity = capacity − normal load
- backlog left at time t = starting backlog − (spare capacity × t)
- the queue is first in, first out, so a new post waits for the whole backlog left at the moment it arrives
- wait = backlog left ÷ spare capacity (the post's own 200 writes can be ignored)

- a. About 0 seconds: it is only 200 writes
- b. About 240 seconds
- c. About 300 seconds
- d. About 360 seconds

**VI.** Dùng các số liệu minh họa, một người dùng thường có 200 follower đăng bài **60 giây sau** bài của người
nổi tiếng. Khoảng bao lâu sau khi đăng thì 200 follower đó thấy bài?

*Công thức cho sẵn:*
- công suất dư = công suất − tải thường
- backlog còn lại tại thời điểm t = backlog ban đầu − (công suất dư × t)
- hàng đợi vào trước ra trước, nên bài mới phải chờ hết phần backlog còn lại lúc nó vào
- thời gian chờ = backlog còn lại ÷ công suất dư (bỏ qua 200 lần ghi của chính bài đó)

- a. Khoảng 0 giây: chỉ có 200 lần ghi
- b. Khoảng 240 giây
- c. Khoảng 300 giây
- d. Khoảng 360 giây

**Answer:** b. (A 1-second-step FIFO simulation gives 240 s.)

**Why right.** Spare capacity = 2,000,000 − 1,900,000 = 100,000 per second. By t = 60 s the backlog has
shrunk by 60 × 100,000 = 6,000,000, leaving 24,000,000 ahead of the small post. 24,000,000 ÷ 100,000 = 240 s; its own 200 writes take about 0.002 s.
**Why wrong.** (a) The size of your own job does not matter when you are stuck behind a big one: this is
head-of-line blocking, why *everyone's* timeline is late, not just the celebrity's followers. (c) Forgets that
60 s of the backlog is already gone. (d) Adds the 60 s instead of subtracting it.
**Read again:** "The Catastrophe" (queue backlog, "minutes behind"). **Say it like this:** "In a shared FIFO
queue one huge job delays everyone behind it, so the damage reaches users who do not even follow the celebrity."

---

## Q4 · Analyze · AI · multi-select · difficulty 4

**EN.** You ask an AI assistant for a fix. It proposes: "Send posts from accounts above a follower threshold
into a separate queue with its own dedicated workers, 100,000 writes per second, and leave the rest of the
cluster for ordinary traffic." Assume the celebrity's post goes to that queue. **Tick the two** statements that
are true.

- a. Regular users' posts are no longer stuck behind the celebrity's backlog.
- b. The celebrity's followers see the post at once, because the pool is dedicated.
- c. The cluster still performs 30,000,000 writes for this one post.
- d. The backlog disappears because the work is split over two queues.
- e. The total capacity needed falls from 2,000,000 to 1,000,000 writes per second.

**VI.** Bạn nhờ AI đề xuất cách sửa. Nó nói: "Đưa bài của tài khoản vượt một ngưỡng follower vào một hàng đợi riêng,
có worker riêng 100.000 lần ghi/giây, phần còn lại của cụm dành cho lưu lượng thường." Giả sử bài của người
nổi tiếng vào hàng đợi đó. **Chọn hai** nhận định đúng.

- a. Bài của người dùng thường không còn bị kẹt sau backlog của người nổi tiếng.
- b. Follower của người nổi tiếng thấy bài ngay, vì pool riêng.
- c. Cụm vẫn thực hiện 30.000.000 lần ghi cho riêng bài này.
- d. Backlog biến mất vì công việc được chia làm hai hàng đợi.
- e. Tổng công suất cần giảm từ 2.000.000 xuống 1.000.000 lần ghi/giây.

**Answer:** a and c.

**Why right.** (a) Separate queues stop head-of-line blocking (the effect in Q3). (c) The fix moves where
the work happens, but one post still means one write per follower. At 100,000 writes per second those
30,000,000 writes still take about 300 seconds.
**Why wrong.** (b) The dedicated pool is 100,000 writes per second, so the celebrity's followers wait the same
~300 s. (d) Splitting the queue moves the backlog, it does not remove it. (e) Nothing in the proposal reduces
the writes, so the capacity requirement does not fall.
**Read again:** "The hybrid that runs in production" (the real fix removes the 30,000,000 writes).
**Habit:** when AI proposes isolating a heavy job, ask what it protects (others) and what it leaves
unchanged (the heavy job itself).

---

## Q5 · Evaluate · interview-style · difficulty 5

**EN.** A hybrid feed skips write fan-out for accounts above a follower threshold; readers merge those accounts'
recent posts when they open the timeline. The threshold is 20,000. A week later the write queues are healthy,
but p99 timeline load time has doubled. A typical reader follows about 40 accounts above the threshold.
Which change is best?

- a. Raise the threshold, so fewer accounts need a read-time merge.
- b. Add timeline workers, so mailboxes fill faster.
- c. Evict older mailbox entries, so the cache has room.
- d. Lower the threshold, so more accounts skip write fan-out.

**VI.** Một feed hybrid bỏ qua fan-out lúc ghi cho tài khoản vượt một ngưỡng follower; người đọc ghép bài gần đây
của các tài khoản đó khi mở timeline. Ngưỡng là 20.000. Một tuần sau, hàng đợi ghi vẫn khỏe nhưng p99 thời gian
tải timeline tăng gấp đôi. Người đọc điển hình theo dõi khoảng 40 tài khoản vượt ngưỡng. Thay đổi nào tốt nhất?

- a. Nâng ngưỡng lên, để ít tài khoản phải ghép lúc đọc hơn.
- b. Thêm timeline worker, để hộp thư đầy nhanh hơn.
- c. Xóa bớt mục cũ trong hộp thư, để cache có chỗ.
- d. Hạ ngưỡng xuống, để nhiều tài khoản bỏ qua fan-out hơn.

**Answer:** a.

**Why right.** Healthy write queues plus slower reads point at the read side: with a low threshold each
timeline load merges about 40 lists. Raising the threshold moves mid-size accounts back to write fan-out,
trading read cost for write cost. The threshold is a balance between the two, set from measured data against a
p99 target, and it needs re-checking as follower counts shift.
**Why wrong.** (b) The write side is healthy; more workers do not speed up reads. (c) Nothing points at the
cache being full. (d) Makes it worse: even more accounts are merged at read time.
**Read again:** "The hybrid that runs in production" and "Percentiles show what users actually feel".
**Say it like this:** "The threshold trades write cost against read-merge cost, and I tune it from measured data
against a p99 target."

---

## Notes for Khang

- Q3 is a calculation question, so it states every formula it needs (Khang's rule). It tests applying them in
  the right order: spare capacity, backlog left at 60 s, then the wait. Distractor (a) is the common intuition,
  (c) and (d) are the two arithmetic slips.
- Q4 is multi-select with five options of similar length, so the answer cannot be guessed by picking the longest
  or the most hedged one. It reasons from Q3's FIFO idea but restates the premise, so it stays answerable alone.
- Q5 goes beyond the post: the post says nothing about read-merge cost growing with the number of large
  accounts a reader follows. The 40 accounts is an illustrative number.
- Interview framing removed from stems. The "interview-style" tag and "Say it like this" line remain, so the
  interview purpose is still there without a staged interviewer.
- Q1 and Q2 were reworded the same way to stay consistent.
