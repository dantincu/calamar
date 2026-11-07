# Network Defense

A server should accept only the traffic it exists to serve, and each service should be boxed in so that a compromise stays small. This chapter builds a default-deny `nftables` firewall, then uses `systemd`'s sandboxing to confine a network service.
