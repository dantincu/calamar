# Namespaces, cgroups and container security

A container isn't a virtual machine. It's a group of ordinary processes that the kernel shows a restricted view of the system:

| Mechanism | Isolates or limits |
|---|---|
| **Namespaces**: `pid`, `net`, `mnt`, `uts`, `ipc`, `user`, `cgroup`, `time` | what the processes can *see*: their own process tree, network stack, mounts, host name… |
| **cgroups** (v2) | how much they can *use*: CPU, memory, I/O, number of processes |
| **Capabilities** | which root powers they keep |
| **seccomp** | which system calls they may make |
| **AppArmor or SELinux** | which files and resources they may touch |

```bash
$ lsns                          # the namespaces on this host
$ unshare --pid --fork --mount-proc bash   # a shell in a new PID namespace: ps shows only itself
$ cat /sys/fs/cgroup/system.slice/nginx.service/memory.max
```

**All containers share the host's kernel.** A kernel vulnerability can be an escape from every container at once. That's the main difference from VMs, and why multi-tenant platforms add another layer (gVisor, Kata Containers, Firecracker micro-VMs).

## Root in a container is root, unless…

By default, UID 0 in a container is UID 0 on the host, with reduced capabilities. If something lets it reach the host (a mounted host directory, a device, a kernel bug), it acts as root there. Defenses:

- **Run as a non-root user** inside the image (`USER 10001` in the Dockerfile).
- **User namespaces** map container root to an unprivileged host UID: rootless Podman, rootless Docker, or `userns-remap`.

## The dangerous shortcuts

| Shortcut | What it really gives |
|---|---|
| membership in the `docker` group | root on the host: `docker run -v /:/host …` |
| mounting `/var/run/docker.sock` into a container | root on the host, from inside that container |
| `--privileged` | all capabilities and all devices: practically no isolation |
| `--pid=host`, `--net=host` | the host's process list or network stack |
| `-v /:/host` or `-v /etc:/etc` | the host's files |

Treat each one like `sudo ALL`.

## A hardened `docker run`

```bash
$ docker run -d --name web \
    --user 10001:10001 \
    --read-only --tmpfs /tmp \
    --cap-drop ALL --cap-add NET_BIND_SERVICE \
    --security-opt no-new-privileges \
    --memory 512m --pids-limit 200 \
    -p 127.0.0.1:8080:8080 \
    myorg/web:1.4.2
```

- `--read-only`: the container's file system can't be modified (writes go to explicit volumes or tmpfs).
- `--cap-drop ALL`, then add back only what's needed.
- `no-new-privileges`: setuid binaries inside can't raise privileges.
- `--memory` and `--pids-limit`: a fork bomb or a leak stays inside the container.
- Publishing on `127.0.0.1` keeps the port off the network; a reverse proxy exposes it. **Docker's published ports bypass many host firewall setups** (they're handled in Docker's own nftables/iptables chains), so check from outside.

## Images

- Use minimal base images (distroless, Alpine, `-slim`): fewer packages, fewer CVEs.
- Pin versions or digests, and rebuild regularly to pick up fixes.
- Scan images (Trivy, Grype) in CI.
- Never bake secrets into images: anyone who can pull the image can read every layer.

In Kubernetes, the same ideas appear as `securityContext` (`runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false`, `capabilities.drop: ["ALL"]`) and the *restricted* Pod Security Standard.
