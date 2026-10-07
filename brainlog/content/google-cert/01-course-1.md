---
publish: true
title: 'Course 1: Foundations of Cybersecurity'
folder: Google Cybersecurity Course Notes
order: 1
description: Security history, the main attack types, ethics, and the roles that make
  up a security team.
allow_private_ips: true
---
## 📚 Program Overview

### Course List

1. Foundations of Cybersecurity
2. Play It Safe: Manage Security Risks
3. Connect and Protect: Networks and Network Security
4. Tools of the Trade: Linux and SQL
5. Assets, Threats and Vulnerabilities
6. Sound the Alarm: Detection and Response
7. Automate Cyber Tasks with Python
8. Put it to Work: Prepare for Cybersecurity Jobs
9. Accelerate Your Job Search with AI

### Key Skills Developed

- Strong Critical Thinking
- Strong Communication
- Hands-on Practice

> Target: Entry-level job ready within **3 to 6 months**

---

# Module 1 — Foundations & Career Identity

## 🎯 Career Identity

### Career Identity Statement Format

> I am a _(role)_ with _(# years)_ of experience doing _(accomplishment)_. My greatest strength is _(strength)_, and I have a talent for _(strength)_. I am passionate about _(motivation)_, and I value _(value)_.

### 3 Components

|Component|Question|
|---|---|
|**Strengths**|What skills, knowledge and talents set me apart?|
|**Motivations**|What fuels and motivates me most?|
|**Values**|What values guide me?|

> [!note] Strengths Definition Skills gained from work or life. You have to be good at it AND feel strong when you do it.

---

## 🔐 What is Cybersecurity?

> The practice of ensuring the **confidentiality, integrity and availability** of information by protecting networks, devices, people, and data from unauthorized access or criminal exploitation.

### Benefits of Security

- Protects against internal and external threats
- Meets regulatory compliance
- Maintains and improves business productivity
- Reduces expenses
- Maintains brand trust

---

## 👩‍💻 Security Analyst

### Responsibilities

- Protecting computers and networks
- Installing prevention software
- Conducting periodic security audits

### Skills

|Transferable Skills|Technical Skills|
|---|---|
|Skills from other areas that apply to different careers|Require knowledge of specific tools, procedures, and policies|
|Communication, Critical Thinking|Programming, SIEM tools, Computer Forensics, IDS|

---

## 📖 Key Definitions

> [!info] PII **Personally Identifiable Information** — Any information used to infer an individual's identity.

> [!warning] SPII **Sensitive Personally Identifiable Information** — A specific type of PII that falls under stricter handling guidelines.

> [!info] Compliance The process of adhering to internal standards and external regulations. Enables organizations to avoid fines and security breaches.

---

# Module 2 — History of Attacks & Threat Actors

## 🕰️ History of Attacks

### Computer Virus vs Malware

- **Computer Virus** — Malicious code written to interfere with computer operations and cause damage to data and software
- **Malware** — Software designed to harm devices or networks

### Timeline

#### 🧠 Brain Virus

- Created to track pirated content via DVD/CD
- Infected any disk inserted into an affected computer
- Spread globally through physical media

#### 🪱 Morris Worm

- Intended to measure the size of the internet
- Bug caused it to repeatedly download itself until memory maxed and crashed
- Affected ~6,000 computers — 10% of the internet at the time

#### 💌 Love Letter Attack (2000)

- Email: **Subject** "I LOVE YOU" / **Attachment** "LOVE LETTER FOR YOU"
- Stole credentials and self-propagated via victim's contacts
- Caused ~$10 billion in losses worldwide
- First mainstream **Social Engineering** attack

> [!tip] Lesson from Love Letter Organizations now conduct regular internal trainings for Social Engineering attacks, especially **Phishing**.

#### 📊 Equifax Breach (2017)

- 143 million customer records stolen
- Affected approximately 40% of all Americans
- Equifax paid 500+ million dollars in fines
- Raised industry awareness of the financial cost of data breaches

---

## 🎭 Types of Threat Actors

### APT (Advanced Persistent Threats)

- High expertise in unauthorized network access
- Research targets in advance
- Can remain undetected for extended periods

### Insider Threats

- Abuse authorized access to harm the organization
- Methods: Sabotage, Corruption, Espionage, Unauthorized Access

### Hacktivists

- Driven by a political agenda
- Methods: Demonstrations, Propaganda, Fame, Social Change

### Supply Chain Attack

> Targets systems, applications, hardware, and software across the supply chain to deploy malware. Security breach can occur at any point in the chain.

---

## 🌐 Security Domains (CISSP 8 Domains)

|#|Domain|Focus|
|---|---|---|
|1|**Security and Risk Management**|Goals, objectives, risk mitigation, compliance, business continuity, law|
|2|**Asset Security**|Digital and physical asset security, data storage, retention, destruction|
|3|**Security Architecture and Engineering**|Effective tools, systems, and processes for data security|
|4|**Communications and Network Security**|Managing and securing physical networks and wireless communications|
|5|**Identity and Access Management**|Controlling access to physical and logical assets|
|6|**Security Assessment and Testing**|Security control testing, data analysis, security audits|
|7|**Security Operations**|Investigations and preventative measures|
|8|**Software Development Security**|Secure coding practices for applications and services|

---

# Module 3 — Frameworks, Controls & Ethics

## 🏗️ Security Frameworks

> Guidelines used for building plans to help mitigate risk and threats to data and privacy.

### Purpose

- Protecting PII
- Securing financial information
- Identifying security weaknesses
- Managing organizational risk
- Aligning security with business goals

### 4 Core Components

1. Identifying and documenting security goals
2. Setting guidelines to achieve security goals
3. Implementing security processes
4. Monitoring and communicating results

### Security Controls

> Safeguards designed to reduce specific security risks. Used alongside frameworks to establish a strong security posture.

---

## 🔺 CIA Triad

> A foundational model that helps inform how organizations consider risk when setting up systems and security policies.

```
         Confidentiality
              /\
             /  \
            /    \
           /      \
 Integrity /________\ Availability
```

|Pillar|Definition|
|---|---|
|**Confidentiality**|Only authorized users can access specific assets or data|
|**Integrity**|Data is correct, reliable, and authentic|
|**Availability**|Data is accessible to those who are authorized to access it|

> **Asset** — An item perceived to have value by the organization.

---

## 📋 NIST Cybersecurity Framework

> A voluntary framework consisting of standards, guidelines, and best practices to manage cybersecurity risk.

**Compliance** — The process of adhering to internal standards and external regulations.

---

## 🔒 Security Ethics

> Guidelines for making appropriate decisions as a security professional.

### Ethical Principles

- Confidentiality
- Privacy Protection
- Laws

---

# Module 4 — Tools & Playbooks

## 📖 Key Definitions

> [!info] Log A record of events that occur within an organization's system.

---

## 🛠️ Tools

### SIEM (Security Information and Event Management)

> An application that collects and analyzes log data to monitor critical activities in an organization.

|Tool|Type|Description|
|---|---|---|
|**Splunk**|Self-hosted|Retains, analyzes, and searches organization's log data|
|**Google Chronicle**|Cloud-native|Cloud-based SIEM tool|

---

### IDS (Intrusion Detection System)

> Software that monitors system activity and alerts on possible intrusions. Scans and analyzes network packets.

> [!info] IDS vs SIEM IDS works as a **data point** for SIEM. The SIEM collects data from several data points (including IDS) and presents it to the analyst in an organized format.

---

### Network Protocol Analyzer (Packet Sniffer)

> A tool designed to capture and analyze data traffic within a network.

- **tcpdump** — Command-line based
- **Wireshark** — GUI based

---

## 📒 Playbooks

> A manual that provides details about any operational action. An actionable roadmap.

### Chain of Custody Playbook

The process of documenting evidence possession and control during an incident lifecycle.

### Protecting and Preserving Evidence Playbook

The process of properly working with fragile and volatile digital evidence.

> [!important] Order of Volatility A sequence outlining the order of data that must be preserved from first to last. Prioritizes **volatile data** — data that may be lost if the device powers off.

---

## 🔗 Resources

- [Course Glossary](https://docs.google.com/document/d/1bBtBHYrrm4kmWJqJVmeNUDPG24ydGvc4ACMLoP9zzps/template/preview?pli=1&resourcekey=0-0uttQ9n9hmekaJBuPVjWMg)

