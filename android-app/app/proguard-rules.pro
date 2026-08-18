# Keep data models
-keep class com.example.claudepulse.model.** { *; }

# Keep AppWidget and BroadcastReceivers
-keep class com.example.claudepulse.widget.** { *; }
-keep class com.example.claudepulse.notifications.** { *; }

# Compose rules
-keep class androidx.compose.** { *; }
