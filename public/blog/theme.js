// Brain Log theme: the smoke-grain background and pixel bolt cursor from the
// main site, plus its click and nav sounds, the spinning brain and the grey heading
// glitch (build.py copies grain.js, cursor.js, sfx.js, objects.js and textglitch.js in from ../src/scripts).
import { initGrain } from './grain.js?v=2f59f300';
import { initCursor } from './cursor.js?v=2f59f300';
import { initSfx } from './sfx.js?v=2f59f300';
import { initObjects } from './objects.js?v=2f59f300';
import { initTextGlitch } from './textglitch.js?v=2f59f300';

initGrain();
initCursor();
initSfx();
initTextGlitch();
initObjects();
