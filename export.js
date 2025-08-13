export async function exportCharacter() {
    const format = document.querySelector('#format').value;
    const resolution = parseInt(document.querySelector('#resolution').value);
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');

    // Clear canvas with transparent background for PNG/SVG
    if (format === 'image/png' || format === 'image/svg+xml') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        // White background for JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
                img.onerror = resolve;
            });
        }
        const dataURL = canvas.toDataURL(format);
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `custom-character.${format.split('/')[1]}`;
        link.click();
    } else {
        // For SVG export, combine SVGs into a single SVG
        let svgContent = `<svg width="${resolution}" height="${resolution}" xmlns="http://www.w3.org/2000/svg">`;
        for (const layer of layers) {
            const bg = window.getComputedStyle(layer).backgroundImage;
            const urlMatch = bg.match(/url\(["']?([^"']*)["']?\)/);
            const url = urlMatch ? urlMatch[1] : null;
            if (!url) continue;
            try {
                const response = await fetch(url);
                const svgText = await response.text();
                // Extract inner content (remove outer <svg> tags)
                const innerContent = svgText.replace(/<svg[^>]*>|<\/svg>/gi, '');
                svgContent += innerContent;
            } catch (e) {
                console.error('Failed to fetch SVG:', e);
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