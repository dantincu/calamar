# Wi-Fi and VPNs

## Wi-Fi security

| Standard | Status |
|---|---|
| Open (no password) | anyone nearby can read unencrypted traffic; OWE ("Enhanced Open") adds encryption without a password |
| WEP | broken in minutes; never use |
| WPA2-Personal (PSK) | OK with a long random passphrase; a captured handshake allows **offline** guessing of weak ones |
| WPA3-Personal (SAE) | resists offline guessing; use it where your devices support it |
| WPA2/WPA3-Enterprise (802.1X) | per-user credentials; the standard for organizations |

Router checklist:

- WPA3 (or WPA2/WPA3 mixed mode), with a long random passphrase.
- **Change the admin password**, and turn off remote administration.
- Turn off **WPS**: its PIN method is easily brute-forced.
- Keep the firmware updated, and replace routers that no longer get updates.
- Put IoT devices and guests on a separate network.

## Public Wi-Fi

With HTTPS everywhere, public Wi-Fi is much less dangerous than it used to be. The remaining risks:

- **Evil twins**: a fake access point with the café's name, which can intercept DNS and show fake login pages. HTTPS with HSTS still protects your connections to known sites, but don't type passwords into captive portals that look like a real service, and don't click through certificate warnings, ever.
- **Unencrypted apps and protocols**, which are rare today, but still exist.
- **Attacks on your device** from others on the same network: keep the firewall on, and mark the network as public.

## VPNs: what they do, and what they don't

A VPN creates an encrypted tunnel from your device to a VPN server, and your traffic leaves from there.

**It does:**

- hide your traffic (including DNS) from the local network and your ISP;
- give access to private company networks (its original purpose);
- change your apparent IP address and location.

**It doesn't:**

- make you anonymous: the VPN provider sees everything your ISP used to see, so you're shifting trust, not removing it;
- protect against phishing, malware or tracking by cookies and logins;
- make insecure sites secure: from the VPN server to the site, it's the open internet.

For organizations, **WireGuard** (a modern, minimal protocol) and IPsec/IKEv2 are the usual choices. Increasingly, **zero-trust network access** replaces "VPN in = trusted": each application checks the user's identity and device health on every request, instead of trusting anything on the internal network.
