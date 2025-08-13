export async function exportCharacter() {
    const format = document.querySelector('#format').value;
    const resolution = parseInt(document.querySelector('#resolution').value);
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');

    // Apply background color for PNG/JPEG if no SVG background is selected
    const backgroundLayer = document.querySelector('.background');
    const backgroundImage = partOptions['background'][currentIndices['background']];
    if (!backgroundImage && (format === 'image/png' || format === 'image/jpeg')) {
        ctx.fillStyle = partColors['background'] || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (format === 'image/jpeg') {
        // White background for JPEG if SVG background is selected
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Get visible layers
    const layers = Array.from(document.querySelectorAll('.layer'))
        .filter(layer => window.getComputedStyle(layer).display !== 'none');

    // Draw layers for PNG/JPEG
    if (format !== 'image/svg+xml') {
        for (const layer of layers) {
            await new Promise((resolve) => {
                const bg = window.getComputedStyle(layer).backgroundImage;
                const urlMatch = bg.match(/url\(["']?([^"']*)["']?\)/);
                const url = urlMatch ? urlMatch[1] : null;
                if (!url) return resolve();
                const img = new Image();
                img.src = url;
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load image for layer ${layer.classList[1]}:`, url);
                    resolve();
                };
            });
        }
        const dataURL = canvas.toDataURL(format);
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `custom-character.${format.split('/')[1]}`;
        link.click();
    } else {
        // For SVG export, combine SVGs with applied colors
        let svgContent = `<svg width="${resolution}" height="${resolution}" xmlns="http://www.w3.org/2000/svg">`;
        // Add background color as a rect if no SVG background
        if (!backgroundImage) {
            svgContent += `<rect width="100%" height="100%" fill="${partColors['background'] || '#ffffff'}" />`;
        }
        for (const layer of layers) {
            const part = layer.classList[1];
            const url = partOptions[part][currentIndices[part]];
            if (!url) continue;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                let svgText = await response.text();
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const elements = svgDoc.querySelectorAll('[fill]');
                elements.forEach(el => {
                    const originalColor = el.getAttribute('fill')?.toLowerCase();
                    if (originalColor && partColors[part]?.[originalColor]) {
                        el.setAttribute('fill', partColors[part][originalColor]);
                    }
                });
                const serializer = new XMLSerializer();
                const innerContent = serializer.serializeToString(svgDoc.documentElement).replace(/<svg[^>]*>|<\/svg>/gi, '');
                svgContent += innerContent;
            } catch (e) {
                console.error(`Failed to fetch SVG for ${part}:`, e);
            }
        }
        svgContent += '</svg>';

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'custom-character.svg';
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Import partOptions, currentIndices, and partColors for background handling
import { partOptions, currentIndices, partColors } from './parts.js';