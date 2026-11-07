# BitLocker, the TPM and Secure Boot

## Why disk encryption

A lost or stolen laptop without disk encryption is an open book: boot another operating system from USB, or move the disk to another computer, and every file can be read, including cached credentials and browser data. **BitLocker** encrypts entire volumes, by default with XTS-AES-128.

On Windows 11 Home, **device encryption** (a simplified BitLocker) turns on automatically on supported hardware when you sign in with a Microsoft account. Pro, Enterprise and Education have full BitLocker.

```powershell
Get-BitLockerVolume | Format-Table MountPoint, VolumeStatus, ProtectionStatus, EncryptionMethod, KeyProtector   # elevated
manage-bde -status C:
```

## The TPM releases the key only to a trusted boot

The **TPM** (Trusted Platform Module) is a small security chip (or firmware component). During boot, each stage measures (hashes) the next one into the TPM's **platform configuration registers** before running it:

$$
\text{PCR}_{\text{new}} = \operatorname{SHA\text{-}256}\big(\text{PCR}_{\text{old}} \,\|\, \operatorname{SHA\text{-}256}(\text{component})\big)
$$

A PCR can only be *extended* this way, never set directly, so its final value fingerprints the entire boot chain, in order. BitLocker **seals** the volume key to specific PCR values. The TPM releases it only if the firmware, boot loader and boot configuration are exactly as expected. Boot from a USB stick, or tamper with the boot loader, and the PCRs differ: no key, and BitLocker asks for the recovery key.

## Protectors

| Protector | Protects against |
|---|---|
| TPM only | disk removal, offline attacks. The default and transparent, but the key is released at every normal boot |
| **TPM + PIN** | also an attacker with the whole powered-off device, including attacks that sniff the TPM bus during boot |
| Recovery password | your way back in after hardware changes, firmware updates or PCR changes |

For laptops with sensitive data, **TPM + PIN** is the stronger choice. The TPM's anti-hammering makes even a short PIN hard to brute-force.

## The recovery key

The 48-digit recovery password consists of 8 groups of 6 digits. Each group is a multiple of 11, which lets typos be detected, and encodes 16 bits ($\text{group} / 11 < 2^{16}$):

$$
8 \times 16 = 128 \text{ bits}
$$

That's far too many to guess. Its weakness is where it's **stored**: escrow it in Entra ID, Active Directory or your Microsoft account, or print it and lock it away. Never keep it on the encrypted disk. Without it, a failed TPM unlock means the data is gone, which is the whole point.

## Secure Boot and measured boot

- **Secure Boot** (UEFI) runs only boot loaders signed by trusted keys, which blocks bootkits and boot-level rootkits. `Confirm-SecureBootUEFI` (elevated) checks it, and `Get-SecurityPosture.ps1` reports it.
- **Measured boot** records the PCR measurements in a log that can be **attested** to a remote service (for example, Intune device health), so a compromised boot chain can be denied access to company resources.
- Keep the **firmware updated**, including Secure Boot revocation lists (DBX). Bootkits like BlackLotus (2023) exploited old, still-trusted boot managers until their revocations were deployed.

## Virtualization-based security

Windows uses the hypervisor to isolate security-critical components from the rest of the OS, even from the kernel: **Credential Guard** (previous chapter), and **memory integrity** (HVCI), which allows only signed, verified code to run in the kernel. Check *Windows Security > Device security > Core isolation*, or look for the virtualization-based security line in `Get-SecurityPosture.ps1`.
