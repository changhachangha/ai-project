import { ColorToolInput, ColorToolOutput } from '@/lib/types/tools';

export const processColor = (input: ColorToolInput): ColorToolOutput => {
    try {
        let hex = '';
        let rgb = '';
        let hsl = '';

        const color = input.color.toLowerCase().trim();

        // Helper to convert HSL to RGB
        const hslToRgb = (h: number, s: number, l: number) => {
            s /= 100;
            l /= 100;
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
            const m = l - c / 2;
            let r = 0;
            let g = 0;
            let b = 0;

            if (0 <= h && h < 60) {
                r = c;
                g = x;
                b = 0;
            } else if (60 <= h && h < 120) {
                r = x;
                g = c;
                b = 0;
            } else if (120 <= h && h < 180) {
                r = 0;
                g = c;
                b = x;
            } else if (180 <= h && h < 240) {
                r = 0;
                g = x;
                b = c;
            } else if (240 <= h && h < 300) {
                r = x;
                g = 0;
                b = c;
            } else if (300 <= h && h < 360) {
                r = c;
                g = 0;
                b = x;
            }
            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
            return `rgb(${r},${g},${b})`;
        };

        // Helper to convert RGB to HSL
        const rgbToHsl = (r: number, g: number, b: number) => {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            let s = 0;
            const l = (max + min) / 2;

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

            return `hsl(${Math.round(h * 360)},${Math.round(s * 100)}%,${Math.round(l * 100)}%)`;
        };

        // Helper to convert RGB to Hex
        const rgbToHex = (r: number, g: number, b: number) => {
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        };

        if (color.startsWith('#')) {
            // Hex to RGB/HSL
            const hexValue = color.slice(1);
            const r = parseInt(hexValue.substring(0, 2), 16);
            const g = parseInt(hexValue.substring(2, 4), 16);
            const b = parseInt(hexValue.substring(4, 6), 16);
            hex = color;
            rgb = `rgb(${r},${g},${b})`;
            hsl = rgbToHsl(r, g, b);
        } else if (color.startsWith('rgb(')) {
            // RGB to Hex/HSL
            const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (!matches) throw new Error('Invalid RGB format');
            const r = parseInt(matches[1]);
            const g = parseInt(matches[2]);
            const b = parseInt(matches[3]);
            rgb = color;
            hex = rgbToHex(r, g, b);
            hsl = rgbToHsl(r, g, b);
        } else if (color.startsWith('hsl(')) {
            // HSL to RGB/Hex
            const matches = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (!matches) throw new Error('Invalid HSL format');
            const h = parseInt(matches[1]);
            const s = parseInt(matches[2]);
            const l = parseInt(matches[3]);
            hsl = color;
            rgb = hslToRgb(h, s, l);
            const rgbMatches = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (!rgbMatches) throw new Error('Invalid RGB conversion from HSL');
            hex = rgbToHex(parseInt(rgbMatches[1]), parseInt(rgbMatches[2]), parseInt(rgbMatches[3]));
        } else {
            throw new Error('Unsupported color format. Please use Hex, RGB, or HSL.');
        }

        return { hex, rgb, hsl };
    } catch (error: unknown) {
        return {
            hex: '',
            rgb: '',
            hsl: '',
            errorMessage: error instanceof Error ? error.message : 'Color conversion error.',
        };
    }
};
