// @ts-check

/*
 * vivliostyle-util-insert-line-continuation-marker - Add line continuation markers to elements.
 * Copyright (C) 2025  Koutaro Mukai
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import fs from "node:fs";
import { createCanvas } from "canvas";
import { JSDOM } from "jsdom";
import rehype from "rehype";

/**
 * @param {string} text
 * @param {string} font https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
 * @param {{ debugOutput?: string }} param1
 */
export function measureTextWidthPx(text, font, { debugOutput } = {}) {
  const canvas = createCanvas(1, 1);
  const ctx = canvas.getContext("2d");
  ctx.font = font;

  const textMetrics = ctx.measureText(text);
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#measuring_text_width
   *
   * > ## Measuring text width
   * >
   * > When measuring the x-direction of a piece of text, the sum of `actualBoundingBoxLeft` and `actualBoundingBoxRight` can be wider than the width of the inline box (`width`), due to slanted/italic fonts where characters overhang their advance width.
   * >
   * > It can therefore be useful to use the sum of `actualBoundingBoxLeft` and `actualBoundingBoxRight` as a more accurate way to get the absolute text width:
   */
  const width =
    textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;
  const height =
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

  if (typeof debugOutput !== "undefined") {
    canvas.height = height;
    canvas.width = width;
    ctx.font = font;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, 0, textMetrics.actualBoundingBoxAscent);
    fs.writeFileSync(debugOutput, canvas.toBuffer());
  }
  return width;
}

/**
 * @param {string} text
 * @param {{ locales?: Intl.LocalesArgument; }} param1
 */
function segmentalizeText(text, { locales } = {}) {
  return Array.from(
    new Intl.Segmenter(locales, { granularity: "grapheme" }).segment(text),
  ).map((s) => s.segment);
}

/**
 * @param {Element} elem
 * @param {number} maxWidthPx
 * @param {string} font https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
 * @param {number} markerWidthPx
 * @param {string} markerClassName
 * @param {{ lineBreak?: string; locales?: Intl.LocalesArgument; }} param5
 */
export function insertLineContinuationMarkerToElement(
  elem,
  maxWidthPx,
  font,
  markerWidthPx,
  markerClassName,
  { lineBreak, locales } = {},
) {
  lineBreak ??= "\n";
  const lines = elem.textContent?.split(lineBreak);
  if (typeof lines === "undefined") {
    return;
  }
  let processed = "";
  for (const line of lines) {
    const segments = segmentalizeText(line, { locales });
    let lastMarkerPosition = 0;
    let acc = "";
    for (let i = 0; i < segments.length; i++) {
      acc += segments[i];
      if (measureTextWidthPx(acc, font) <= maxWidthPx) {
        continue;
      }

      while (measureTextWidthPx(acc, font) + markerWidthPx > maxWidthPx) {
        acc = segments.slice(lastMarkerPosition, i).join("");
        i--;
      }
      const insertPosition = processed + acc;

      let position = "";
      (function traverse(/** @type {Node} */ node) {
        for (const child of node.childNodes) {
          if (child.nodeType === 3 /* Node.TEXT_NODE */) {
            const segments = segmentalizeText(child.textContent ?? "", {
              locales,
            });
            for (let j = 0; j < segments.length; j++) {
              position += segments[j];
              if (position !== insertPosition) {
                continue;
              }
              // @ts-ignore
              const marker = child.ownerDocument.createElement("span");
              marker.className = markerClassName;
              child.replaceWith(
                segments.slice(0, j + 1).join(""),
                marker,
                segments.slice(j + 1).join(""),
              );
              return true;
            }
          } else if (child.hasChildNodes()) {
            if (traverse(child)) {
              return true;
            }
          }
        }
        return false;
      })(elem);

      processed += acc;
      acc = "";
      lastMarkerPosition = i + 1;
    }
    processed += acc + lineBreak;
  }
}

/**
 * @param {{ maxWidthPx: number; font: string; markerWidthPx: number; markerClassName: string; }} param0
 * @param {{ selector?: string; lineBreak?: string; locales?: Intl.LocalesArgument; }} param1
 */
export function insertLineContinuationMarker(
  { maxWidthPx, font, markerWidthPx, markerClassName },
  { selector, lineBreak, locales } = {},
) {
  return (
    /** @type {import("unist").Node | any} */ tree,
    /** @type {import("vfile").VFile | any} */ file,
  ) => {
    selector ??= "pre > code";
    // @ts-ignore
    const htmlText = rehype().stringify(tree);
    const jsdom = new JSDOM(htmlText);
    const { document } = jsdom.window;
    const elems = document.querySelectorAll(selector);
    for (const elem of elems) {
      insertLineContinuationMarkerToElement(
        elem,
        maxWidthPx,
        font,
        markerWidthPx,
        markerClassName,
        { lineBreak, locales },
      );
    }
    return rehype().parse(jsdom.serialize());
  };
}
