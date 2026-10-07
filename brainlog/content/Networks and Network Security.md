---
publish: true
category: Cyber
status: logged
audience: Cybersecurity students
title: Networks and Network Security
date: '2026-07-24'
tags:
- google-cert
- networking
- cyber
description: 'My notes from Course 3 of the Google Cybersecurity Certificate: network
  structure, protocols, attacks, and hardening.'
allow_private_ips: true
---
# Course 3: Networks and Network Security

**What we'll learn:** Structure of a network | Network Operations | Network Attacks | Security Hardening

> "Despite this being a fairly technical field, the most important thing you're going to learn are the connections you're going to make to other people."

> "Once you have that fundamental level of skills and background, there are so many different directions you can go and so much opportunity out there."

> "Cybersecurity is a TEAM SPORT."

**TAKE THINGS APART | FEEL UNCOMFORTABLE | FIND OPPORTUNITIES | LEARN HOW THINGS WORK**

---

## Module 1: Introduction to Networks

**What we'll learn:** Structure of a network | Standard Networking Tools | Cloud Networks | TCP/IP model

### Core definitions

> **Network** — A group of connected devices.

> **Local Area Network (LAN)** — A network that spans a small area like an office building, a school, or a home.

> **Wide Area Network (WAN)** — A network that spans a large geographic area like a city, state, or country.

> An entry-level cybersecurity analyst uses command lines, log parsing, and network traffic analysis in their everyday scope of work.

- **Network traffic analysis**: looking at network traffic across various application and network layers.

### Network devices

Physical devices that form a network. Many of their functions can also be performed by **virtualization tools** (software that performs network operations).

| Device                    | Function                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hub**                   | Broadcasts information to every device on the network. Repeats all information to all ports → vulnerable to eavesdropping, mostly used in limited home-office setups now.                                                 |
| **Switch**                | Makes connections between specific devices by sending/receiving data between them. More intelligent and secure than a hub; maintains a MAC address table mapping MAC addresses to ports. Part of the **data link layer**. |
| **Router**                | Connects multiple networks together and directs traffic based on the destination network's IP address. Part of the **network layer**. Can include firewall features.                                                      |
| **Modem**                 | Connects your router to the internet (via your ISP) and brings internet access to the LAN.                                                                                                                                |
| **Firewall**              | Monitors incoming/outgoing traffic on the network; first line of defense. Rules configured by the organization.                                                                                                           |
| **Server**                | Provides information/services to clients (client-server model). Examples: DNS servers, file servers, corporate mail servers.                                                                                              |
| **Wireless access point** | Sends/receives digital signals over radio waves (Wi-Fi) to create a wireless network.                                                                                                                                     |

**Example home network layout:** modem (from ISP) → router → firewall (monitors traffic) → switch (optional, adds ports) → devices/file server. Two routers can be connected to a switch for load balancing.

Each device/desktop computer has a unique **MAC address** and **IP address** and connects via wired or wireless connection.

**Network diagrams** — maps that use small graphics and dotted lines to show devices and their connections; security analysts use them to develop and refine strategies for securing network architecture.

### Cloud networks

> **Cloud computing** — The practice of using remote servers, applications, and network services hosted on the internet instead of on local physical devices (as opposed to **on-premise** networks, where devices live at a physical location the company owns).

> **Cloud network** — A collection of servers/computers that stores resources and data in remote data centers, accessed via the internet.

A **cloud service provider (CSP)** owns large data centers globally and sells storage/compute/services to companies via API or web console.

**Three CSP service categories:**

- **SaaS (Software as a Service)** — software suites operated by the CSP, used remotely without hosting it yourself.
    
- **IaaS (Infrastructure as a Service)** — virtual computer components (containers, storage) configured remotely via API/console.
    
- **PaaS (Platform as a Service)** — tools for designing custom applications in the cloud.
    
- **Hybrid cloud** — CSP services + on-premise infrastructure combined (most orgs use this).
    
- **Multi-cloud** — using more than one CSP.
    
- **Software-defined networks (SDN)** — virtual network devices/services (virtual switches, routers, firewalls) hosted at the CSP's data center; physical hardware increasingly supports this too.
    

**Why cloud computing / SDN is beneficial:**

- **Reliability** — availability, secure connections, consistent uptime.
- **Cost** — avoids large upfront infrastructure spend; CSPs offer services at a fraction of self-hosting cost.
- **Scalability** — elastic utility model, pay for what you need, scale quickly via API/console (e.g. spinning up WAFs, IDS/IPS, L3/L4 firewalls on demand).

### Network communication

> **Data packet** — A basic unit of information that travels from one device to another within a network.

**Packet structure:** `HEADER || BODY || FOOTER`

- **Header** — IP address, MAC address, protocol number (tells the receiving end what to do with the packet).
    
- **Body** — the message.
    
- **Footer** — signals the receiving end that the packet is finished.
    
- **Bandwidth** — max data transmission capacity a device can receive per second (bits per second).
    
- **Speed** — the rate at which data packets are actually received/downloaded.
    
- **Packet sniffing** — the practice of capturing and inspecting data packets across a network.
    

### TCP/IP model

> **TCP** — An internet communication protocol that allows two devices to form a connection and stream data (organizes data so it can travel across a network).

> **IP** — A set of standards for routing and addressing data packets between devices. Includes the **IP address**, which functions as the address for each device on a network.

| |IP|TCP|
|---|---|---|
|Job|Addressing & routing|Reliability & ordering|
|Guarantees delivery?|No (best-effort)|Yes (retransmits lost packets)|
|Cares about order?|No|Yes (reorders packets)|
|Needs a connection first?|No|Yes (handshake)|
|Analogy|The postal service (delivers envelopes)|The courier ensuring nothing's lost/out of order|

**IP gets packets moving to the right address; TCP makes sure they all show up intact and in order.**

> **Port** — A software-based location that organizes the sending/receiving of data between devices; splits traffic and prioritizes operations.

Common ports: **25** (email) · **443** (secure internet communication) · **20** (large file transfers)

**The four TCP/IP layers:**

|Layer|Also called|Function|Key protocols|
|---|---|---|---|
|**Network Access**|Data Link Layer|Creation/transmission of data packets across physical hardware|ARP|
|**Internet**|Network Layer|Attaches IP address so packets know their destination|IP, ICMP|
|**Transport**|—|Error control, ensures smooth transport|TCP, UDP|
|**Application**|—|Determines how packets interact with receiving devices (file transfers, email, etc.)|HTTP, SMTP, SSH, FTP, DNS|

- **ARP (Address Resolution Protocol)** — part of the network access layer.
- **ICMP** — shares error info/status updates: reports dropped/lost packets, connectivity issues, packets redirected to other routers.
- **TCP** contains the destination service's port number in its header.
- **UDP** is connectionless.
- Application layer protocols rely on the layers below them to actually move the data.

**TCP/IP vs OSI:** Both are conceptual models for visualizing data transmission between systems. TCP/IP has **4 layers**; it's essentially a simplified/condensed version of the OSI model's **7 layers**. Some orgs favor one model over the other, so security analysts should know both.

### The OSI Model (7 layers)

Working from Layer 7 (user-facing) down to Layer 1 (physical):

|Layer|Name|Function|Addressing / Notes|
|---|---|---|---|
|7|**Application**|User's direct connection to the internet via applications/requests (e.g. browser using HTTP/HTTPS, email using SMTP, DNS translating domain names to IPs)|—|
|6|**Presentation**|Encryption, compression, confirms character code sets are interpretable by the receiving system|e.g. SSL, which encrypts data between browsers and web servers for HTTPS|
|5|**Session**|Keeps the session open during transfer, handles authentication, reconnection, and checkpoints if the connection drops; requests to layer 4, responds to layer 6|—|
|4|**Transport**|Delivers data between devices; controls speed/flow; segments data into smaller pieces and reassembles at destination|Port Number · protocols: TCP, UDP|
|3|**Network**|Logical addressing and routing packets between different networks; reads frame address to find destination|IP Address|
|2|**Data Link**|Communication within a single local network segment; home of switches and NICs|MAC Address · protocols: NCP, HDLC, SDLC|
|1|**Physical**|The physical cables, hubs, modems; translates packets into a stream of 0s and 1s for transmission over the wire|—|

**Key takeaway:** Both models help visualize data transmission and communicate where disruptions/threats occur. OSI's extra granularity (7 vs 4 layers) helps pinpoint exactly where in the stack an attack or failure happened.

### IP and MAC addressing

> **IP address** — A unique string of characters that identifies the location of a device on the internet. (IPv4 / IPv6)

> **MAC address** — A unique alphanumeric identifier assigned to each physical device on a network.

**IPv4 vs IPv6:**

| |IPv4|IPv6|
|---|---|---|
|Format|4 decimal numbers (0–255), separated by periods|8 hexadecimal groups, separated by colons|
|Size|4 bytes|16 bytes|
|Address space|~4.3 billion addresses|340 undecillion addresses|
|Example|`198.51.100.0`|`2002:0db8:0000:0000:0000:ff21:0023:1234` (can shorten consecutive zero groups to `::`)|
|Header|More fields (IHL, Identification, Flags)|Simpler; adds a Flow Label field for special routing handling|

IPv6 was developed to solve **IPv4 address exhaustion**. It also offers more efficient routing and eliminates private address collisions that can occur on IPv4.

### Fields of an IPv4 packet header (13 fields, 20–60 bytes total)

|Field|Purpose|
|---|---|
|**Version (VER)**|4-bit field telling the receiving device which IP protocol version is used (e.g. IPv4).|
|**IP Header Length (HLEN/IHL)**|Length of the header; marks where header ends and data begins.|
|**Type of Service (ToS)**|Lets routers prioritize packets to maintain quality of service.|
|**Total Length**|Total size of the packet (header + data); max 65,535 bytes.|
|**Identification**|Unique ID for reassembling fragments of an oversized original packet.|
|**Flags**|Tells the router whether the packet was fragmented, and how many fragments remain.|
|**Fragmentation Offset**|Tells routing devices where a fragment belongs in the original packet.|
|**Time to Live (TTL)**|Counter set by the source, decremented at each router hop; at 0 the packet is dropped and an ICMP Time Exceeded message is returned to the sender.|
|**Protocol**|Tells the receiving device which protocol the data portion uses.|
|**Header Checksum**|Detects corruption of the header in transit; corrupted packets are discarded.|
|**Source IP Address**|IPv4 address of the sender.|
|**Destination IP Address**|IPv4 address of the destination.|
|**Options**|Allows security options to be applied if HLEN > 5.|

**Security angle:** analyzing these fields reveals where a packet came from, where it's going, and what protocol it's using — critical info when inspecting suspicious packets.

---

## Module 2: Network Operations

**What we'll learn:** Network Protocols | VPNs | Firewalls, Security Zones, and Proxy Servers

### Network protocols overview

> **Network protocol** — A set of rules used by two or more devices on a network to describe the order of delivery and the structure of data. A shared "language" for devices to understand each other.

Protocols matter for security because vulnerabilities in them can be exploited — e.g. a malicious actor abusing DNS to redirect traffic from a legitimate site to a malicious one.

**Three categories: communication, management, security.**

**Communication protocols** (govern data exchange, timing, and recovery of lost data):

- **TCP** — three-way handshake: device sends **SYN** → server responds **SYN/ACK** → device sends final **ACK** → connection established. Transport layer.
- **UDP** — connectionless, less reliable but faster; used for things like DNS requests. Transport layer.
- **HTTP** — port 80, application layer; being replaced by HTTPS since it's insecure.
- **DNS** — translates domain names to IP addresses; normally UDP port 53, switches to TCP for large replies. Application layer.

**Management protocols** (monitoring/managing network activity):

- **SNMP** — monitors/manages network devices; can reset passwords, change baseline configs, report bandwidth usage. Application layer.
- **ICMP** — reports transmission errors between devices; basis of the `ping` command. Internet layer.

**Security protocols** (encrypt data in transit):

- **HTTPS** — secure HTTP using SSL/TLS encryption, port 443. Application layer.
- **SFTP** — secure file transfer using SSH, typically TCP port 22; commonly used with cloud storage uploads/downloads. Application layer.

> **Note:** encryption protocols like these don't conceal the source/destination IP address — an attacker intercepting encrypted traffic can still learn some basic info about it.

### Additional network protocols

> **NAT (Network Address Translation)** — The router swaps a device's private IP address for the router's public IP address when sending traffic outside the home network (and reverses it for responses). Spans layer 2 (internet) and layer 3 (transport) of the TCP/IP model.

| |Private IP addresses|Public IP addresses|
|---|---|---|
|Assigned by|Router|ISP and IANA|
|Uniqueness|Unique only within the private network|Unique globally|
|Cost|Free|Costs to lease|
|Example ranges|10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255, 192.168.0.0–192.168.255.255|The rest of the assignable space|

> **DHCP (Dynamic Host Configuration Protocol)** — Management-family, application layer protocol; works with the router to assign a unique IP to each device and provide the appropriate DNS server / default gateway. Servers use UDP port 67, clients use UDP port 68.

> **ARP (Address Resolution Protocol)** — Translates IP addresses found in data packets into the MAC address of the hardware device when the MAC address is unknown. Network Access Layer protocol; no port number since it's not an application-layer protocol. Each device tracks IP↔MAC matches in an **ARP cache**.

> **SSH (Secure Shell)** — Creates a secure connection with a remote system; TCP port 22; more secure replacement for Telnet.

**Other application-layer protocols:**

- **Telnet** — connects to a remote system in clear text (insecure); TCP port 23.
- **POP3** — retrieves/downloads email locally from a mail server; unencrypted TCP/UDP port 110, encrypted (SSL/TLS) TCP/UDP port 995. Mail may or may not stay on the server after download, so syncing across devices isn't guaranteed.
- **IMAP** — downloads email headers/content but keeps content on the server, enabling multi-device sync and partial reading before a message finishes downloading; unencrypted TCP port 143, encrypted (TLS) TCP port 993.
- **SMTP** — transmits/routes email from sender to recipient, works with Message Transfer Agent (MTA) software to resolve addresses via DNS; unencrypted TCP/UDP port 25 (often abused for spam), encrypted (TLS) TCP/UDP port 587.

**Port reference table:**

| Protocol             | Port                                              |
| -------------------- | ------------------------------------------------- |
| DHCP                 | UDP 67 (servers) / UDP 68 (clients)               |
| ARP                  | none                                              |
| Telnet               | TCP 23                                            |
| SSH                  | TCP 22                                            |
| POP3                 | TCP/UDP 110 (unencrypted) / TCP/UDP 995 (SSL/TLS) |
| IMAP                 | TCP 143 (unencrypted) / TCP 993 (SSL/TLS)         |
| SMTP                 | TCP/UDP 25 (unencrypted)                          |
| SMTPS                | TCP/UDP 587 (TLS)                                 |
| HTTP                 | 80                                                |
| HTTPS                | 443                                               |
| Large file transfers | 20                                                |
| Email (general)      | 25                                                |

Firewalls can filter traffic based on these port numbers (e.g. only allowing POP3 access from IPs belonging to the org).

### Wireless protocols

> **IEEE 802.11 (Wi-Fi)** — A set of standards defining communication for wireless LANs; a suite of protocols for wireless communication.

> **WPA (Wi-Fi Protected Access)** — A wireless security protocol for devices to connect to the internet.

- **WEP (Wired Equivalent Privacy)** — designed to give wireless connections the same privacy level as wired ones.
- **WPA** — uses **Temporal Key Integrity Protocol (TKIP)**.
- **WPA2/WPA3** — WPA3 encrypts traffic with AES as it travels from device to access point. Both offer **personal mode** (home networks) and **enterprise mode** (business networks/applications).

### Firewalls

> **Firewall** — A network security device that monitors traffic to and from a network.

- **Port filtering** — a firewall function that blocks/allows certain ports to limit unwanted communication.

**Firewall types (by deployment):** Hardware · Software · **Cloud-based** (software firewalls hosted by a CSP).

**Firewall types (by behavior):**

- **Stateful** — tracks information passing through it and proactively filters threats based on behaviors/patterns; only needs a rule in one direction since it uses a state table to match return traffic to an existing session.
- **Stateless** — operates on predefined rules only, doesn't track packet info; needs rules configured in both directions.

**Next-generation firewalls (NGFWs)** — most advanced tier. Benefits: deep packet inspection, intrusion protection, threat intelligence. Application-aware (can filter by application, not just IP/port); some include malware sandboxing, network anti-virus, URL/DNS filtering.

### VPNs

> **VPN** — A network security service that changes your public IP address and hides your virtual location so you can keep data private on a public network like the internet. Also encrypts data in transit.

> **Encapsulation** — The process a VPN uses to protect data by wrapping sensitive data inside other data packets.

A VPN server acts as a gateway between a device and the internet, creating a virtual tunnel that hides the IP and encrypts traffic. Lets trusted connections be established over untrusted networks.

- **Remote access VPN** — connects an individual personal device to a VPN server; connection established over the internet.
- **Site-to-site VPN** — used by enterprises to extend their network to other locations/networks; more complex to configure/manage than remote access VPNs.

**VPN protocols:**

| |WireGuard|IPSec|
|---|---|---|
|Age|Newer|Older, more established|
|Speed|Faster (fewer lines of code)|Slower by comparison|
|Setup|Simple, open source, easy to deploy/debug|More complex|
|Use case|Streaming, large file downloads, site-to-site and client-server|Widely supported across OSes; common in site-to-site VPNs|

Choosing between them depends on connection speed needs, compatibility with existing infrastructure, and business/individual needs.

Organizations increasingly combine **VPN + SD-WAN** (software-defined WAN) to securely connect users to applications across multiple locations over large distances.

### Security zones

> **Security zone** — A segment of a network that protects the internal network from the internet, part of a technique called **network segmentation**.

> **Network segmentation** — A security technique that divides the network into segments.

**Two top-level zones:**

- **Uncontrolled zone** — any network outside the organization's control.
- **Controlled zone** — a subnet that protects the internal network from the uncontrolled zone.

**Areas within the controlled zone:**

- **DMZ (Demilitarized zone)** — contains public-facing services that can access the internet.
- **Internal network** — private servers/data the org needs to protect.
- **Restricted zone** — highly confidential info, accessible only to employees with certain privileges.

**Structure:** `THE INTERNET → FIREWALL → DMZ → FIREWALL → INTERNAL NETWORK → FIREWALL → RESTRICTED ZONE`

### CIDR and subnetting

> **CIDR (Classless Inter-Domain Routing)** — A method of assigning subnet masks to IP addresses to create a subnet.

**The problem CIDR solves:** an IPv4 address like `192.168.1.10` alone doesn't tell you where the "network" part ends and the "host" (device) part begins. CIDR notation (`/24`, `/16`, etc.) specifies the split.

- `/24` → 24 bits network, 8 bits host → 256 addresses (254 usable; 2 reserved for network + broadcast address)
- `/16` → 65,536 addresses
- `/30` → 4 addresses (2 usable) — common for router-to-router links

**Rule of thumb:** smaller number after the slash = bigger network. Bigger number = smaller network.

**Subnetting** = taking one large network and dividing it into smaller organized groups (subnets), defined by the combination of IP address + network mask assigned to each device — a "network within a network." If devices on the same subnet talk to each other, the switch keeps that traffic local, improving speed/efficiency. Subnetting is also how security zones get created.

_Example:_ a company's `10.0.0.0/16` block can be split into department-level `/24` subnets (HR, Engineering, Guest Wi-Fi, Servers/DMZ) — each its own isolated security zone, with firewall rules between them so a compromise in one subnet doesn't automatically expose the rest.

**CIDR replaced classful addressing** (Class A–E, used in the 1980s, ran out of room as internet adoption grew in the 1990s) — expanded the number of usable IPv4 addresses and reduced routing table size.

**CIDR/subnetting vs. asking your ISP for more IPs — two different problems:**

| |Subnetting (CIDR)|Asking ISP for more IPs|
|---|---|---|
|What it does|Reorganizes IPs you already have into smaller logical groups|Gets you more actual addresses you didn't have before|
|Where|Internal, on your own router/network|External, negotiated with the ISP|
|Cost|Free (just config/math)|Usually costs money, may be limited by IPv4 exhaustion|
|Purpose|Organization, security segmentation, reduced broadcast traffic|Getting more devices a public-facing address|

**Analogy:** your ISP gives you one apartment building (a public IP or IP block). Subnetting is dividing floors/rooms within that same building for different purposes — you're not getting more building, just organizing what you have. Asking the ISP for more IPs is asking for an entirely additional building.

Most home/office networks only get **one** public IP from the ISP but have many devices — this works via **NAT**: the router uses private IPs (the reserved `192.168.x.x` / `10.x.x.x` CIDR blocks, non-routable on the public internet) internally and translates them all to share the single public IP.

**Bottom line:** CIDR/subnetting is a design tool for addresses you already control; asking the ISP for more IPs is a request for more raw address space from the entity that owns the internet-routable blocks.

### Proxy servers

> **Proxy server** — A server that fulfills a client's requests by forwarding them to other servers.

|Type|Function|
|---|---|
|**Forward proxy**|Regulates/restricts a client's access to the internet; hides internal client identity from external servers.|
|**Reverse proxy**|Regulates/restricts the internet's access to an internal server; hides the real server from clients (often sits in the DMZ; used for load balancing, caching, SSL termination).|
|**Email proxy server**|Protects the network from spam.|

**Firewall vs. proxy server:**

- **Firewall** = a gatekeeper. Decides _whether_ traffic is allowed through, based on rules (IP, port, protocol, sometimes app-level). Doesn't participate in the conversation — just permits or blocks it.
- **Proxy server** = a middleman. Actually receives the traffic, processes it, and makes a _new_ request on the client's/destination's behalf. The two real endpoints never talk directly, only to the proxy.

Analogy: a firewall is a bouncer checking ID at the door; a proxy is a personal assistant who does the errand on your behalf so the shop never deals with you directly.

| |Firewall|Proxy server|
|---|---|---|
|Role|Filters/blocks traffic|Relays/forwards traffic on your behalf|
|OSI layer|Network/Transport (NGFWs also app layer)|Application|
|Terminates connection?|No — passes through or drops|Yes — terminates one connection, opens a new one|
|Sees full content?|Basic: no (headers only); NGFW: some inspection|Yes — can see/modify URLs, headers, payloads|
|Typical purpose|Block unauthorized access, enforce segmentation|Hide identity/IP, cache content, filter/log web requests, bypass geo-restrictions, load balancing|

They often work together in the same pipeline: `Internet → Firewall → Proxy Server → Internal Clients`. The firewall enforces broad access rules; the proxy handles content-level work (logging visited sites, caching, stripping malicious content, masking internal IPs).

### Network protocols recap (3 categories)

1. **Communication protocols** — establish connections between servers (TCP, UDP, SMTP).
2. **Management protocols** — troubleshoot network issues (ICMP).
3. **Security protocols** — encrypt data in transit (IPSec, SSL/TLS).

Other commonly used protocols: **HTTP** (browser↔server communication), **DNS** (maps hostnames to IPs), **ARP** (maps IP↔MAC on the LAN).

---

## Module 3: Secure Against Network Intrusions

**What we'll learn:** Network Security | Network Intrusion Tactics | Network Attack Protection

### Common network intrusion attacks

- Malware
- Spoofing
- Packet sniffing
- Packet flooding

**How attacks harm an organization:** leaking valuable/confidential information · damaging reputation · hurting customer retention · costing money and time.

Motivations vary: financial, personal, political, disgruntled employees, activists opposed to a company's values.

### Network interception attacks

Intercept network traffic to steal information or interfere with a transmission (e.g. altering the destination account on an intercepted bank transfer). Includes **packet sniffing**, **on-path attacks**, and **replay attacks**.

### Backdoor attacks

> **Backdoor** — A weakness intentionally left by programmers/admins that bypasses normal access control, usually meant for troubleshooting or admin tasks. Attackers exploit backdoors post-compromise for persistent access, then can install malware, run DoS attacks, steal data, or change security settings.

### Possible organizational impacts

- **Financial** — lost revenue during downtime, rebuild costs, ransomware payouts, litigation/settlement costs.
- **Reputation** — public trust erodes; customers may switch to competitors.
- **Public safety** — attacks on government/utility/defense networks can cause real-world physical harm.

### Matt: a professional on dealing with attacks

> "As an Incident Responder, I am here to help."

**INCIDENT RESPONSE is standing beside people when they want you the most.**

**The 3 C's:** Command · Control · Communication

### DoS / DDoS attacks

> **DoS (Denial of Service)** — An attack that targets a network or server and floods it with traffic.

> **DDoS (Distributed Denial of Service)** — Uses multiple devices/servers in different locations to flood the target with unwanted traffic.

- **SYN flood** — simulates TCP connections, floods the server with SYN packets.
- **ICMP flood** — repeatedly sends ICMP request packets to a server.
- **Ping of death** — sends an oversized ICMP packet (>64KB) to crash a system.

### tcpdump / network protocol analyzers

> **Network protocol analyzer** (packet sniffer / packet analyzer) — A tool that captures and analyzes data traffic within a network; used to monitor networks and identify suspicious activity.

Common analyzers: SolarWinds NetFlow Traffic Analyzer, ManageEngine OpManager, Azure Network Watcher, **Wireshark**, **tcpdump**.

**tcpdump** — command-line, lightweight (low memory/CPU), text-based, uses the open-source libpcap library. Preinstalled on many Linux distros, also runs on macOS. Prints packet info directly to the terminal (and optionally a log file).

**Info captured per packet:**

- **Timestamp** — hours:minutes:seconds.fraction
- **Source IP / Source port**
- **Destination IP / Destination port**

By default tcpdump resolves host addresses to hostnames and swaps port numbers for their commonly associated service names.

**Common uses:** baseline traffic patterns, detect/identify malicious traffic, custom alerts, locate unauthorized IM traffic or rogue wireless access points. (Attackers can also abuse these tools to capture sensitive data like usernames/passwords.)

### Case study: 2016 DDoS on a DNS service provider

> **Botnet** — A collection of malware-infected computers under the control of a single threat actor (the "bot-herder").

- University students built a botnet targeting gaming servers, then posted its code publicly (partly to avoid being traced) — which let other criminals pick it up.
- On **October 21, 2016**, at 7:00 a.m., the botnet fired tens of millions of DNS requests at a major DNS service provider, overwhelming and shutting down the service. Since many large companies relied on this provider, sites across North America and Europe went down.
- Systems were restored after ~2 hours; subsequent attack waves were mitigated because the company was now prepared.
- **Lesson:** distributing important operations across dynamically scalable hosts helps operations continue even if baseline infrastructure goes down.

### Malicious packet sniffing

- **Passive packet sniffing** — reading data packets in transit without altering them.
- **Active packet sniffing** — manipulating data packets in transit.

**Prevention:** VPN tunnels · using HTTPS sites · avoiding unprotected Wi-Fi.

### IP spoofing

> **IP spoofing** — Changing the source IP of a data packet to impersonate an authorized system and gain access.

**Common IP spoofing attacks:**

- **On-path attack** (a.k.a. meddler-in-the-middle) — a hacker intercepts communication between two trusted devices/servers, potentially harvesting usernames/passwords or spoofing a DNS response to redirect a domain to a malicious IP. **Best defense: encrypt data in transit (e.g. TLS).**
- **Replay attack** — intercepts a data packet in transit and delays or replays it later.
- **Smurf attack** — sniffs an authorized user's IP, then floods it with (often ICMP) packets; once the spoofed packet hits the broadcast address it's sent to every device/server on the network, overwhelming them. **Best defense: an NGFW that detects unusual traffic/anomalies.**
- **DoS attack (as IP-spoofing-adjacent)** — the attacker prevents a compromised system from responding to legitimate traffic; unlike spoofing, the packets used are fully "authorized" (real IP in the header) — the attacker just floods the target until it crashes.

**Pro tip:** defense-in-depth — no single strategy stops every attack type; layer encryption + multiple mitigation strategies together.

### Reading tcpdump logs — worked example

```
14:18:32.192571 IP your.machine.52444 > dns.google.domain: 35084+ A? yummyrecipesforme.com. (24)
14:18:32.204388 IP dns.google.domain > your.machine.52444: 35084 1/0/0 A 203.0.113.22 (40)
```

Source computer (port 52444) sends a DNS resolution request for `yummyrecipesforme.com`; the DNS server replies with IP `203.0.113.22`.

```
14:18:36.786501 IP your.machine.36086 > yummyrecipesforme.com.http: Flags [S], seq 2873951608, ...
14:18:36.786517 IP yummyrecipesforme.com.http > your.machine.36086: Flags [S.], seq 3984334959, ack 2873951609, ...
```

Source (port 36086) sends a TCP connection request (`Flags [S]`) directly to the destination's HTTP port (`.http` = port 80); destination acknowledges (`Flags [S.]`). Communication continues for ~2 minutes.

**TCP flag codes:**

|Flag|Meaning|
|---|---|
|`[S]`|Connection Start|
|`[F]`|Connection Finish|
|`[P]`|Data Push|
|`[R]`|Connection Reset|
|`[.]`|Acknowledgment|

```
14:18:36.786589 IP your.machine.36086 > yummyrecipesforme.com.http: Flags [P.], ... HTTP: GET / HTTP/1.1
```

Browser requests data via `HTTP GET` — possibly the download request for a malicious file.

```
14:20:32.192571 IP your.machine.52444 > dns.google.domain: 21899+ A? greatrecipesforme.com. (24)
14:20:32.204388 IP dns.google.domain > your.machine.52444: 21899 1/0/0 A 192.0.2.172 (40)
14:25:29.576493 IP your.machine.56378 > greatrecipesforme.com.http: Flags [S], ...
```

**Sudden change:** a new DNS request goes out (same source port `.52444`), this time resolving to a _different_ domain/IP (`greatrecipesforme.com` / `192.0.2.172`) — traffic gets redirected to a spoofed site, using a new outgoing port (`.56378`).

**Reference resources:** tcpdump intro/cheat sheet articles · "What is a computer port?" · IANA Service Name and Transport Protocol Port Number Registry · tcpdump output interpretation guides.

### Module 3 glossary

|Term|Definition|
|---|---|
|Active packet sniffing|Manipulating data packets in transit|
|Botnet|Malware-infected computers controlled by a single "bot-herder"|
|DoS attack|Targets a network/server and floods it with traffic|
|DDoS attack|DoS using multiple distributed devices/servers|
|ICMP|Protocol devices use to report transmission errors|
|ICMP flood|DoS via repeated ICMP request packets|
|IP spoofing|Changing a packet's source IP to impersonate an authorized system|
|On-path attack|Intercepting/altering data between two trusted parties|
|Packet sniffing|Capturing and inspecting data packets across a network|
|Passive packet sniffing|Connecting to a hub and viewing all network traffic|
|Ping of death|Oversized ICMP packet (>64KB) crashing a system|
|Replay attack|Intercepting a packet and delaying/repeating it later|
|Smurf attack|Sniffing a user's IP and flooding it with ICMP packets|
|SYN flood|Simulated TCP connections flooding a server with SYN packets|

---

## Module 4: Security Hardening

Applies to: **networks, devices, applications, cloud infrastructure**. Core parts: **patch updates**, **backups**, plus **physical security**.

> **Security hardening** — The process of strengthening a system to reduce its vulnerabilities and attack surface.

> **Attack surface** — All the potential vulnerabilities a threat actor could exploit.

> **Penetration testing** — A simulated attack that helps identify vulnerabilities in systems, networks, websites, applications, and processes.

### OS hardening

> **Operating system (OS)** — The interface between computer hardware and the user.

> **Patch update** — A software/OS update that addresses security vulnerabilities in a program or product.

> **Baseline configuration (baseline image)** — A documented set of specifications used as the basis for future builds, releases, and updates.

> **MFA (Multi-factor authentication)** — Verifying identity more than once to access a system/network.

**MFA factor categories:** something you know · something you have · something unique about you.

### Brute-force attacks

> **Brute force attack** — A trial-and-error process for discovering private information (typically credentials).

- **Simple brute force** — trying combinations of usernames/passwords until one works.
- **Dictionary attack** — using a list of common passwords / previously breached credentials (originally literal dictionary words, before complex password rules became standard).

**Assessing vulnerabilities before an incident:**

- **Virtual machines (VMs)** — software versions of physical computers; run code in isolation so malicious code can't touch the rest of the system; can be wiped and replaced with a pristine image after testing malware; small residual risk of malware escaping virtualization.
- **Sandboxes** — testing environments separate from the network, used for testing patches, finding bugs, evaluating suspicious software/malware, and simulating attacks. Can be stand-alone offline machines or (more commonly) cloud-based VMs. Note: some malware is written to detect sandbox/VM environments and behave harmlessly there.

**Prevention measures:**

- **Salting and hashing** — hashing is a one-way conversion of data into a unique, non-decryptable value; salting adds random characters before hashing to increase length/complexity.
- **MFA / 2FA** — 2FA uses exactly two verification factors; MFA uses two or more (password + fingerprint/face/OTP, etc.).
- **CAPTCHA / reCAPTCHA** — proves the user is human, blocking automated brute-force attempts; reCAPTCHA is Google's free service for this.
- **Password policies** — standardize complexity requirements, rotation frequency, reuse rules, and login attempt limits before lockout.

### Network hardening

**Network security hardening components:** port filtering · network access privilege · encryption.

**Ongoing tasks:** firewall rules maintenance · network log analysis · patch updates · server backups.

> **Network log analysis** — Examining network logs to identify events of interest.

> **Port filtering** — A firewall function that blocks/allows certain ports to limit unwanted communication.

### Network security appliances (defense in depth)

Layering these tools progressively hardens a network — from a baseline of just a firewall, up to firewall + IDS/IPS + SIEM combined.
| Tool                                                 | What it does                                                                                                                                                                                                      | Limitations                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Firewall**                                         | Allows/blocks traffic based on rule sets, inspecting packet headers (port number). NGFWs also inspect payloads. Every system should have its own, regardless of a network firewall.                               | Only sees what's in the packet header (unless NGFW).                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **IDS (Intrusion Detection System)**                 | Monitors activity and alerts admins to possible intrusions based on known attack signatures (and sometimes anomalies). Sits behind the firewall, before the LAN, to reduce noise/false positives.                 | Only catches known attacks/obvious anomalies; doesn't stop traffic itself — an admin has to act.                                                                                                                                                                                                                                                                                                                                                                                   |
| **IPS (Intrusion Prevention System)**                | Same detection as IDS, but actively blocks the sender or drops suspect packets. Sits behind the firewall like an IDS.                                                                                             | Inline — if it fails, the connection between the private network and internet breaks. Can produce false positives that drop legitimate traffic.![A firewall circled by dashes, protecting the internal network from internet traffic that comes in through the mode.](https://d3c33hcgiwev3.cloudfront.net/imageAssetProxy.v1/dSLcIcXBSw-kw-9kzEwhAw_284c8540dab14a9e911296471c71d2f1_CS_R-055_Firewall.png?expiry=1785278811597&hmac=aFkCKFew748TgGK20yadTR8hZg7YPcUwmqGv1tVvUKw) |
| **Full packet capture devices**                      | Record and analyze all data transmitted over the network; useful for investigating IDS alerts.                                                                                                                    | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **SIEM (Security Information and Event Management)** | Collects/analyzes log data in real time from IDS, IPS, firewalls, VPNs, proxies, DNS logs, etc. into one centralized dashboard ("single pane of glass"). Examples: Google Chronicle, Splunk (Enterprise / Cloud). | Only reports — doesn't take action to stop/prevent events itself.                                                                                                                                                                                                                                                                                                                                                                                                                  |

Security analysts often work in a **Security Operations Center (SOC)**, using SIEM dashboards + their own expertise to decide when events need escalation.

### Cloud hardening

> **Cloud network** — A collection of servers/computers storing data/resources in remote data centers, accessible via the internet.

**Cloud security considerations:**

- **Identity Access Management (IAM)** — manages digital identities and authorizes cloud resource access; loosely configured user roles are a common source of risk.
- **Configuration** — every cloud service needs precise configuration for security/compliance; misconfiguration (especially during migrations) is a frequent breach cause.
- **Attack surface** — every additional cloud service/application adds risk, but a well-designed network doesn't have to multiply entry points just because it uses more services. CSPs generally undergo more security scrutiny than typical on-prem setups.
- **Zero-day attacks** — exploits previously unknown to defenders (> **Zero day** — an exploit that was previously unknown). CSPs are often positioned to detect and patch these (patching hypervisors, migrating workloads) faster than a typical on-prem IT org.
- **Visibility and tracking** — CSPs offer flow logs and tools like packet mirroring for visibility, but don't let customers directly monitor traffic on the CSP's own servers — a tradeoff vs. full on-prem visibility. CSPs undergo third-party audits to verify security posture.
- **Pace of change** — CSPs update fast; organizations may need to adjust configurations and IT processes to keep up, and need dedicated personnel to monitor all cloud services in use.

### Shared responsibility model

> **Shared responsibility model** — The CSP is responsible for security _of_ the cloud (physical data centers, hypervisors, host OSes); the organization using the cloud is responsible for the assets/processes it runs _in_ the cloud (e.g. correctly configuring applications and services).

A common failure mode: an organization assumes the CSP is handling security it hasn't actually taken responsibility for (e.g. app-level configuration).

### Module 4 glossary

|Term|Definition|
|---|---|
|Baseline configuration (baseline image)|Documented specs used as the basis for future builds/releases/updates|
|Hardware|The physical components of a computer|
|Multi-factor authentication (MFA)|Verifying identity two or more ways to access a system/network|
|Network log analysis|Examining network logs to identify events of interest|
|Operating system (OS)|The interface between computer hardware and the user|
|Patch update|Software/OS update addressing security vulnerabilities|
|Penetration testing (pen test)|A simulated attack to identify vulnerabilities|
|Security hardening|Strengthening a system to reduce vulnerabilities and attack surface|
|SIEM|Application that collects/analyzes log data to monitor critical org activity|
|World-writable file|A file that can be altered by anyone in the world|

---

## Module 1 glossary

| Term                   | Definition                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Bandwidth              | Max data transmission capacity over a network, in bits per second                                                    |
| Cloud computing        | Using remote servers, applications, and network services hosted on the internet instead of on local physical devices |
| Cloud network          | A collection of servers/computers storing resources/data in remote data centers, accessed via the internet           |
| Data packet            | A basic unit of information traveling from one device to another within a network                                    |
| Hub                    | A device that broadcasts information to every device on the network                                                  |
| Internet Protocol (IP) | Standards for routing and addressing data packets between devices                                                    |
| IP address             | A unique string identifying the location of a device on the internet                                                 |
| LAN                    | A network spanning a small area (office, school, home)                                                               |
| MAC address            | A unique alphanumeric identifier assigned to each physical device on a network                                       |
| Modem                  | Connects your router to the internet, bringing internet access to the LAN                                            |
| Network                | A group of connected devices                                                                                         |
| OSI model              | Standardized concept describing the 7 layers computers use to communicate                                            |
| Packet sniffing        | The practice of capturing and inspecting data packets across a network                                               |
| Port                   | A software-based location organizing data sending/receiving between devices                                          |
| Router                 | A network device that connects multiple networks together                                                            |
| Speed                  | The rate at which a device sends/receives data, in bits per second                                                   |
| Switch                 | Connects specific devices on a network by sending/receiving data between them                                        |
| TCP/IP model           | A framework for visualizing how data is organized and transmitted across a network                                   |
| TCP                    | An internet communication protocol allowing two devices to form a connection and stream data                         |
| UDP                    | A connectionless protocol that doesn't establish a connection before transmission                                    |
| WAN                    | A network spanning a large geographic area (city, state, country)                                                    |

---
## Module 2 Glossary 
**Address Resolution Protocol (ARP):** A network protocol used to determine the MAC address of the next router or device on the path

**Cloud-based firewalls:** Software firewalls that are hosted by the cloud service provider

**Controlled zone:** A subnet that protects the internal network from the uncontrolled zone

**Domain Name System (DNS):** A networking protocol that translates internet domain names into IP addresses

**Encapsulation:** A process performed by a VPN service that protects your data by wrapping sensitive data in other data packets

**Firewall:** A network security device that monitors traffic to or from your network

**Forward proxy server:** A server that regulates and restricts a person’s access to the internet

**Hypertext Transfer Protocol (HTTP):** An application layer protocol that provides a method of communication between clients and website servers

**Hypertext Transfer Protocol Secure (HTTPS):** A network protocol that provides a secure method of communication between clients and servers

**IEEE 802.11 (Wi-Fi):** A set of standards that define communication for wireless LANs

**Network protocols:** A set of rules used by two or more devices on a network to describe the order of delivery of data and the structure of data

**Network segmentation:** A security technique that divides the network into segments

**Port filtering:** A firewall function that blocks or allows certain port numbers to limit unwanted communication

**Proxy server:** A server that fulfills the requests of its clients by forwarding them to other servers

**Reverse proxy server:** A server that regulates and restricts the internet's access to an internal server

**Secure File Transfer Protocol (SFTP):** A secure protocol used to transfer files from one device to another over a network

**Secure shell (SSH):** A security protocol used to create a shell with a remote system 

**Security zone:** A segment of a company’s network that protects the internal network from the internet

**Simple Network Management Protocol (SNMP):** A network protocol used for monitoring and managing devices on a network

**Stateful:** A class of firewall that keeps track of information passing through it and proactively filters out threats 

**Stateless:** A class of firewall that operates based on predefined rules and does not keep track of information from data packets

**Subnetting:** The subdivision of a network into logical groups called subnets

**Transmission Control Protocol (TCP):** An internet communication protocol that allows two devices to form a connection and stream data

**Uncontrolled zone:** The portion of the network outside the organization

**Virtual private network (VPN):** A network security service that changes your public IP address and masks your virtual location so that you can keep your data private when you are using a public network like the internet

**Wi-Fi Protected Access (WPA):** A wireless security protocol for devices to connect to the internet

---
## Module 3 Glossary

**Active packet sniffing:** A type of attack where data packets are manipulated in transit

**Botnet:** A collection of computers infected by malware that are under the control of a single threat actor, known as the “bot-herder"

**Denial of service (DoS) attack:** An attack that targets a network or server and floods it with network traffic

**Distributed denial of service (DDoS) attack:** A type of denial of service attack that uses multiple devices or servers located in different locations to flood the target network with unwanted traffic

**Internet Control Message Protocol (ICMP):** An internet protocol used by devices to tell each other about data transmission errors across the network

**Internet Control Message Protocol (ICMP) flood:** A type of DoS attack performed by an attacker repeatedly sending ICMP request packets to a network server

**IP spoofing:** A network attack performed when an attacker changes the source IP of a data packet to impersonate an authorized system and gain access to a network

**On-path attack:** An attack where a malicious actor places themselves in the middle of an authorized connection and intercepts or alters the data in transit

**Packet sniffing:** The practice of capturing and inspecting data packets across a network 

**Passive packet sniffing:** A type of attack where a malicious actor connects to a network hub and looks at all traffic on the network

**Ping of death:** A type of DoS attack caused when a hacker pings a system by sending it an oversized ICMP packet that is bigger than 64KB

**Replay attack:** A network attack performed when a malicious actor intercepts a data packet in transit and delays it or repeats it at another time

**Smurf attack:** A network attack performed when an attacker sniffs an authorized user’s IP address and floods it with ICMP packets

**Synchronize (SYN) flood attack:** A type of DoS attack that simulates a TCP/IP connection and floods a server with SYN packets
