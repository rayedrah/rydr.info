---
publish: true
title: 'Course 2: Play It Safe, Manage Security Risks'
folder: Google Cybersecurity Course Notes
order: 2
description: CISSP domains, threats vs risks vs vulnerabilities, NIST frameworks,
  audits, SIEM tools, and playbooks.
allow_private_ips: true
---
> [!summary] What this course covers CISSP's 8 security domains → threats/risks/vulnerabilities → security frameworks and controls → the CIA triad → NIST frameworks → security audits → SIEM tools and dashboards → playbooks and incident response.

## 1. CISSP Security Domains

> [!info] Security Posture An organization's ability to manage its defense of critical assets and data, and react to change.

CISSP (Certified Information Systems Security Professional) defines **8 domains** that map the full scope of the security profession.

| #   | Domain                                    | Focus                                                                                                   |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | **Security Risk and Management**          | Defining security goals/objectives, risk mitigation, compliance, business continuity, legal regulations |
| 2   | **Asset Security**                        | Securing digital and physical assets — storage, maintenance, retention, destruction of data             |
| 3   | **Security Architecture and Engineering** | Optimizing data security via effective tools, systems, processes to protect assets                      |
| 4   | **Communication and Network Security**    | Managing and securing physical networks and wireless communication                                      |
| 5   | **Identity and Access Management (IAM)**  | Access and authorization; keeping data secure through policy-controlled access                          |
| 6   | **Security Assessment and Testing**       | Testing controls, collecting/analyzing data, conducting audits to monitor risk                          |
| 7   | **Security Operations**                   | Investigations and preventive measures; begins once an incident is identified; includes forensics       |
| 8   | **Software Development Security**         | Secure coding practices across the SDLC                                                                 |

### Domain 1 details — Security Risk and Management

- **Defining security goals/objectives** — reduces risk to critical assets like PII/SPII
- **Risk mitigation** — right procedures/rules in place to quickly reduce breach impact
- **Compliance** — primary method for developing internal security policy, regulatory requirements, independent standards
- **Business continuity** — maintaining everyday productivity via disaster recovery plans
- **Legal regulations** — following rules/expectations for ethical behavior to minimize negligence, abuse, fraud

> [!note] Shared Responsibility All individuals within an organization take an active role in lowering risk and maintaining physical and virtual security.

### Domain 5 details — IAM: the 4 components

|Component|Example|
|---|---|
|Identification|ID card, username|
|Authentication|Password, fingerprint|
|Authorization|Access per assigned role|
|Accountability|Log files of access|

### Domain 6 details — Security Assessment and Testing

- Checking whether controls fulfill the security goal
- Frequent audits to monitor risk
- Reviewing a pre-made control list, adding/removing per audit findings

### Domain 8 details — Software Development Security (3 phases)

1. **Secure design** — during the design phase
2. **Secure coding practice** — during the development phase
3. **Penetration testing** — during the deployment phase

---

## 2. Threats, Risks, and Vulnerabilities

### Core definitions

- **Asset** — anything an organization perceives as valuable (digital or physical)
    - _Digital:_ SSNs/national ID numbers, dates of birth, bank account numbers, mailing addresses
    - _Physical:_ payment kiosks, servers, desktop computers, office spaces
- **Threat** — any circumstance/event that can negatively impact assets
- **Risk** — anything that can impact the **CIA** (confidentiality, integrity, availability) of an asset
    - Basic formula: **risk = likelihood of a threat**
    - Analogy: risk = being late to work; threats = traffic, accident, flat tire
- **Vulnerability** — a weakness that can be exploited by a threat

### Risk levels (by asset)

|Level|Description|
|---|---|
|**Low**|Wouldn't harm reputation/operations or cause financial damage if compromised|
|**Medium**|Not public information; may cause some damage to finances, reputation, or operations|
|**High**|Protected by regulations/laws; compromise = severe negative impact on finances, operations, or reputation|

### Threat types

- **Insider threats** — staff/vendors abuse authorized access to obtain data that harms the org
- **Advanced Persistent Threats (APTs)** — actor maintains unauthorized system access over an extended period

### Risk likelihood factors

- **External risk** — outside the org (e.g., threat actors seeking private info)
- **Internal risk** — current/former employee, vendor, or trusted partner
- **Legacy systems** — outdated/unaccounted-for systems (e.g., old card-payment machines)
- **Multiparty risk** — third-party vendors gaining access to IP (trade secrets, designs)
- **Software compliance/licensing** — unpatched or non-compliant software

### Reference lists for threats/risks

- NIST cybersecurity risk lists
- NIST National Vulnerability Database
- CISA Known Exploited Vulnerabilities (KEV) Catalog
- **OWASP Top Ten** — top 10 critical web app security risks, updated regularly
    - 2017 → 2021 update added 3 new categories: **insecure design**, **software and data integrity failures**, **server-side request forgery** — security constantly evolves

### Notable vulnerabilities (examples)

|Vulnerability|Description|
|---|---|
|**ProxyLogon**|Pre-auth vuln in Microsoft Exchange; attacker completes auth and deploys malicious code remotely|
|**ZeroLogon**|Vuln in Microsoft Netlogon (auth protocol used to verify identity before site access)|
|**Log4Shell**|Lets attacker run Java code on victim's machine or leak sensitive data; enables remote takeover of internet-connected devices|
|**PetitPotam**|Affects Windows NTLM; LAN-based attacker can initiate an auth request (theft technique)|
|**Security logging & monitoring failures**|Insufficient logging/monitoring lets attackers exploit undetected|
|**Server-side request forgery (SSRF)**|Manipulates server-side app into accessing/updating backend resources; can steal data|

> As an entry-level analyst, this work falls under **vulnerability management** — monitoring systems to identify and mitigate vulnerabilities. Patches only help if actually applied → continuous monitoring is critical.

### Layers of the web

- Surface Web
- Deep Web
- Dark Web

### Impacts of threats/risks/vulnerabilities

- **Financial** — fines for non-compliance, cost to correct, stopped production
- **Identity theft**
- **Reputation damage**

---

## 3. Risk Management

### 4 strategies to manage risk

|Strategy|Description|
|---|---|
|**Acceptance**|Accept the risk to avoid disrupting business continuity|
|**Avoidance**|Create a plan/path to avoid the risk altogether|
|**Transference**|Transfer the risk to a third party to handle|
|**Mitigation**|Lessen the impact of a known risk|

### Frameworks used

- **NIST RMF** — NIST Risk Management Framework
- **HITRUST** — Health Information Trust Alliance

### NIST Risk Management Framework (RMF) — 7 steps

|Step|Purpose|
|---|---|
|**Prepare**|Activities needed to manage security/privacy risk before a breach occurs — identify risk|
|**Categorize**|Develop risk management processes/tasks — entry-level staff should know this process|
|**Select**|Choose, customize, and document the controls that protect the org — keep the playbook current|
|**Implement**|Put security/privacy plans into action — ready for an ongoing risk or breach|
|**Assess**|Determine whether established controls are implemented correctly; identify weaknesses|
|**Authorize**|Be accountable for existing security/privacy risk — generate reports, develop action plans|
|**Monitor**|Stay aware of how systems are operating — assess and maintain technical operations|

---

## 4. Security Frameworks, Controls, and the CIA Triad

### Security frameworks vs. controls

- **Security frameworks** — guidelines for building plans that mitigate risk and threats to data/privacy. People are the biggest threat to security, so frameworks help build plans that raise employee awareness of social engineering attacks.
- **Security controls** — safeguards designed to reduce specific security risks; can prevent significant losses.

### 3 common types of controls (mechanisms)

|Control|Description|
|---|---|
|**Encryption**|Converts data from readable (plain) to encoded (cipher) form to ensure confidentiality|
|**Authentication**|Verifying who/what someone is (e.g., username + password, MFA)|
|**Authorization**|Granting access to specific resources within a system; verifying permission|

> [!warning] Vishing The exploitation of electronic voice communication to obtain sensitive information or impersonate a known source.

### The CIA Triad

> A model that helps organizations consider risk when setting up systems and security policies. Maintaining acceptable risk while designing for these three elements establishes a strong **security posture**.

|Element|Definition|How it's implemented|
|---|---|---|
|**Confidentiality**|Only authorized users can access specific assets/data|Principle of least privilege — limit user access to only what's needed for the job|
|**Integrity**|Data is verifiably correct, authentic, and reliable|Cryptography (transforms data so unauthorized parties can't read/tamper with it); encryption|
|**Availability**|Data is accessible to those authorized to use it|Controlled remote/internal network access scoped to job role (e.g., accounting sees accounts, not dev project data)|

---

## 5. NIST Frameworks

Organizations use frameworks as a starting point to build plans that mitigate risks, threats, and vulnerabilities to sensitive data and assets.

### NIST Cybersecurity Framework (CSF)

A voluntary framework of standards, guidelines, and best practices to manage cybersecurity risk. Widely respected and used across industries.

**CSF v2.0** added a new **Govern** function, emphasizing strong cybersecurity governance, and places greater emphasis on supply chain risk management.

**6 core functions:**

|Function|Description|
|---|---|
|**Govern**|Overall governance across all other functions — establishing, overseeing, and improving cybersecurity strategy, policy, roles, and risk management to align with business goals/regulations|
|**Identify**|Management of cybersecurity risk and its effect on people and assets|
|**Protect**|Strategy to protect the org via policies, procedures, training, and tools that mitigate threats|
|**Detect**|Identifying potential security incidents, improving monitoring speed/efficiency|
|**Respond**|Proper procedures to contain, neutralize, and analyze incidents; implement process improvements|
|**Recover**|Returning affected systems back to normal operation|

### NIST Special Publication (S.P.) 800-53

A unified framework for protecting the security of information systems within the U.S. federal government.

---

## 6. OWASP Security Principles

**OWASP** = Open Worldwide Application Security Project (formerly Open Web Application Security Project) — a non-profit focused on improving software security.

### Core principles

|Principle|Description|
|---|---|
|**Minimize attack surface area**|Reduce the total set of attack vectors an attacker could exploit|
|**Principle of least privilege**|Users get only the access required for their everyday tasks|
|**Defense in depth**|Multiple, varying security controls that address risk in different ways|
|**Separation of duties**|Critical actions rely on multiple people, each following least privilege — no one person holds too many responsibilities|
|**Keep security simple**|Avoid unnecessary complexity — complexity makes security harder to manage|
|**Fix security issues correctly**|Identify root cause, contain impact, identify vulnerabilities, test that remediation succeeded|

### Additional OWASP principles

|Principle|Description|
|---|---|
|**Establish secure defaults**|The secure option is the default state; it should take extra effort to make something insecure|
|**Fail securely**|When a control fails, it defaults to its most secure state (e.g., a failed firewall blocks all new connections rather than allowing everything)|
|**Don't trust services (third parties)**|Don't assume a partner's systems are secure just because they're a partner — verify independently (e.g., verify a vendor's reward-point balance before sharing it with customers)|
|**Avoid security by obscurity**|Security shouldn't depend on hiding implementation details; rely instead on password policy, defense in depth, transaction limits, solid network architecture, and audit controls|

> [!tip] Staying current "Don't be too overwhelmed with trying to understand every single specialization within cybersecurity." Search for articles matching your specialization, nail the fundamentals, and be persistent.

---

## 7. Security Audits

> [!info] Security Audit A review of an organization's security controls, policies, and procedures against a set of expectations. Independent review evaluating internal criteria (policies, procedures, best practices) and external criteria (regulatory compliance, laws, federal regulations).

### Goals and objectives

- **Goal:** ensure IT practices meet industry/organizational standards
- **Objective:** identify and address areas of remediation and growth
- Audits must be performed to safeguard data and avoid government fines/penalties; frequency depends on local laws and compliance regulations

### Factors affecting audit type

- Industry type
- Organization size
- Ties to applicable government regulations
- Business's geographic location
- Business decision to adhere to a specific regulatory compliance

### Two types of audits

|Type|Notes|
|---|---|
|**Internal**|Entry-level friendly; improves security posture; avoids compliance fines|
|**External**|Independent, third-party review|

### Purpose of internal audits

- Identify organizational risk
- Assess controls
- Correct compliance issues

### Common elements of an internal audit

1. Establishing the scope and goals
2. Conducting a risk assessment
3. Completing a controls assessment
4. Assessing compliance
5. Communicating results

#### Element 1 — Scope and goals

- **Scope** = the specific criteria of the audit
- **Goals** = outline of the org's security objectives
- Entry-level analysts review scope/goals set by seniors

_Sample scope:_ assess user permissions, identify existing controls/procedures/system protocols, account for technology in use. _Sample goals:_ adhere to NIST CSF, establish policies for regulatory compliance, fortify system controls.

#### Element 2 — Risk assessment

- Identifies potential threats, risks, vulnerabilities and what security measures should apply
- Usually done by senior analysts; entry-level staff may analyze provided details to determine needed compliance/controls

#### Key audit questions

- What is the audit meant to achieve?
- Which assets are most at risk?
- Are current controls sufficient to protect those assets?
- What controls and compliance regulations need to be implemented?

#### Element 3 — Controls assessment

Closely reviewing existing assets, then evaluating potential risk to ensure internal controls/processes are effective.

**3 control categories:**

|Category|Description|
|---|---|
|**Administrative**|Human component of cybersecurity|
|**Technical**|Hardware or software solutions|
|**Physical**|Physical measures — cameras, locks, etc.|

#### Element 4 — Compliance assessment

Adhering to relevant standards or compliance regulations.

#### Element 5 — Stakeholder communication

- Summarizes scope and goals
- Lists existing risks
- Notes urgency for addressing each risk
- Identifies compliance regulations
- Provides recommendations

### Audit checklist (5 areas)

1. **Identify the scope of the audit** — list assets assessed, note how the audit helps org goals, indicate audit frequency, evaluate policies/protocols/procedures
2. **Complete a risk assessment** — evaluate risks tied to budget, controls, internal processes, external standards
3. **Conduct the audit** — assess security of the assets listed in scope
4. **Create a mitigation plan** — strategy to lower risk level and potential costs/penalties
5. **Communicate results to stakeholders** — detailed report of findings, improvements, and compliance needs

### Role of frameworks in audits

Frameworks like **NIST CSF** and **ISO 27000** help organizations prepare for regulatory compliance audits and save time on both external and internal audits.

---

## 8. Control Types and Categories

### 4 control types (by function)

|Type|Purpose|
|---|---|
|**Preventative**|Designed to prevent an incident from occurring in the first place|
|**Corrective**|Used to restore an asset after an incident|
|**Detective**|Determine whether an incident has occurred or is in progress|
|**Deterrent**|Designed to discourage attacks|

> These work together to provide **defense in depth**.

### Administrative Controls

|Control|Type|Purpose|
|---|---|---|
|Least privilege|Preventative|Reduce risk/impact of malicious insiders or compromised accounts|
|Disaster recovery plans|Corrective|Provide business continuity|
|Password policies|Preventative|Reduce account compromise via brute force/dictionary attacks|
|Access control policies|Preventative|Bolster confidentiality/integrity by defining group access|
|Account management policies|Preventative|Manage account lifecycle, reduce attack surface, limit impact from former employees/default accounts|
|Separation of duties|Preventative|Reduce risk/impact of malicious insiders or compromised accounts|

### Technical Controls

|Control|Type|Purpose|
|---|---|---|
|Firewall|Preventative|Filter unwanted/malicious traffic from entering the network|
|IDS/IPS|Detective|Detect and prevent anomalous traffic matching a signature/rule|
|Encryption|Deterrent|Provide confidentiality to sensitive information|
|Backups|Corrective|Restore/recover from an event|
|Password management|Preventative|Reduce password fatigue|
|Antivirus (AV) software|Corrective|Detect and quarantine known threats|
|Manual monitoring/maintenance/intervention|Preventative|Identify and manage threats/risks/vulnerabilities on out-of-date systems|

### Physical Controls

|Control|Type|Purpose|
|---|---|---|
|Time-controlled safe|Deterrent|Reduce attack surface/impact from physical threats|
|Adequate lighting|Deterrent|Limit hiding places|
|CCTV|Preventative/Detective|Reduce risk of events and inform post-event investigation|
|Locking cabinets (network gear)|Preventative|Bolster integrity by preventing unauthorized physical access|
|Alarm-provider signage|Deterrent|Make a successful attack seem less likely|
|Locks|Deterrent/Preventative|Bolster integrity by deterring/preventing unauthorized physical access|
|Fire detection/prevention|Detective/Preventative|Detect and prevent damage to physical assets|

---

## 9. Cybersecurity Tools — Logs and SIEM

### Logs

> A record of events that occur within an organization's systems and networks.

|Log type|Description|
|---|---|
|**Firewall logs**|Record of attempted/established connections — inbound traffic from the internet and outbound requests from within the network|
|**Network logs**|Record of all computers/devices entering and leaving the network, plus connections between devices/services|
|**Server logs**|Record of events related to services (websites, email, file shares) — logins, password/username requests|

### SIEM (Security Information and Event Management)

> An application that collects and analyzes log data to monitor critical activities in an organization.

- Real-time visibility
- Event monitoring and analysis
- Automated alerts
- Stores log data
- Currently still requires **human interaction** for analysis of security events

**Metrics** — key technical attributes (response time, availability, failure rate) used to assess software application performance.

### The future of SIEM

- Growing shift to **cloud-hosted** SIEM (vendor maintains infrastructure, accessed via internet) and **cloud-native** SIEM (fully vendor-managed, built to exploit cloud availability/flexibility/scalability)
- IoT growth → larger attack surface → more data to analyze
- AI/ML expected to enhance threat-terminology identification, dashboard visualization, and data storage
- **SOAR** (Security Orchestration, Automation, and Response) — automates responses to common incidents, freeing analysts for complex/uncommon cases
- Long-term trend: interconnected security platforms communicating with each other (still in progress)

> [!quote] On accessibility and security "I think of accessibility as making information, activities, or even environments meaningful, sensible, usable to as many people as possible." Decisions made based on one's own abilities to enhance security can be ineffective — remember there's a range of abilities you're serving.

### Types of SIEM deployment

- Self-hosted
- Cloud-hosted
- Hybrid (leverages cloud while maintaining confidentiality)

### Common SIEM/security tools

|Tool|Type|Description|
|---|---|---|
|**Splunk Enterprise**|Self-hosted, proprietary|Retains, analyzes, searches org log data; real-time security info/alerts|
|**Splunk Cloud**|Cloud-hosted, proprietary|Collects, searches, monitors log data|
|**Chronicle (Google SecOps)**|Cloud-native, proprietary|Retains, analyzes, searches log data|
|**Linux**|Open-source|OS foundation used widely in security tooling|
|**Suricata**|Open-source|Network analysis and threat detection software; inspects traffic for suspicious behavior and generates logs; developed by the Open Information Security Foundation (OISF)|

> "The path looks different for everyone."

### Splunk dashboards

|Dashboard|Purpose|
|---|---|
|**Security posture**|Last 24 hrs of notable security events/trends for SOCs; real-time investigation (e.g., suspicious activity from a specific IP)|
|**Executive summary**|Analyzes/monitors overall org health over time; used for high-level stakeholder insights|
|**Incident review**|Identifies suspicious patterns during an incident; highlights high-risk items needing immediate review; visual event timeline|
|**Risk analysis**|Identifies risk per risk object (user, computer, IP); shows changes in risk-related behavior; helps prioritize mitigation|

### Chronicle dashboards

Chronicle analyzes data by: a specific asset, a domain name, a user, or an IP address.

|Dashboard|Purpose|
|---|---|
|**Enterprise insights**|Highlights recent alerts; identifies suspicious domains (IOCs — Indicators of Compromise) with confidence score and severity level|
|**Data ingestion and health**|Shows number of event logs, log sources, and success rate of data processed into Chronicle|
|**IOC matches**|Indicates top threats/risks/vulnerabilities; tracks domain names, IPs, device IOCs over time to spot trends|
|**Main dashboard**|High-level summary of data ingestion, alerting, and event activity over time|
|**Rule detections**|Statistics on incidents with highest occurrence/severity/detections over time|
|**User sign-in overview**|User access behavior across the org — flags unusual activity (e.g., simultaneous logins from multiple locations)|

---

## 10. Playbooks and Incident Response

> [!info] Playbook A manual that provides details about any operational action — a predefined, up-to-date list of steps to perform when responding to an incident.

> [!info] Incident Response An organization's quick attempt to identify an attack, contain the damage, and correct the effects of a security breach.

### Playbooks are living documents

Playbooks are collaboratively maintained and updated when:

- A failure/oversight is identified in policies, procedures, or the playbook itself
- Industry standards change (laws, regulatory compliance)
- The threat landscape changes (evolving threat actor tactics/techniques)

### Types of playbooks

- Incident and vulnerability response (most common for entry-level roles) — built from the org's business continuity plan
- Ransomware, vishing, business email compromise (BEC), open attacks, privacy incidents, data leaks, denial-of-service attacks, service alerts, and others

### 6 phases of incident response

|Phase|Description|
|---|---|
|**Preparation**|Sets the foundation for successful incident response|
|**Detection and Analysis**|Identify and analyze the incident|
|**Containment**|Reduce damage of an ongoing attack — high priority to prevent ongoing risk|
|**Eradication and Recovery**|Remove malicious code, mitigate vulnerabilities, restore affected systems (a.k.a. IT restoration)|
|**Post-Incident Activity**|Documentation, future planning, full-scale incident analysis, implement improvements|
|**Coordination**|Meet compliance requirements, inform security analysts throughout|

> A sense of urgency is essential — risk equals the likelihood of a threat. Mishandling data during response can compromise forensic evidence, rendering it unusable.

### Playbooks + SIEM

Used alongside SIEM tools — e.g., if unusual user behavior is flagged by a SIEM, the playbook tells analysts how to address it.

### Playbooks + SOAR

**SOAR** (Security Orchestration, Automation, and Response) automates repetitive tasks generated by tools like SIEM or MDR (Managed Detection and Response). Example: too many failed login attempts → SOAR auto-blocks the account → analyst follows the playbook to resolve.

> "Some teams come in and out of fashion, but security is ever present." "We can teach you anything, but we can't teach how to relate to people."

---

## 11. Glossary

|Term|Definition|
|---|---|
|**Asset**|An item perceived as having value to an organization|
|**Attack vectors**|The pathways attackers use to penetrate security defenses|
|**Authentication**|The process of verifying who someone is|
|**Authorization**|Granting access to specific resources in a system|
|**Availability**|Data is accessible to those authorized to access it|
|**Biometrics**|Unique physical characteristics used to verify identity|
|**CIA Triad**|Model informing how orgs consider risk when setting up systems/policies|
|**Confidentiality**|Only authorized users can access specific assets/data|
|**Detect**|NIST core function — identifying incidents, improving monitoring speed/efficiency|
|**Encryption**|Converting data from readable to encoded format|
|**Govern**|NIST core function — establishing/overseeing/improving cybersecurity strategy, policy, roles, risk management|
|**Identify**|NIST core function — managing cybersecurity risk's effect on people/assets|
|**Incident response**|Org's quick attempt to identify an attack, contain damage, correct effects of a breach|
|**Integrity**|Data is correct, authentic, and reliable|
|**Log**|A record of events within an org's systems|
|**Metrics**|Key technical attributes (response time, availability, failure rate) assessing software performance|
|**NIST CSF**|Voluntary framework of standards/guidelines/best practices to manage cybersecurity risk|
|**NIST S.P. 800-53**|Unified framework protecting U.S. federal government info systems|
|**OWASP**|Non-profit focused on improving software security|
|**Operating system (OS)**|Interface between computer hardware and the user|
|**Playbook**|Manual detailing operational actions for incident response|
|**Protect**|NIST core function — policies/procedures/training/tools to mitigate threats|
|**Recover**|NIST core function — returning affected systems to normal operation|
|**Respond**|NIST core function — containing/neutralizing/analyzing incidents, improving process|
|**Risk**|Anything impacting confidentiality, integrity, or availability of an asset|
|**Security audit**|Review of security controls/policies/procedures against expectations|
|**Security controls**|Safeguards designed to reduce specific security risks|
|**Security frameworks**|Guidelines for building plans to mitigate risk/threats to data/privacy|
|**Security posture**|Org's ability to manage defense of critical assets/data and react to change|
|**SIEM**|Application collecting/analyzing log data to monitor critical org activities|
|**SIEM tools**|Software platform collecting/analyzing/correlating security data across IT infrastructure|
|**SOAR**|Collection of apps/tools/workflows automating responses to security events|
|**Splunk Cloud**|Cloud-hosted tool to collect/search/monitor log data|
|**Splunk Enterprise**|Self-hosted tool to retain/analyze/search log data, real-time alerts|
|**Chronicle**|Cloud-native tool to retain/analyze/search data|
|**Threat**|Any circumstance/event that can negatively impact assets|
