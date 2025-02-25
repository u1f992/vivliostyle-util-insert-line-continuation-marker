<style>
pre {
  background-color: lightcyan;
  width: 500px;
  white-space: pre-wrap;
  word-break: break-all;
}
code {
  font: 20px "Noto Sans Mono CJK JP";
}
.line-continue::before {
  content: " ↩";
  color: deepskyblue;
}
/**
 * 行継続マークの後は強制的に改行する
 * 演算誤差などで行継続マークの後に文字が続いてしまうのを防ぐ
 */
.line-continue::after {
  display: block;
}
</style>

<!-- prettier-ignore-start -->

```javascript
function hoge() {
}

/*----------------------------------------------*/

/*---------------------------------------------------*/

/* 全角文字や曖昧幅の文字を含む場合にも┗│o_o│┓まずまず正しく行継続マークを付けられる */
```

<!-- prettier-ignore-end -->
