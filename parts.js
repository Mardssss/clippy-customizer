export const partOptions = {
    'background': [
        '', // No background (solid color)
        'images/background_1.svg', // Pattern 1
    ],
    'base-body': [
        '', // No body
        'images/body_1.svg'
    ],
    'eyes': [
        '', // No eyes
        'images/eyes_1.svg',
        'images/eyes_2.svg',
        'images/eyes_3.svg',
		'images/eyes_4.svg',
		'images/eyes_5.svg'
    ],
    'eyebrows': [
        '', // No eyebrows
        'images/eyebrows_1.svg',
        'images/eyebrows_2.svg',
        'images/eyebrows_3.svg'
    ],
    'mustache': [
        '', // No mustache
        'images/mustache_1.svg',
        'images/mustache_2.svg'
    ],
    'head-accessory': [
        '', // No head accessory
        'images/head_accessory_1.svg',
        'images/head_accessory_2.svg'
    ],
    'eye-accessory': [
        '', // No eye accessory
        'images/eye_accessory_1.svg',
        'images/eye_accessory_2.svg',
        'images/eye_accessory_3.svg'
    ]
};

export const currentIndices = {
    'background': 1,
    'base-body': 1,
    'eyes': 1,
    'eyebrows': 1,
    'mustache': 0,
    'head-accessory': 0,
    'eye-accessory': 0
};

export const partColors = {};

export async function setPart(part, url) {
    const layer = document.querySelector(`.${part}`);
    const colorPickersContainer = document.querySelector(`#${part}-colors`);
    if (part === 'background' && !url) {
        // Handle solid background color
        layer.style.backgroundImage = 'none';
        layer.style.backgroundColor = partColors['background']?.['#ffffff'] || '#ffffff';
        layer.style.display = 'block';
        await initializeColorPickers(part);
    } else if (url) {
        // Set SVG background
        layer.style.backgroundImage = `url(${url})`;
        layer.style.backgroundColor = 'transparent';
        layer.style.display = 'block';
        await initializeColorPickers(part, url);
    } else {
        // Clear layer
        layer.style.backgroundImage = '';
        layer.style.backgroundColor = 'transparent';
        layer.style.display = 'none';
        colorPickersContainer.innerHTML = '';
        delete partColors[part];
        if (layer.dataset.blobUrl) {
            URL.revokeObjectURL(layer.dataset.blobUrl);
            delete layer.dataset.blobUrl;
        }
    }
}

export async function cyclePart(part, direction) {
    const options = partOptions[part];
    currentIndices[part] = (currentIndices[part] + direction + options.length) % options.length;
    await setPart(part, options[currentIndices[part]]);
}

export async function initializeColorPickers(part, url) {
    const colorPickersContainer = document.querySelector(`#${part}-colors`);
    colorPickersContainer.innerHTML = '';
    if (part === 'background' && !url) {
        // Initialize color picker for solid background
        partColors[part] = { '#ffffff': '#ffffff' };
        const input = document.createElement('input');
        input.type = 'color';
        input.id = `${part}-color-0`;
        input.value = '#ffffff';
        input.dataset.originalColor = '#ffffff';
        input.dataset.part = part;
        input.setAttribute('aria-label', `${part} Color`);
        input.addEventListener('change', () => {
            partColors[part]['#ffffff'] = input.value;
            const layer = document.querySelector(`.${part}`);
            layer.style.backgroundColor = input.value;
        });
        colorPickersContainer.appendChild(input);
        return;
    }
    if (!url) {
        delete partColors[part];
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const elements = svgDoc.querySelectorAll('[fill]');
        const colors = new Set();
        elements.forEach(el => {
            const fill = el.getAttribute('fill')?.toLowerCase();
            if (fill && fill !== 'none' && fill !== 'transparent' && !fill.startsWith('url(')) {
                colors.add(fill);
            }
        });

        partColors[part] = {};
        Array.from(colors).forEach((color, index) => {
            partColors[part][color] = color;
            const input = document.createElement('input');
            input.type = 'color';
            input.id = `${part}-color-${index}`;
            input.value = color;
            input.dataset.originalColor = color;
            input.dataset.part = part;
            input.setAttribute('aria-label', `${part} Color ${index + 1}`);
            input.addEventListener('change', () => {
                partColors[part][color] = input.value;
                updatePartSVG(part, url);
            });
            colorPickersContainer.appendChild(input);
        });

        await updatePartSVG(part, url);
    } catch (e) {
        console.error(`Failed to initialize color pickers for ${part}:`, e);
    }
}

export async function updatePartSVG(part, url) {
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
        const updatedSvgText = serializer.serializeToString(svgDoc.documentElement);
        const blob = new Blob([updatedSvgText], { type: 'image/svg+xml' });
        const updatedUrl = URL.createObjectURL(blob);
        const layer = document.querySelector(`.${part}`);
        layer.style.backgroundImage = `url(${updatedUrl})`;
        if (layer.dataset.blobUrl) {
            URL.revokeObjectURL(layer.dataset.blobUrl);
        }
        layer.dataset.blobUrl = updatedUrl;
    } catch (e) {
        console.error(`Failed to update SVG for ${part}:`, e);
    }
}