# Backups and incident response

## The 3-2-1 rule

- **3** copies of your data (the original and two backups),
- on **2** different kinds of storage,
- with **1** copy off-site.

For ransomware, extend it to **3-2-1-1-0**: **1** copy that is offline or **immutable** (it can't be modified or deleted, even with admin credentials: object lock, WORM storage, tape), and **0** errors when restore tests run.

Ransomware operators look for backups and destroy them first. A backup that the production administrator account can delete is not a ransomware backup.

## The math of backup frequency

Two numbers describe what you can afford to lose:

- **RPO** (recovery point objective): how much recent data you can lose. Backups every $\Delta t$ hours mean you lose up to $\Delta t$ hours of work, $\Delta t / 2$ on average.
- **RTO** (recovery time objective): how long you can be down. It's limited by restore speed: restoring $D$ bytes at throughput $B$ takes at least

$$
t_{\text{restore}} \ge \frac{D}{B}
$$

For example, 4 TB at 200 MB/s is $4 \times 10^{12} / (2 \times 10^{8}) = 20{,}000$ s, about 5.6 hours, **before** reinstalling systems, rebuilding and verifying. Measure it in a test, not on the day you need it.

## Test restores

A backup is unproven until you've restored from it. Schedule restore tests (a file, a database, a whole server), and record how long they take. That's your real RTO.

## Incident response: the first hours

Following NIST's phases (preparation, detection and analysis, containment, eradication, recovery, lessons learned):

1. **Don't panic, and don't destroy evidence.** Don't wipe or reinstall immediately.
2. **Contain**: disconnect affected machines from the network (unplug them or isolate them in the EDR, but keep them powered on). Disable compromised accounts. Block the attacker's known addresses.
3. **Communicate out of band**: assume e-mail and chat may be watched.
4. **Call for help**: your incident-response retainer or provider, your cyber insurer (they often require it, and have a panel of responders), and legal counsel.
5. **Rotate credentials**: start with administrator accounts, service accounts and keys.
6. **Determine the scope**: which systems, which data, since when. Logs shipped off-host are invaluable here.
7. **Meet your obligations**: data-protection laws (such as the GDPR's 72-hour notification to the authority) and sector rules may require notifying regulators and the people affected.
8. **Recover** from clean backups onto rebuilt systems, **after** closing the entry point.

## Prepare before it happens

- A written **incident response plan**, with contacts and decision makers.
- **Tabletop exercises**: walk through "ransomware on Monday morning" with the people who would handle it.
- Centralized, retained **logs**.
- An up-to-date **asset inventory**: you can't protect or restore what you don't know you have.
