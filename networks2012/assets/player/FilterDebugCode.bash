echo Filtering Debug Code out of DHTML Player...


echo KeynoteDHTMLPlayer...
cat KeynoteDHTMLPlayer.js | sed -f FilterDebugCode.sed > KeynoteDHTMLPlayer.release.js
rm KeynoteDHTMLPlayer.js
mv KeynoteDHTMLPlayer.release.js KeynoteDHTMLPlayer.js

echo OrientationController...
cat OrientationController.js | sed -f FilterDebugCode.sed > OrientationController.release.js
rm OrientationController.js
mv OrientationController.release.js OrientationController.js

echo TouchController...
cat TouchController.js | sed -f FilterDebugCode.sed > TouchController.release.js
rm TouchController.js
mv TouchController.release.js TouchController.js

echo TextureManager...
cat TextureManager.js | sed -f FilterDebugCode.sed > TextureManager.release.js
rm TextureManager.js
mv TextureManager.release.js TextureManager.js

echo StageManager...
cat StageManager.js | sed -f FilterDebugCode.sed > StageManager.release.js
rm StageManager.js
mv StageManager.release.js StageManager.js

echo ShowController...
cat ShowController.js | sed -f FilterDebugCode.sed > ShowController.release.js
rm ShowController.js
mv ShowController.release.js ShowController.js

echo ScriptManager...
cat ScriptManager.js | sed -f FilterDebugCode.sed > ScriptManager.release.js
rm ScriptManager.js
mv ScriptManager.release.js ScriptManager.js

echo DisplayManager...
cat DisplayManager.js | sed -f FilterDebugCode.sed > DisplayManager.release.js
rm DisplayManager.js
mv DisplayManager.release.js DisplayManager.js

echo AnimationManager...
cat AnimationManager.js | sed -f FilterDebugCode.sed > AnimationManager.release.js
rm AnimationManager.js
mv AnimationManager.release.js AnimationManager.js

echo Done.