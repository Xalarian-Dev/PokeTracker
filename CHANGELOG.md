# ChangeLog - PokeTracker

## 2026-01-09 - Session Security Update 🔒

### New Features
- **Automatic Session Timeout**: Users are now automatically logged out after 1 hour of inactivity
- **Warning Modal**: A warning appears 2 minutes before automatic logout with a countdown timer
- **Session Expiration Detection**: The app now detects when your session has expired and prompts you to log in again
- **Automatic Page Refresh**: After timeout, the page automatically refreshes to clear sensitive data

### Security Improvements
- ✅ Protection against unauthorized access on shared devices
- ✅ Automatic logout on API authentication failures (401 errors)
- ✅ Multi-layer session management (client + server)
- ✅ Activity detection (mouse, keyboard, scroll, touch)

### Technical Details
- Client-side inactivity timeout: 1 hour
- Server-side session lifetime: 7 days (Clerk)
- Warning before logout: 2 minutes
- Supported languages: EN, FR, JP

---

## Future Updates

Check back here for new features and improvements!

---

*Last updated: January 9, 2026*
