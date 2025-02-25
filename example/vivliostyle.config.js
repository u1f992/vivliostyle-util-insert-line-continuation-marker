// @ts-check

import fs from "node:fs";

import { VFM } from "@vivliostyle/vfm";
import JSZip from "jszip";
import { deregisterAllFonts, registerFont } from "canvas";

import {
  measureTextWidthPx,
  insertLineContinuationMarker,
} from "@u1f992/vivliostyle-util-insert-line-continuation-marker";

if (!fs.existsSync("UDEVGothic-Regular.ttf")) {
  const response = await fetch(
    "https://github.com/yuru7/udev-gothic/releases/download/v2.1.0/UDEVGothic_v2.1.0.zip",
  );
  const arrayBuffer = await response.arrayBuffer();
  const zipFile = await JSZip.loadAsync(arrayBuffer);
  const fontFile = await zipFile
    .file("UDEVGothic_v2.1.0/UDEVGothic-Regular.ttf")
    ?.async("nodebuffer");
  if (typeof fontFile === "undefined") {
    throw new Error("Font file not found in zip file");
  }
  fs.writeFileSync("UDEVGothic-Regular.ttf", fontFile);
}

// システムにインストールされていないフォントを使用する場合は`registerFont`が必要
// https://github.com/Automattic/node-canvas?tab=readme-ov-file#registerfont
deregisterAllFonts();
registerFont("UDEVGothic-Regular.ttf", { family: "UDEV Gothic" });

/** @type {import('@vivliostyle/cli').VivliostyleConfigSchema} */
const vivliostyleConfig = {
  title: "example",
  author: "u1f992",
  language: "ja",
  entry: ["manuscript.md"],
  workspaceDir: ".vivliostyle",
  documentProcessor: (options, metadata) =>
    VFM(options, metadata).use(
      insertLineContinuationMarker,
      {
        maxWidthPx: measureTextWidthPx(
          "/*----------------------------------------------*/",
          '20px "UDEV Gothic"',
        ),
        font: '20px "UDEV Gothic"',
        markerWidthPx: measureTextWidthPx(" \u21a9", '20px "UDEV Gothic"'),
        markerClassName: "line-continuation",
      },
      { locales: "ja-JP" },
    ),
};

export default vivliostyleConfig;
