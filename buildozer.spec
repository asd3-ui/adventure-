[app]

# (str) Title of your application
title = Dungeon Raycast 3D

# (str) Package name
package.name = dungeonraycast

# (str) Package domain (needed for android/ios packaging)
package.domain = org.raycast.dungeon

# (str) Source code where the main.py lives
source.dir = .

# (list) Source files to include (let empty to include all the source directory)
source.include_exts = py,png,jpg,kv,atlas,json

# (str) Application versioning (method 1)
version = 1.0.0

# (list) Application requirements
# comma separated e.g. requirements = sqlite3,kivy
requirements = python3,pygame,numpy

# (str) Supported orientation (one of landscape, sensorLandscape, portrait or all)
orientation = landscape

# (list) Permissions
android.permissions = WAKE_LOCK,VIBRATE

# (int) Target Android API, should be as high as possible.
android.api = 33

# (int) Minimum API your APK / AAB will support.
android.minapi = 21

# (str) Android NDK version to use
android.ndk = 25b

# (bool) If True, then skip trying to update the Android sdk
# This can be useful to avoid excess downloads or save time
android.skip_update = False

# (bool) If True, then automatically accept SDK license
# agreements. This is intended for automation only.
android.accept_sdk_license = True

# (str) The Android archs to build for (arm64-v8a, armeabi-v7a, x86, x86_64)
android.archs = arm64-v8a, armeabi-v7a

# (bool) Enable AndroidX support. Required for API 31+
android.enable_androidx = True

# (list) Gradle dependencies
android.gradle_dependencies =

# (bool) Allow backup of user data
android.allow_backup = True

# (str) Presplash background color (for mobile boot)
android.presplash_color = #0a0a0f

# (str) Window state (fullscreen)
android.fullscreen = 1

[buildozer]

# (int) Log level (0 = error only, 1 = info, 2 = debug with command output)
log_level = 2

# (int) Display warning if buildozer is run as root (0 = False, 1 = True)
warn_on_root = 1
