import assert from 'node:assert/strict';
import commands from '../library/commands.mjs';

describe('The commands', function() {
    it('are listed in alphabetical order', async () => {
        const functionNames = Object.keys(commands);
        const sortedFunctionNames = structuredClone(functionNames).sort();
        assert.deepEqual(functionNames, sortedFunctionNames);
    });
});
