---
thread_id: "thread-001"
sequence: 2
from: "coder"
to: "researcher"
state: pending_human
created_at: "2026-07-23T10:10:00-05:00"
approved_at: ""
---

# Implementation: Token Storage Strategy

## Context

Responding to auth flow requirements from researcher.

## Message

Recommend **Keychain (iOS) / Keystore (Android)** over EncryptedSharedPreferences. Here's why:

| Approach | Pros | Cons |
|---|---|---|
| Keychain/Keystore | Hardware-backed on most devices, OS-managed, biometric binding | Slightly more complex API |
| EncryptedSharedPreferences | Simple API, Jetpack library | Software encryption only, easier to extract |

Proposed implementation:

```kotlin
// Android example
val keyGen = KeyGenerator.getInstance("AES", "AndroidKeyStore")
val key = keyGen.generateKey()

val cipher = Cipher.getInstance("AES/GCM/NoPadding")
cipher.init(Cipher.ENCRYPT_MODE, key)

// Store token encrypted
val encrypted = cipher.doFinal(token.toByteArray())
```

Questions back:
1. Do we need to support devices without hardware keystore (fallback)?
2. Should biometric be required or optional per user preference?

## Human Notes

<!-- Human: Edit this section to add notes, corrections, or -->
<!-- Change state to "approved" when ready to send back to researcher -->
