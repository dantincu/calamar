# A default-deny firewall with nftables

**nftables** is the Linux kernel's packet filter, replacing iptables. (`ufw` and `firewalld` are friendlier front ends to it; the concepts are the same.)

## Structure

- **Tables** group chains. The `inet` family covers IPv4 and IPv6 at once.
- **Chains** attach to **hooks** in the packet path: `input` (to this machine), `forward` (through it), `output` (from it).
- **Rules** match packets and give a **verdict**: `accept`, `drop` or `reject`.
- A chain's **policy** is the verdict for packets that no rule matched.

## The attached ruleset, explained

```
chain input {
    type filter hook input priority filter; policy drop;    # deny by default

    ct state established,related accept     # replies to our connections, and ongoing accepted ones
    ct state invalid drop
    iif "lo" accept                          # local processes talking to each other
    ip protocol icmp icmp type { echo-request, destination-unreachable, time-exceeded } limit rate 10/second accept
    meta l4proto ipv6-icmp accept            # IPv6 can't work without ICMPv6
    tcp dport 22 ip saddr @ssh_allowed_v4 accept   # SSH from known addresses only
    tcp dport { 80, 443 } accept             # the public service
    limit rate 5/minute log prefix "nft input drop: "   # a sample of what's dropped
}
```

**Connection tracking** (`ct state`) is what makes a stateful firewall short: you allow *new* connections only to the services you offer, and the replies and later packets of those connections are matched by `established`. The order matters: rules are evaluated top to bottom, and the first verdict wins.

## drop or reject?

`drop` silently discards; `reject` answers "port unreachable". Drop is the usual choice for the internet (it gives scanners less information, and costs you nothing). Reject is friendlier on internal networks, where a legitimate client fails fast instead of timing out.

## Applying without locking yourself out

```bash
$ sudo nft -c -f nftables.conf            # syntax check only
$ sudo nft -f nftables.conf; sleep 120; sudo nft flush ruleset
#   ^ if you can still connect, press Ctrl+C within 2 minutes to keep the rules
$ sudo cp nftables.conf /etc/nftables.conf && sudo systemctl enable nftables
```

With a cloud provider, also use its **security groups**: a second, independent firewall outside the machine.

## Sets and rate limits

Sets make rules short and fast to evaluate, whatever their size:

```
set blocklist { type ipv4_addr; flags interval, timeout; }
ip saddr @blocklist drop
```

```bash
$ sudo nft add element inet filter blocklist { 203.0.113.0/24 timeout 1h }
```

fail2ban's `nftables` actions work exactly this way.

## Outgoing traffic

Most servers allow all outgoing traffic. Restricting it (DNS, NTP, the package mirrors, the APIs you call) makes life much harder for an intruder, who usually needs to download tools and send data out. It's more work to maintain, so start with your most sensitive machines.

## Verify from outside

The only test that counts is from another machine:

```bash
$ nmap -Pn -p- server.example.com        # every TCP port (only scan systems you're authorized to test)
$ nmap -Pn -sU --top-ports 50 server.example.com
```

Compare the result with what you intended. Anything extra is a finding.
