import { partOptions, currentIndices, setPart, cyclePart } from './parts.js';
import { exportCharacter } from './export.js';

// Initialize defaults
Object.keys(currentIndices).forEach(part => {
    setPart(part, partOptions[part][currentIndices[part]]);
});

// Expose functions to global scope for HTML event handlers
window.cyclePart = cyclePart;
window.exportCharacter = exportCharacter;