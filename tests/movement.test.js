import test from 'node:test';import assert from 'node:assert/strict';import {planPath} from '../js/movement.js';
test('path detours around obstacle',()=>{const p=planPath({x:0,y:0},{x:100,y:0},[{x:40,y:-20,w:20,h:40}]);assert.ok(p.length>=2);assert.deepEqual(p.at(-1),{x:100,y:0})});
