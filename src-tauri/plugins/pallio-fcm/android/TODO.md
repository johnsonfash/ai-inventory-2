# Android implementation — PalliFcmPlugin.kt

This file is a placeholder. To finish the Android push side:

## 1. Add Firebase to Google Cloud + project

- In Firebase console, add an Android app with package id `app.pallio`.
- Download `google-services.json` and drop it into
  `src-tauri/gen/android/app/` (after running `npm run tauri:android:init`).
- In Firebase project settings → Cloud Messaging, enable the FCM API.

## 2. Update Gradle

`src-tauri/gen/android/app/build.gradle.kts` add:

```kotlin
plugins {
    id("com.google.gms.google-services")
}

dependencies {
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-messaging-ktx")
}
```

And at the project level (`build.gradle.kts` root):

```kotlin
plugins {
    id("com.google.gms.google-services") version "4.4.2" apply false
}
```

## 3. Write the Kotlin plugin

Create `src-tauri/gen/android/app/src/main/kotlin/.../PalliFcmPlugin.kt`:

```kotlin
package app.pallio.fcm

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Plugin
import app.tauri.plugin.JSObject
import app.tauri.plugin.Invoke
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

@TauriPlugin
class PalliFcmPlugin(private val activity: Activity): Plugin(activity) {

  @Command
  fun registerForPush(invoke: Invoke) {
    FirebaseMessaging.getInstance().token
      .addOnCompleteListener { task ->
        if (task.isSuccessful) {
          val res = JSObject()
          res.put("token", task.result)
          res.put("platform", "android")
          invoke.resolve(res)
        } else {
          invoke.reject(task.exception?.message ?: "no token")
        }
      }
  }
}

class PalliFcmService: FirebaseMessagingService() {
  override fun onNewToken(token: String) {
    // TODO: bubble back to JS via Tauri event
  }

  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    // TODO: bubble back to JS via Tauri event "push-message"
  }
}
```

## 4. Register the service in AndroidManifest

`src-tauri/gen/android/app/src/main/AndroidManifest.xml`:

```xml
<service android:name=".PalliFcmService" android:exported="false">
  <intent-filter>
    <action android:name="com.google.firebase.MESSAGING_EVENT" />
  </intent-filter>
</service>
```

## 5. Wire from JS

Same as iOS — `invoke("plugin:pallio-fcm|register_for_push")` and
`listen("push-message", ...)` from the React side.
