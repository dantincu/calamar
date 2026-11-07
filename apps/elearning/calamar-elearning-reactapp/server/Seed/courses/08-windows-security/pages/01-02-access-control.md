# Access control lists

Every securable object (a file, registry key, service, process or printer) has a **security descriptor**:

| Part | Holds |
|---|---|
| Owner | the SID that can always change the permissions |
| **DACL** (discretionary ACL) | access control entries (ACEs): *allow* or *deny*, SID, rights |
| **SACL** (system ACL) | which accesses to **audit** (log), plus the mandatory integrity label |

## How an access check works

The kernel walks the DACL's ACEs in order (explicit deny, explicit allow, then inherited entries) until the requested rights are all granted, or one is denied:

- **no DACL at all** means everyone has full access (dangerous, and rare);
- an **empty DACL** means no one has access (except the owner, who can change it).

## Reading and changing permissions

```powershell
icacls C:\Data\Reports
#  C:\Data\Reports BUILTIN\Administrators:(OI)(CI)(F)
#                  CONTOSO\Finance:(OI)(CI)(M)
#                  BUILTIN\Users:(OI)(CI)(RX)
```

| Code | Means |
|---|---|
| `F`, `M`, `RX`, `R`, `W` | full control, modify, read and execute, read, write |
| `(OI)` / `(CI)` | inherited by files / by subfolders |
| `(IO)` | inherit only: applies to children, not to this object |
| `(I)` | this entry was inherited from the parent |

```powershell
icacls C:\Data\Reports /grant "CONTOSO\Auditors:(OI)(CI)RX"
icacls C:\Data\Reports /remove "BUILTIN\Users"
icacls C:\Data\Reports /inheritance:d          # stop inheriting (copy the current entries)
(Get-Acl C:\Data\Reports).Access | Format-Table IdentityReference, FileSystemRights, AccessControlType, IsInherited
```

## Rights are bit masks

`FileSystemRights` is a 32-bit mask. Named combinations are unions of individual bits:

$$
\texttt{Modify} = \texttt{Read} \lor \texttt{Write} \lor \texttt{ExecuteFile} \lor \texttt{Delete}, \qquad \texttt{FullControl} \supset \texttt{Modify}
$$

This matters when you test permissions in code. `Find-WeakPermissions.ps1` must ask "does this entry grant any **write** bit?" Its first version tested against `Write, Modify, FullControl` as a mask. Since `Modify` and `FullControl` also contain the **read** bits, every read-only entry matched, and the script flagged `C:\Windows\System32` as "writable by Users". The fix tests only the bits that let someone plant or replace a file:

$$
\text{writable} \iff (\text{rights} \wedge M) \ne 0, \quad M = \texttt{WriteData} \lor \texttt{AppendData} \lor \texttt{Delete} \lor \texttt{WriteDAC} \lor \texttt{WriteOwner} \lor \texttt{GENERIC\_WRITE} \lor \texttt{GENERIC\_ALL}
$$

and skips inherit-only entries, which apply to the children, not to the folder itself. It was then tested against a deliberately misconfigured folder, to prove it finds real problems.

## Privilege escalation through weak permissions

Attackers with a standard account look for places where they can write something that a privileged process will run:

- a **folder in the system PATH** that users can write to: plant a DLL or program that a service loads (DLL search-order hijacking);
- a **service executable**, or its folder, that users can modify: replace it, and wait for a restart;
- an **unquoted service path** with spaces: `C:\Program Files\My App\svc.exe` makes Windows try `C:\Program.exe`, then `C:\Program Files\My.exe`;
- services whose **configuration** users may change (`sc.exe sdshow <service>` shows the service's own ACL).

Run `Find-WeakPermissions.ps1` to check all three file-based paths. Badly written installers create these holes more often than you'd expect.

## Auditing access (the SACL)

To log who reads or changes sensitive files, enable the audit policy, then add SACL entries:

```powershell
auditpol /set /subcategory:"File System" /success:enable /failure:enable
```

Then add auditing entries in the folder's *Properties > Security > Advanced > Auditing* tab. Events 4663 (an object was accessed) appear in the Security log. Audit selectively: auditing every read on a busy share floods the log.
