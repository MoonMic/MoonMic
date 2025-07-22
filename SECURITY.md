# 🔒 Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of MoonMic seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### 🚨 How to Report a Security Issue

**Please DO NOT create a public GitHub issue for security vulnerabilities.**

Instead, please report security issues via one of the following methods:

1. **Email**: Send details to `moonmic841@gmail.com` with subject line `[SECURITY] MoonMic Vulnerability Report`
2. **Private Issue**: Create a private security advisory on GitHub (if you have access)
3. **Direct Message**: Contact the maintainers directly

### 📋 What to Include in Your Report

Please include the following information in your security report:

- **Description**: A clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: Potential impact of the vulnerability
- **Environment**: Browser version, extension version, OS details
- **Proof of Concept**: If possible, include a proof of concept
- **Suggested Fix**: If you have suggestions for fixing the issue

### ⏱️ Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity (1-30 days)
- **Public Disclosure**: After fix is deployed and tested

## Security Features

### 🔐 Extension Security

#### Content Security Policy (CSP)
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'",
    "sandbox": "script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'self'"
  }
}
```

#### Permissions
- **Host Permissions**: Limited to specific domains (axiom.trade, neo.bullx.io)
- **Active Tab**: Only when extension is activated
- **Microphone**: Only for voice chat functionality
- **Storage**: Local storage only, no cloud sync

#### Data Handling
- **No Personal Data**: Extension doesn't collect or store personal information
- **Local Storage**: All data stored locally in browser
- **No Tracking**: No analytics or tracking code
- **No External Requests**: Except to user's own voice chat server

### 🛡️ Server Security

#### WebSocket Security
- **CORS Protection**: Configured for specific origins
- **Input Validation**: All user inputs sanitized
- **Rate Limiting**: Protection against abuse
- **Connection Limits**: Maximum concurrent connections per room

#### Data Protection
- **No Persistent Storage**: Server doesn't store user data
- **Session Management**: Temporary session data only
- **Encryption**: WebRTC peer-to-peer encryption
- **HTTPS/WSS**: Secure connections only

### 🔍 Security Best Practices

#### Code Security
- **Input Sanitization**: All user inputs validated
- **XSS Prevention**: Content Security Policy enforced
- **CSRF Protection**: Token-based authentication
- **SQL Injection**: No database queries (not applicable)

#### Network Security
- **HTTPS Only**: All connections use secure protocols
- **Certificate Validation**: Proper SSL/TLS validation
- **No Mixed Content**: All resources loaded over HTTPS
- **Secure Headers**: Helmet.js security headers

## Security Audit

### 🔍 Regular Security Checks

We perform regular security audits including:

- **Dependency Scanning**: Automated vulnerability scanning
- **Code Review**: Manual security code reviews
- **Penetration Testing**: Regular security testing
- **Third-party Audits**: External security assessments

### 📊 Security Metrics

- **Vulnerability Response Time**: < 48 hours
- **Patch Deployment Time**: < 7 days for critical issues
- **Security Review Frequency**: Monthly
- **Dependency Updates**: Weekly automated checks

## Known Security Considerations

### ⚠️ WebRTC Security

**WebRTC exposes your IP address** to other participants in the voice chat. This is a standard WebRTC behavior and not a vulnerability in our code.

**Mitigation**: Use a VPN if you want to hide your IP address.

### 🔇 Microphone Access

**The extension requires microphone access** for voice chat functionality. This is necessary for the core feature.

**Mitigation**: 
- Microphone is only accessed when you explicitly join a voice chat
- You can revoke microphone access at any time in browser settings
- No audio is recorded or stored

### 🌐 Network Exposure

**Voice chat server URL is visible** in the extension code. This is necessary for functionality.

**Mitigation**:
- Use your own server instance
- Keep server URL private if desired
- Server doesn't store any user data

## Security Updates

### 🔄 Update Process

1. **Vulnerability Discovery**: Security issue identified
2. **Assessment**: Impact and severity evaluated
3. **Fix Development**: Security patch created
4. **Testing**: Thorough security testing
5. **Deployment**: Patch deployed to all platforms
6. **Notification**: Users notified of update
7. **Documentation**: Security advisory published

### 📢 Security Advisories

Security advisories are published for:
- Critical vulnerabilities (CVSS 9.0-10.0)
- High severity issues (CVSS 7.0-8.9)
- Medium severity issues (CVSS 4.0-6.9)
- Low severity issues (CVSS 0.1-3.9)

## Responsible Disclosure

### 🏆 Recognition

We recognize security researchers who responsibly disclose vulnerabilities:

- **Hall of Fame**: Listed in SECURITY.md
- **Credits**: Mentioned in release notes
- **Acknowledgments**: Public recognition for significant contributions

### 📋 Disclosure Timeline

1. **Discovery**: Vulnerability found
2. **Report**: Security report submitted
3. **Acknowledgment**: Report acknowledged within 48 hours
4. **Investigation**: Issue investigated and assessed
5. **Fix**: Security patch developed
6. **Testing**: Patch thoroughly tested
7. **Deployment**: Fix deployed to production
8. **Disclosure**: Public disclosure after fix is live

## Security Resources

### 📚 Additional Information

- **Chrome Extension Security**: [Chrome Developer Documentation](https://developer.chrome.com/docs/extensions/mv3/security/)
- **WebRTC Security**: [WebRTC Security Considerations](https://webrtc-security.github.io/)
- **Content Security Policy**: [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### 🛠️ Security Tools

- **Chrome DevTools**: Built-in security analysis
- **Lighthouse**: Security auditing
- **OWASP ZAP**: Security testing
- **npm audit**: Dependency vulnerability scanning

## Contact Information

### 🔗 Security Contacts

- **Primary**: moonmic841@gmail.com
- **GitHub**: Create private security advisory
- **Response Time**: Within 48 hours

### 📞 Emergency Contacts

For critical security issues requiring immediate attention:
- **Email**: moonmic841@gmail.com (Subject: [URGENT] Security Issue)
- **Priority**: Immediate response guaranteed

---

**Thank you for helping keep MoonMic secure! 🔒**

*Last updated: July 2024* 