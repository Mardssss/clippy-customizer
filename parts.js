export const partOptions = {
    'base-body': [
        '', // None
        'images/body_1.svg'
    ],
    'eyes': [
        '', // None
        'images/eyes_1.svg',
        'images/eyes_2.svg',
        'images/eyes_3.svg'
    ],
    'eyebrows': [
        '', // None
        'images/eyebrows_1.svg',
        'images/eyebrows_2.svg',
        'images/eyebrows_3.svg'
    ],
    'mustache': [
        '', // None
        'images/mustache_1.svg',
        'images/mustache_2.svg'
    ],
    'head-accessory': [
        '', // None
        'images/head_accessory_1.svg',
        'images/head_accessory_2.svg'
    ],
    'eye-accessory': [
        '', // None
        'images/eyes_accessory_1.svg',
        'images/eyes_accessory_2.svg',
        'images/eyes_accessory_3.svg'
    ]
};

export const currentIndices = {
    'base-body': 1,
    'eyes': 1,
    'eyebrows': 1,
    'mustache': 0,
    'head-accessory': 0,
    'eye-accessory': 0
};

export function setPart(part, url) {
    const layer = document.querySelector(`.${part}`);
    if (url) {
        layer.style.backgroundImage = `url(${url})`;
        layer.style.display = 'block';
    } else {
        layer.style.backgroundImage = '';
        layer.style.display = 'none';
    }
}

export function cyclePart(part, direction) {
    const options = partOptions[part];
    currentIndices[part] = (currentIndices[part] + direction + options.length) % options.length;
    setPart(part, options[currentIndices[part]]);
}