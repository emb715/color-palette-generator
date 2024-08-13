// Based on: https://github.com/ant-design/ant-design-colors/blob/main/src/generate.ts
import { inputToRGB, rgbToHex, rgbToHsv } from "@ctrl/tinycolor";
var hueStep = 2;
var saturationStep = 0.16;
var saturationStep2 = 0.05;
var brightnessStep1 = 0.05;
var brightnessStep2 = 0.15;
var lightColorCount = 5;
var darkColorCount = 4;
var darkColorMap = [
    { index: 7, opacity: 0.15 },
    { index: 6, opacity: 0.25 },
    { index: 5, opacity: 0.3 },
    { index: 5, opacity: 0.45 },
    { index: 5, opacity: 0.65 },
    { index: 5, opacity: 0.85 },
    { index: 4, opacity: 0.9 },
    { index: 3, opacity: 0.95 },
    { index: 2, opacity: 0.97 },
    { index: 1, opacity: 0.98 },
];
// Wrapper function ported from TinyColor.prototype.toHsv
// Keep it here because of `hsv.h * 360`
function toHsv(_a) {
    var r = _a.r, g = _a.g, b = _a.b;
    var hsv = rgbToHsv(r, g, b);
    return { h: hsv.h * 360, s: hsv.s, v: hsv.v };
}
// Wrapper function ported from TinyColor.prototype.toHexString
// Keep it here because of the prefix `#`
function toHex(_a) {
    var r = _a.r, g = _a.g, b = _a.b;
    return "#".concat(rgbToHex(r, g, b, false));
}
// Wrapper function ported from TinyColor.prototype.mix, not treeshakable.
// Amount in range [0, 1]
// Assume color1 & color2 has no alpha, since the following src code did so.
function mix(rgb1, rgb2, amount) {
    var p = amount / 100;
    var rgb = {
        r: (rgb2.r - rgb1.r) * p + rgb1.r,
        g: (rgb2.g - rgb1.g) * p + rgb1.g,
        b: (rgb2.b - rgb1.b) * p + rgb1.b,
    };
    return rgb;
}
function getHue(hsv, i, light) {
    var hue;
    if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
        hue = light
            ? Math.round(hsv.h) - hueStep * i
            : Math.round(hsv.h) + hueStep * i;
    }
    else {
        hue = light
            ? Math.round(hsv.h) + hueStep * i
            : Math.round(hsv.h) - hueStep * i;
    }
    if (hue < 0) {
        hue += 360;
    }
    else if (hue >= 360) {
        hue -= 360;
    }
    return hue;
}
function getSaturation(hsv, i, light) {
    // grey color don't change saturation
    if (hsv.h === 0 && hsv.s === 0) {
        return hsv.s;
    }
    var saturation;
    if (light) {
        saturation = hsv.s - saturationStep * i;
    }
    else if (i === darkColorCount) {
        saturation = hsv.s + saturationStep;
    }
    else {
        saturation = hsv.s + saturationStep2 * i;
    }
    if (saturation > 1) {
        saturation = 1;
    }
    if (light && i === lightColorCount && saturation > 0.1) {
        saturation = 0.1;
    }
    if (saturation < 0.06) {
        saturation = 0.06;
    }
    return Number(saturation.toFixed(2));
}
function getValue(hsv, i, light) {
    var value;
    if (light) {
        value = hsv.v + brightnessStep1 * i;
    }
    else {
        value = hsv.v - brightnessStep2 * i;
    }
    if (value > 1) {
        value = 1;
    }
    return Number(value.toFixed(2));
}
export function generateColor(color, opts) {
    if (opts === void 0) { opts = {}; }
    var patterns = [];
    var pColor = inputToRGB(color);
    for (var i = lightColorCount; i > 0; i -= 1) {
        var hsv = toHsv(pColor);
        var colorString = toHex(inputToRGB({
            h: getHue(hsv, i, true),
            s: getSaturation(hsv, i, true),
            v: getValue(hsv, i, true),
        }));
        patterns.push(colorString);
    }
    patterns.push(toHex(pColor));
    for (var i = 1; i <= darkColorCount; i += 1) {
        var hsv = toHsv(pColor);
        var colorString = toHex(inputToRGB({
            h: getHue(hsv, i),
            s: getSaturation(hsv, i),
            v: getValue(hsv, i),
        }));
        patterns.push(colorString);
    }
    // dark theme patterns
    if (opts.theme === "dark") {
        return darkColorMap.map(function (_a) {
            var index = _a.index, opacity = _a.opacity;
            var darkColorString = toHex(mix(inputToRGB(opts.backgroundColor || "#141414"), inputToRGB(patterns[index]), opacity * 100));
            return darkColorString;
        });
    }
    return patterns;
}
// Contrast color
function getRGB(c) {
    return parseInt(c, 16);
}
function getsRGB(c) {
    return getRGB(c) / 255 <= 0.03928
        ? getRGB(c) / 255 / 12.92
        : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4);
}
function getLuminance(hexColor) {
    return (0.2126 * getsRGB(hexColor.substr(1, 2)) +
        0.7152 * getsRGB(hexColor.substr(3, 2)) +
        0.0722 * getsRGB(hexColor.substr(-2)));
}
function getContrast(f, b) {
    var L1 = getLuminance(f);
    var L2 = getLuminance(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}
var _COLOR_CONTRAST = {
    white: "#ffffff",
    black: "#000000",
};
export var getContrastColor = function (color) {
    var lightContrast = getContrast(color, _COLOR_CONTRAST.white);
    var darkContrast = getContrast(color, _COLOR_CONTRAST.black);
    if (lightContrast > darkContrast) {
        return _COLOR_CONTRAST.white;
    }
    return _COLOR_CONTRAST.black;
};
