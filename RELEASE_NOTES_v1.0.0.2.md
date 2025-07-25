# 🚀 MoonMic v1.0.0.2 Release

## 🔧 Bug Fixes
- **Fixed GitHub Actions security check false positive** - The workflow was incorrectly detecting itself as a security issue
- **Resolved Chrome Web Store rejection** - Removed unnecessary `storage` permission that was causing 'Purple Potassium' rejection

## 🔒 Security Improvements
- **Removed exposed GitHub token** - Revoked and replaced with secure SSH authentication
- **Cleaned repository** - No more exposed credentials in git history
- **Fixed security workflow** - GitHub Actions now properly excludes workflow files from token detection

## 📋 Changes Made
- Updated manifest version to 1.0.0.2
- Removed `storage` permission from manifest.json (was unused)
- Fixed GitHub Actions workflow to exclude itself from security scans
- Set up secure SSH authentication for repository access

## 🎯 Chrome Web Store Compliance
- Extension now only requests minimum required permissions:
  - `activeTab` - for interacting with current tab
  - `scripting` - for injecting content scripts
- Should resolve 'Purple Potassium' excessive permissions rejection

## 📦 Installation
Download the latest release and load as an unpacked extension in Chrome for testing.

## 🔗 Links
- [GitHub Repository](https://github.com/MoonMic/MoonMic)
- [Chrome Web Store](Coming Soon)

---
*This release addresses the Chrome Web Store rejection and improves overall security.* 