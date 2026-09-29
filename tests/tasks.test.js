import test from 'node:test';import assert from 'node:assert/strict';import {createRetryValidator} from '../js/tasks.js';
test('wrong answer gets one retry only',()=>{const v=createRetryValidator('ok');assert.equal(v.submit('bad').status,'retry');assert.equal(v.submit('bad').status,'failed');assert.equal(v.submit('ok').status,'locked')});
