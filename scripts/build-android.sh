#!/bin/bash

git pull

rm -r ~/analogizer-build/

meteor build --verbose ~/analogizer-build --server=http://localhot:3000

cd ~/analogizer-build/android/project/build/outputs/apk/release

jarsigner -verbose -sigalg SHA1withRSA -tsa http://timestamp.digicert.com -digestalg SHA1 android-release-unsigned.apk analogizer

$ANDROID_HOME/build-tools/23.0.1/zipalign 4 android-release-unsigned.apk signed.apk

