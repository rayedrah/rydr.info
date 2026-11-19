// Brain Log theme: the smoke-grain background and pixel bolt cursor from the
// main site, plus its click and nav sounds, the spinning brain and the grey heading
// glitch (build.py copies grain.js, cursor.js, sfx.js, objects.js and textglitch.js in from ../src/scripts).
import { initGrain } from './grain.js';
import { initCursor } from './cursor.js';
import { initSfx } from './sfx.js';
import { initObjects } from './objects.js';
import { initTextGlitch } from './textglitch.js';
import { initFavicon } from './favicon.js';

initGrain();
initCursor();
initSfx();
initTextGlitch();
initObjects();
initFavicon('brain');   // animated pixel brain in the tab
