# Security Policy

## 🔐 Security at TeacherFlow

We take the security of our users' data seriously. This document outlines our security policy and how to report vulnerabilities.

## 🛡️ Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reporting a Vulnerability

**DO NOT** open a public issue for security vulnerabilities.

### How to Report

1. **Email**: Send details to **security@teacherflow.app**
2. **Subject**: Include "SECURITY" in the subject line
3. **Details**: Provide:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information (for follow-up)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 3 business days
- **Resolution**: Depending on severity
  - **Critical (P0)**: 1-2 days
  - **High (P1)**: 1 week
  - **Medium (P2)**: 2-3 weeks
  - **Low (P3)**: Next release cycle

### What to Expect

1. **Acknowledgment**: We'll confirm receipt of your report
2. **Assessment**: We'll evaluate severity and impact
3. **Updates**: Regular progress updates every 3-5 days
4. **Resolution**: Security patch and release notes
5. **Credit**: Public acknowledgment (if desired)

## 🏆 Responsible Disclosure

We practice responsible disclosure:

1. We'll work with you to understand the issue
2. We'll develop and test a fix
3. We'll release a security update
4. We'll publish a security advisory
5. We'll credit you in our release notes (optional)

## 🎯 Scope

### In Scope

- Authentication bypass
- SQL injection
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Remote code execution (RCE)
- Privilege escalation
- Data exposure
- Broken access control
- Sensitive data in logs/errors

### Out of Scope

- Denial of Service (DoS) attacks
- Social engineering
- Physical attacks
- Brute force attacks (we have rate limiting)
- Issues in third-party dependencies (report to them first)
- Outdated software versions (we auto-update)
- Issues requiring unlikely user interaction
- Self-XSS

## 🛠️ Security Measures

### Current Protections

- ✅ **Authentication**: Bcrypt password hashing (13 rounds)
- ✅ **Authorization**: Role-based access control (RBAC)
- ✅ **Database**: Parameterized queries (SQLAlchemy ORM)
- ✅ **Rate Limiting**: Redis-based (planned)
- ✅ **HTTPS**: Enforced via HSTS headers
- ✅ **CORS**: Whitelist-based origin validation
- ✅ **XSS Protection**: Content Security Policy (CSP)
- ✅ **CSRF Protection**: Double-submit cookie (planned)
- ✅ **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- ✅ **Dependency Scanning**: Automated via GitHub Actions
- ✅ **Secret Scanning**: TruffleHog in CI/CD
- ✅ **SAST**: Semgrep for code analysis

### Upcoming Improvements

See [SECURITY_HARDENING_ROADMAP.md](./SECURITY_HARDENING_ROADMAP.md) for our complete security roadmap.

## 🔒 Data Protection

### Data Encryption

- **In Transit**: TLS 1.3
- **At Rest**: Database encryption (Neon)
- **Passwords**: Bcrypt hashing

### Data Retention

- **Active Users**: Retained indefinitely
- **Inactive Users**: 2 years, then automated deletion
- **Audit Logs**: 1 year, then archived to cold storage
- **Backups**: 30 days retention

### LGPD Compliance

We comply with Brazilian General Data Protection Law (LGPD):

- Right to access data
- Right to delete data
- Right to export data
- Right to correct data
- Consent management

See [LGPD_COMPLIANCE.md](./LGPD_COMPLIANCE.md) for details.

## 📞 Contact

- **Security Team**: security@teacherflow.app
- **Data Protection Officer (DPO)**: dpo@teacherflow.app
- **General Support**: support@teacherflow.app

## 🏅 Hall of Fame

We acknowledge security researchers who have helped improve our security:

<!-- Security researchers will be listed here -->

_No reports yet. Be the first!_

---

**Last Updated**: March 6, 2026  
**Version**: 1.0
