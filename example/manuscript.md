<style>
@font-face {
  font-family: "UDEV Gothic";
  src: url("UDEVGothic-Regular.ttf");
}
pre {
  background-color: lightcyan;
  width: 500px;
  white-space: pre-wrap;
  word-break: break-all;
}
code {
  font: 20px "UDEV Gothic";
}
.line-continuation::before {
  content: " ↩";
  color: deepskyblue;
}
/**
 * 行継続マークの後は強制的に改行する
 * 演算誤差などで行継続マークの後に文字が続いてしまうのを防ぐ
 */
.line-continuation::after {
  content: "";
  display: block;
}
</style>

<!-- prettier-ignore-start -->

```javascript
function hoge() {
}

/*----------------------------------------------*/

/*---------------------------------------------------*/

/* 全角文字や曖昧幅の文字┗│o_o│┓を含む場合にもまずまずの位置に行継続マークを付けられる */

/* 寿限無、寿限無、五劫のすりきれ、海砂利水魚の、水行末・雲来末・風来末、食う寝るところに住むところ、やぶらこうじのぶらこうじ、パイポ・パイポ・パイポのシューリンガン、シューリンガンのグーリンダイ、グーリンダイのポンポコピーのポンポコナの、長久命の長助 */
```

<!-- prettier-ignore-end -->
