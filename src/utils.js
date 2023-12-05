//via chatGPT

export function hexToHSLA(hex, a) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16) / 255;
        g = parseInt(hex.substring(3, 5), 16) / 255;
        b = parseInt(hex.substring(5, 7), 16) / 255;
    }

    // Then convert RGB to HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
        case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / d + 2;
            break;
        case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100), a];
}



export function hslaToHex(h, s, l, a) {
    console.log(h, s, l, a);
    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;
    const m = s * Math.min(l, 1 - l);
    const f = n => l - m * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    // Convert to RGB
    const r = Math.round(255 * f(0));
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4));
    const alpha = Math.round(255 * a);

    // Convert RGB to Hex
    const toHex = c => ('0' + c.toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


export function hslaToHslaString(hsla){
    return `hsla(${hsla[0]}, ${hsla[1]}%, ${hsla[2]}%, ${hsla[3]})`;
}
