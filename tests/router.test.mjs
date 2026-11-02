import test from 'node:test';
import assert from 'node:assert/strict';
import { readRoute } from '../js/lib/router.js';

test('cold document anchors still resolve a mountable homepage', () => {
  for (const hash of ['', '#', '#contenido', '#seleccion', '#unknown', '#%malformed']) {
    assert.equal(readRoute(hash).path, '/');
  }
  assert.equal(readRoute('#contenido').anchor, 'contenido');
});

test('catalog and product deep links retain their route and encoded query', () => {
  const route = readRoute('#/catalogo?categoria=collares&q=coraz%C3%B3n%3F');
  assert.equal(route.path, '/catalogo');
  assert.equal(route.params.get('categoria'), 'collares');
  assert.equal(route.params.get('q'), 'corazón?');
  assert.equal(readRoute('#/producto/corazon').path, '/producto/corazon');
  assert.equal(readRoute('#/no-existe').path, '/no-existe');
});
