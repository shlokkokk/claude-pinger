plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.compose.compiler)
}

android {
    namespace = "com.example.claudepulse"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.claudepulse"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        ndk {
            debugSymbolLevel = "NONE"
        }
    }

    signingConfigs {
        create("release") {
            storeFile = file("release.keystore")
            storePassword = "claudepulse123"
            keyAlias = "claudepulse"
            keyPassword = "claudepulse123"
            enableV1Signing = true
            enableV2Signing = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
      compose = true
      aidl = false
      buildConfig = false
      shaders = false
    }

    packaging {
      resources {
        excludes += "/META-INF/{AL2.0,LGPL2.1}"
        excludes += "/META-INF/*.version"
        excludes += "DebugProbesKt.bin"
      }
    }
}

kotlin {
    jvmToolchain(17)
}

dependencies {
  val composeBom = platform(libs.androidx.compose.bom)
  implementation(composeBom)

  // Core Android dependencies
  implementation(libs.androidx.core.ktx)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.activity.compose)

  // Arch Components
  implementation(libs.androidx.lifecycle.runtime.compose)
  implementation(libs.androidx.lifecycle.viewmodel.compose)

  // Compose UI & Material 3
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.material3)
  implementation("androidx.compose.material:material-icons-extended")
}
