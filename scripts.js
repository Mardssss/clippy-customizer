import { partOptions, currentIndices, setPart, cyclePart, initializeColorPickers } from './parts.js';
import { exportCharacter } from './export.js';

// Initialize defaults and color pickers
Object.keys(currentIndices).forEach(part => {
    initializeColorPickers(part);
    setPart(part, partOptions[part][currentIndices[part]]);
});

// Expose functions to global scope for HTML event handlers
window.cyclePart = cyclePart;
window.exportCharacter = exportCharacter;