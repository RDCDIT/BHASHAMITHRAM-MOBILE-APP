# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in proguard-android-optimize.txt.

# ------------------------------------------------------------
# 1. React Native Core & TurboModules
# ------------------------------------------------------------
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.jni.** { *; }
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
    public <methods>;
}

-keepclassmembers class * extends com.facebook.react.bridge.JavaScriptModule {
    public <methods>;
}

# ------------------------------------------------------------
# 2. React Native Reanimated
# ------------------------------------------------------------
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# ------------------------------------------------------------
# 3. Expo Modules Architecture
# ------------------------------------------------------------
-keep class expo.modules.** { *; }
-keep class host.exp.exponent.** { *; }
-keep class expo.modules.core.** { *; }
-keep class expo.modules.kotlin.** { *; }

# ------------------------------------------------------------
# 4. Expo SQLite & Storage
# ------------------------------------------------------------
-keep class expo.modules.sqlite.** { *; }
-keep class io.requery.android.database.sqlite.** { *; }
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ------------------------------------------------------------
# 5. App Application Class & Activity
# ------------------------------------------------------------
-keep class org.cdit.bhashamithram2.** { *; }
-keep class com.rdcdit.bhashamithram_app.** { *; }

# ------------------------------------------------------------
# 6. Suppress non-critical warnings
# ------------------------------------------------------------
-dontwarn **
