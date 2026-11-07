# Phishing and social engineering

Social engineering attacks **people** rather than software: it's often cheaper to ask for the password than to break the encryption.

## Common forms

| Form | Example |
|---|---|
| **Phishing** e-mail | "Your account will be suspended. Verify your details here." |
| **Spear phishing** | a message tailored with details about you, your role, your colleagues |
| **Business e-mail compromise** | "Hi, it's the CEO. Urgent wire transfer, keep this confidential." |
| **Smishing / vishing** | the same by SMS, or by phone call, increasingly with AI-cloned voices |
| **Adversary-in-the-middle phishing** | a proxy site relays the real login page, and captures the password, the MFA code *and* the session cookie |
| **Consent phishing** | "This app wants access to your mailbox": an OAuth grant to a malicious app |
| **QR code phishing** | a QR code leads to a fake login on a phone, away from corporate filters |

## The psychological levers

Almost every attack combines several of these:

- **urgency**: "within 24 hours", "immediately";
- **authority**: the CEO, IT, the police, the tax office;
- **fear or greed**: account locked, unpaid invoice, a refund, a prize;
- **familiarity**: a known brand, a colleague's name, a real ongoing project.

When you feel pressure to act *now*, that's the signal to slow down.

## Spotting a phishing link

Read the domain **right to left**, from the first single `/`:

```
https://login.microsoft.com.account-verify.co/session    ← the domain is account-verify.co
https://www.paypa1.com/                                   ← digit 1, not letter l
https://xn--pple-43d.com/                                 ← punycode for "аpple" with a Cyrillic а
```

But don't rely on spotting: attackers are good at this. Rely on **process**:

- Go to important sites by **bookmark or by typing**, never through a link in a message.
- **Verify requests through a second channel**: call the person on a known number, not the one in the e-mail.
- Let the **password manager** decide: it won't autofill on the wrong domain.
- Use **passkeys**, which can't be phished (previous lesson).

## For organizations

- **Technical controls first**: SPF, DKIM and DMARC at `p=reject`; mail filtering and link rewriting; phishing-resistant MFA; restricted OAuth app consent.
- **Make reporting easy and blame-free**: a "Report phishing" button, and thanks for every report, including false alarms. One quick report can protect the whole company.
- **Financial processes** that can't be bypassed by an e-mail: changing a supplier's bank details, or making urgent payments, requires a callback and a second approver.
- Awareness training helps, especially realistic and short. But plan for the fact that **someone will eventually click**, and make sure that one click can't compromise everything.
