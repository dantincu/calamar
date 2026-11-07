# Windows Firewall

Windows Defender Firewall is a stateful, host-based firewall with three **profiles**, chosen by the network you're connected to:

| Profile | Used for | Should be |
|---|---|---|
| Domain | networks where a domain controller is reachable | moderately open, for management |
| Private | home and trusted networks you marked as private | limited sharing |
| Public | everything else: cafés, airports, hotels | the strictest |

```powershell
Get-NetFirewallProfile | Format-Table Name, Enabled, DefaultInboundAction, DefaultOutboundAction
Get-NetConnectionProfile          # which profile each network uses
```

`DefaultInboundAction` showing `NotConfigured` means "the Windows default", which is **block**. `Get-SecurityPosture.ps1` says so explicitly, because the raw value confuses people.

## The baseline

`Set-FirewallBaseline.ps1` applies:

1. all three profiles **on**, unsolicited inbound traffic **blocked**, outbound allowed, and dropped packets **logged** to `pfirewall.log`;
2. on the Public profile, `AllowLocalFirewallRules False`: the "allow" rules that apps add when you click *Allow access* are ignored on public networks;
3. optionally, a narrow rule allowing Remote Desktop only from a management network, and only on the Domain and Private profiles;
4. a report of inbound allow rules that accept **any** address on public networks.

Always preview first:

```powershell
.\Set-FirewallBaseline.ps1 -WhatIf
What if: Performing the operation "Enable, block inbound by default, log dropped packets" on target "Domain profile".
...
Inbound allow rules open to any address on public networks: 78
```

Many of those are Windows' own *Core Networking* rules (DHCP, IPv6 neighbor discovery), which are needed. Review the rest: old games, media servers, development tools that once asked for access.

## Writing narrow rules

```powershell
New-NetFirewallRule -DisplayName 'Web app (lab only)' -Direction Inbound -Action Allow `
    -Protocol TCP -LocalPort 8080 -RemoteAddress 192.168.10.0/24 -Profile Private `
    -Program 'C:\Apps\web\server.exe'
```

Scope every rule by **port, remote address, profile and program**. A rule that allows TCP 8080 from anywhere on every profile is an open door that will outlive the project it was made for.

## Things the firewall can't do

- It doesn't inspect *allowed* traffic: an exposed vulnerable service is still vulnerable.
- Outbound is allowed by default. Blocking outbound traffic per application is possible, but laborious to maintain.
- Third-party security suites sometimes replace the Windows Firewall, and then *these* settings aren't what's protecting the PC.

## Remote Desktop

Exposed RDP (TCP 3389) is one of the top ransomware entry points. Never open it to the internet. Reach it through a VPN, a gateway (RD Gateway with MFA) or a zero-trust access service. Require **Network Level Authentication**, which authenticates the user before a session is created. `Get-SecurityPosture.ps1` checks both whether RDP is on, and whether NLA is required.
