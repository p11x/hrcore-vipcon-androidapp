# Android Build Issues

## Context
We attempted to build the Android APK for this Capacitor project in the AI Studio environment, but encountered several environment and dependency issues that prevented completion. This document provides the details so you can continue the work in Android Studio.

## Issues Encountered

1. **Java & Android SDK Dependencies**: 
   The initial environment lacked Java 17 and the Android SDK. We successfully installed `openjdk-17-jdk-headless` and the Android SDK Command-line Tools (platform-tools, platforms;android-34, build-tools;34.0.0).

2. **Gradle Wrapper Corruption**:
   During the build (`./gradlew assembleDebug`), we hit an issue where the Gradle wrapper jar (`android/gradle/wrapper/gradle-wrapper.jar`) was invalid or corrupt. 
   - We attempted to reinstall the wrapper using the system `gradle` package, and then downloaded the `gradle-wrapper.jar` directly from GitHub.
   - Upon running `./gradlew assembleDebug` again, Gradle 8.14.3 downloaded successfully, but the build process reported corrupt checksums for the cache:
     ```
     cache sha1-checksums.bin (/app/applet/android/.gradle/8.14.3/checksums/sha1-checksums.bin) is corrupt. Discarding.
     cache md5-checksums.bin (/app/applet/android/.gradle/8.14.3/checksums/md5-checksums.bin) is corrupt. Discarding.
     ```

3. **Build Timeout / Hang**:
   After discarding the corrupt checksums, the Gradle daemon started, but the build process (`./gradlew assembleDebug`) hung indefinitely and eventually timed out. The process was terminated.

## Recommended Next Steps in Android Studio

1. **Clean Gradle Cache**: 
   Since the Gradle cache files were reported as corrupt, it's recommended to do a full Gradle sync and clean build. You may need to clear the local `.gradle` cache.
   
2. **Sync Project with Gradle Files**:
   Open the `android/` directory in Android Studio. Let the IDE download the correct Gradle version and sync the project dependencies.

3. **Run Build**:
   Once synced, use Android Studio to build the APK (Build > Build Bundle(s) / APK(s) > Build APK(s)).

4. **Verify SDK versions**:
   Ensure your local Android Studio has SDK 34 installed, as the project is configured to compile against it.
