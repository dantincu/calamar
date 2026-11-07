# Disks and file systems

## How full is it?

```bash
$ df -h                          # space per mounted file system
$ df -i                          # inodes per file system
$ du -sh /var/log                # the total size of a directory
$ du -h --max-depth=1 /var | sort -h   # which subdirectory is big?
$ ncdu /                         # interactive explorer (install it)
```

The attached `disk-report.sh` (from the scripting chapter) turns `df` into a warning you can schedule.

## Block devices and partitions

```bash
$ lsblk                          # disks, partitions, sizes and mount points, as a tree
$ lsblk -f                       # with file system types and UUIDs
$ sudo fdisk -l                  # partition tables
```

Names: `/dev/sda`, `/dev/sdb`… for SATA and USB disks, with partitions `/dev/sda1`… NVMe disks are `/dev/nvme0n1`, with partitions `/dev/nvme0n1p1`…

## Preparing a new disk

```bash
$ sudo parted /dev/sdb mklabel gpt                       # a GPT partition table (THIS ERASES THE DISK)
$ sudo parted -a optimal /dev/sdb mkpart data ext4 0% 100%
$ sudo mkfs.ext4 -L data /dev/sdb1                       # create a file system
$ sudo mkdir /srv/data
$ sudo mount /dev/sdb1 /srv/data                         # attach it to the tree
```

Triple-check the device name before `parted` and `mkfs`. They don't ask "are you sure?".

| File system | Notes |
|---|---|
| ext4 | the default on Debian and Ubuntu; mature and reliable |
| XFS | the default on RHEL; good with large files and parallel I/O |
| Btrfs | snapshots, checksums, compression; the default on Fedora and openSUSE |

## Mounting at boot: /etc/fstab

```
# <device>                                 <mount point>  <type>  <options>          <dump> <fsck order>
UUID=5f2a7c1e-...-9b3d                      /srv/data      ext4    defaults,noatime   0      2
```

Use the **UUID** (from `lsblk -f`), not `/dev/sdb1`, because device names can change between boots. Then test **before** rebooting, since a broken fstab can stop the system from booting:

```bash
$ sudo findmnt --verify          # check fstab
$ sudo mount -a                  # mount everything in fstab now
```

Add `nofail` to the options of disks that might be absent, like USB drives.

## Space arithmetic

Disk vendors use decimal units, and many tools use binary ones:

$$
1\ \text{TB} = 10^{12}\ \text{bytes}, \qquad 1\ \text{TiB} = 2^{40}\ \text{bytes} \approx 1.0995 \times 10^{12}\ \text{bytes}
$$

So a "1 TB" disk shows as about $10^{12} / 2^{40} \approx 0.909\ \text{TiB}$, which `df -h` prints as `932G` (it means GiB). ext4 also reserves 5% for root by default (`tune2fs -m 1 /dev/sdb1` lowers it on data disks).
