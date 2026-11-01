// Adds a "Copy" button to every highlighted code block inside a post.
document.querySelectorAll<HTMLElement>('.prose pre.astro-code').forEach((pre) => {
  const wrap = document.createElement('div');
  wrap.className = 'code-wrap';
  pre.parentNode?.insertBefore(wrap, pre);
  wrap.appendChild(pre);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'code-copy';
  btn.textContent = 'Copy';
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pre.innerText);
      btn.textContent = 'Copied';
    } catch {
      btn.textContent = 'Press Ctrl+C';
    }
    setTimeout(() => (btn.textContent = 'Copy'), 1600);
  });
  wrap.appendChild(btn);
});
