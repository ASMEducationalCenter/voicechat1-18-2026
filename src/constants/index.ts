import { QuestionData } from '../types';

export const INTERVIEW_QUESTIONS: QuestionData[] = [
  {
    id: 1,
    question: "What does a help desk technician do?",
    modelAnswer:
      `A help desk technician provides technical support to users by troubleshooting hardware, software, network, and account-related issues. They help resolve problems, answer user questions, document incidents, and escalate more complex issues when necessary. The role is important because it helps keep users productive and ensures technology problems are handled efficiently.`,
    realWorldExamples: [
      "A help desk technician helps an employee who cannot log into their email account.",
      "A technician troubleshoots a printer that stopped working in the office.",
      "A support agent assists a user whose laptop cannot connect to Wi-Fi."
    ]
  },
  {
    id: 2,
    question: "What is the difference between hardware and software?",
    modelAnswer:
      `Hardware refers to the physical parts of a computer or device, such as a monitor, keyboard, hard drive, or printer. Software refers to the programs and operating systems that run on the hardware, such as Windows, Microsoft Office, or a web browser. Help desk technicians need to understand both because issues can come from either the physical device or the installed applications.`,
    realWorldExamples: [
      "A broken keyboard is a hardware problem.",
      "A frozen Microsoft Word application is a software problem.",
      "A laptop with a damaged screen has a hardware issue, while a computer failing to open Outlook is a software issue."
    ]
  },
  {
    id: 3,
    question: "How would you handle a user who says their computer is running slow?",
    modelAnswer:
      `I would begin by asking questions to understand when the issue started and what programs are affected. Then I would check common causes such as too many background applications, low disk space, high CPU or memory usage, pending updates, or malware. I would apply the appropriate fix, test the system, and confirm with the user that performance improved.`,
    realWorldExamples: [
      "A user’s computer is slow because too many startup programs are running.",
      "A laptop performs poorly because the hard drive is almost full.",
      "A machine becomes slow because a background application is using excessive CPU."
    ]
  },
  {
    id: 4,
    question: "What would you do if a user cannot connect to Wi-Fi?",
    modelAnswer:
      `I would first check whether Wi-Fi is enabled on the device and confirm whether other users are also affected. Then I would verify the network name, password, signal strength, and IP configuration. I would restart the device or network adapter if needed, test connectivity, and escalate the issue if it appears to be a larger network problem.`,
    realWorldExamples: [
      "A user cannot connect because airplane mode is enabled.",
      "A device fails to join Wi-Fi because the password was entered incorrectly.",
      "A laptop cannot access the network until the wireless adapter is restarted."
    ]
  },
  {
    id: 5,
    question: "What is a ticketing system and why is it important?",
    modelAnswer:
      `A ticketing system is a tool used to log, track, prioritize, and manage support requests. It is important because it helps technicians stay organized, document issues and solutions, monitor progress, and ensure users receive timely support. It also provides accountability and helps teams identify recurring problems.`,
    realWorldExamples: [
      "A technician logs a password reset request into the ticketing system and closes it after resolving the issue.",
      "A support team uses ticket priority levels to respond first to business-critical problems.",
      "A company reviews ticket trends and notices repeated printer issues in one department."
    ]
  },
  {
    id: 6,
    question: "How would you reset a user’s password safely?",
    modelAnswer:
      `I would first verify the user’s identity according to company procedures before making any account changes. Then I would reset the password using the approved system, provide temporary login instructions if needed, and remind the user to create a secure new password. Security and identity verification are important so unauthorized people cannot gain access to accounts.`,
    realWorldExamples: [
      "A technician verifies an employee’s identity before resetting their company email password.",
      "A support agent issues a temporary password and asks the user to change it at first login.",
      "A help desk worker follows company verification steps before unlocking an account."
    ]
  },
  {
    id: 7,
    question: "What is the difference between troubleshooting and escalation?",
    modelAnswer:
      `Troubleshooting is the process of identifying, diagnosing, and resolving a technical issue. Escalation happens when the problem cannot be solved at the current support level and must be passed to a more specialized team or higher-level technician. A good help desk technician knows how to troubleshoot efficiently and when to escalate appropriately.`,
    realWorldExamples: [
      "A technician troubleshoots a login issue and resolves it without escalation.",
      "A desktop support agent escalates a server outage to the infrastructure team.",
      "A help desk worker escalates a complex network issue after completing basic diagnostic steps."
    ]
  },
  {
    id: 8,
    question: "How do you provide good customer service in a help desk role?",
    modelAnswer:
      `Good customer service in a help desk role means listening carefully, staying patient, communicating clearly, and treating users respectfully. It also means keeping the user informed, setting realistic expectations, and making sure the issue is fully resolved or properly escalated. Strong customer service helps build trust and improves the user experience.`,
    realWorldExamples: [
      "A technician calmly helps a frustrated employee who cannot access an important file.",
      "A support agent explains technical steps in simple language so the user can follow along.",
      "A help desk worker updates the user regularly while waiting for a higher-level team to resolve the issue."
    ]
  },
  {
    id: 9,
    question: "What should you document in a support ticket?",
    modelAnswer:
      `A support ticket should include the user’s issue, relevant symptoms, troubleshooting steps taken, actions performed, the outcome, and whether the issue was resolved or escalated. Good documentation is important because it helps other technicians understand the case, provides a record of work completed, and supports future troubleshooting.`,
    realWorldExamples: [
      "A technician documents that they reset the password, tested login, and confirmed access was restored.",
      "A support ticket notes that the printer issue was caused by a paper jam and was resolved on site.",
      "A help desk worker records that a network issue was escalated after basic connectivity tests failed."
    ]
  },
  {
    id: 10,
    question: "What would you do if a printer is not working?",
    modelAnswer:
      `I would check whether the printer is powered on, connected, and showing any error messages. Then I would inspect common issues such as paper jams, low toner, offline status, or incorrect printer selection on the user’s computer. After resolving the issue, I would test print and confirm with the user that it is working properly.`,
    realWorldExamples: [
      "A printer stops working because it is set to offline mode.",
      "A user cannot print because the wrong default printer is selected.",
      "A printer issue is resolved after clearing a paper jam and restarting the device."
    ]
  },
  {
    id: 11,
    question: "What is an IP address?",
    modelAnswer:
      `An IP address is a unique numerical address assigned to a device on a network so it can communicate with other devices. Help desk technicians use IP addresses when troubleshooting network connectivity, identifying devices, and checking whether a system is connected properly. It is a basic but important networking concept.`,
    realWorldExamples: [
      "A technician checks a computer’s IP address while troubleshooting internet access.",
      "A device cannot connect properly because it did not receive a valid IP address.",
      "A support agent uses IP information to verify that a printer is on the network."
    ]
  },
  {
    id: 12,
    question: "What is the difference between a modem and a router?",
    modelAnswer:
      `A modem connects a home or office to the internet service provider, while a router distributes that connection to multiple devices on a local network. In many environments, help desk technicians may troubleshoot both internet connection issues and local network access, so understanding the difference is important.`,
    realWorldExamples: [
      "The modem connects the office to the ISP, while the router provides Wi-Fi to employee laptops.",
      "A user loses internet because the modem is offline.",
      "Devices in the office cannot connect wirelessly because the router needs to be restarted."
    ]
  },
  {
    id: 13,
    question: "How would you help a user who cannot log into their computer?",
    modelAnswer:
      `I would ask for the exact error message and confirm whether the issue is with the password, account lockout, domain login, or device itself. I would verify the username, check caps lock, and confirm whether the user is connected to the correct network if domain authentication is required. If needed, I would reset the password, unlock the account, or escalate based on company procedures.`,
    realWorldExamples: [
      "A user cannot log in because caps lock is turned on.",
      "An employee’s account is locked after too many failed password attempts.",
      "A domain user cannot sign in remotely because the device is not connected to the company network."
    ]
  },
  {
    id: 14,
    question: "What is remote desktop support?",
    modelAnswer:
      `Remote desktop support allows a technician to connect to a user’s computer from another location in order to troubleshoot and resolve issues. It is useful because it saves time, allows technicians to see the exact problem, and helps support users who are working remotely. It should always be done according to company security and privacy procedures.`,
    realWorldExamples: [
      "A technician uses remote support software to fix an Outlook issue on a remote employee’s laptop.",
      "A help desk worker connects remotely to install a needed application for a user.",
      "A support agent uses remote access to troubleshoot a settings problem without visiting the desk in person."
    ]
  },
  {
    id: 15,
    question: "What is malware?",
    modelAnswer:
      `Malware is malicious software designed to harm, disrupt, or gain unauthorized access to systems. It can include viruses, ransomware, spyware, and trojans. Help desk technicians should recognize signs of malware, follow company procedures, and report or escalate security-related issues quickly.`,
    realWorldExamples: [
      "A computer is infected after a user opens a suspicious email attachment.",
      "Spyware is installed through a malicious download and begins collecting data.",
      "A help desk technician reports unusual pop-ups and suspicious system behavior as a possible malware issue."
    ]
  },
  {
    id: 16,
    question: "Why is communication important in technical support?",
    modelAnswer:
      `Communication is important because technicians must understand the user’s problem, explain solutions clearly, and keep users informed throughout the support process. Many users are not technical, so technicians should avoid jargon and speak in a clear, calm, and professional way. Good communication improves efficiency and user satisfaction.`,
    realWorldExamples: [
      "A support agent explains password reset instructions in simple steps.",
      "A technician updates the user that the issue has been escalated and gives an expected next step.",
      "A help desk worker asks clear questions to understand exactly what error the user is seeing."
    ]
  },
  {
    id: 17,
    question: "What would you do if you do not know the answer to a technical issue?",
    modelAnswer:
      `If I do not know the answer, I would stay honest, use available resources such as knowledge bases or documentation, and continue troubleshooting within my scope. If needed, I would escalate the issue to the appropriate team while documenting what I already checked. The goal is to solve the problem efficiently while keeping the user informed.`,
    realWorldExamples: [
      "A technician checks the internal knowledge base before escalating a software error.",
      "A support agent consults a senior technician after completing basic troubleshooting steps.",
      "A help desk worker documents their findings and passes the case to the network team."
    ]
  },
  {
    id: 18,
    question: "What is the purpose of Active Directory in many organizations?",
    modelAnswer:
      `Active Directory is used to manage users, computers, groups, and permissions in a Windows environment. It helps organizations control access, apply security settings, and manage accounts centrally. Help desk technicians often use it for password resets, account unlocks, and checking user or computer information.`,
    realWorldExamples: [
      "A technician unlocks a user account in Active Directory after repeated failed logins.",
      "A support agent resets a password for an employee using Active Directory tools.",
      "A help desk worker checks a computer’s domain membership in Active Directory."
    ]
  },
  {
    id: 19,
    question: "How do you prioritize multiple support tickets?",
    modelAnswer:
      `I would prioritize tickets based on business impact, urgency, number of users affected, and service level agreements. Critical issues such as outages, security incidents, or problems affecting many users should be handled before lower-impact requests. Good prioritization helps reduce disruption and ensures important issues are addressed first.`,
    realWorldExamples: [
      "A company-wide email outage is handled before a single user’s printer issue.",
      "A technician prioritizes a locked executive account before a routine software request.",
      "A support team addresses a network outage affecting an entire department before lower-priority tickets."
    ]
  },
  {
    id: 20,
    question: "What would you do if a user is frustrated or upset?",
    modelAnswer:
      `I would remain calm, listen carefully, acknowledge their frustration, and focus on solving the problem. I would avoid arguing, communicate clearly, and keep the user updated on what I am doing. Staying professional and empathetic is important because technical problems can disrupt the user’s work and increase stress.`,
    realWorldExamples: [
      "A technician calmly helps an employee who is upset about losing access before a meeting.",
      "A support agent reassures a user while troubleshooting an urgent login problem.",
      "A help desk worker listens patiently and explains the next steps to a frustrated customer."
    ]
  },
  {
    id: 21,
    question: "What is phishing?",
    modelAnswer:
      `Phishing is a scam in which attackers send fraudulent emails, messages, or websites to trick users into revealing sensitive information or clicking malicious links. Help desk technicians should recognize phishing attempts, warn users, and report suspected messages according to company procedures. It is a common security issue in many workplaces.`,
    realWorldExamples: [
      "A user receives a fake email asking them to reset their password through a suspicious link.",
      "An employee gets a message pretending to be from IT requesting login credentials.",
      "A support technician reports a suspicious email that claims a user’s account will be disabled unless they click a link."
    ]
  },
  {
    id: 22,
    question: "Why are updates and patches important?",
    modelAnswer:
      `Updates and patches are important because they fix bugs, improve performance, and close security vulnerabilities. Keeping systems updated helps reduce the risk of software issues and cyberattacks. Help desk technicians often assist users with updates or verify that devices are properly patched.`,
    realWorldExamples: [
      "A laptop runs better after installing pending operating system updates.",
      "A software patch fixes a known issue causing application crashes.",
      "A company deploys security updates to protect systems from known vulnerabilities."
    ]
  },
  {
    id: 23,
    question: "How would you explain a technical issue to a non-technical user?",
    modelAnswer:
      `I would use simple language, avoid unnecessary technical terms, and focus on what the user needs to do or understand. I would break the explanation into clear steps and check that the user is following. The goal is to make the solution understandable and reduce confusion.`,
    realWorldExamples: [
      "A technician explains Wi-Fi troubleshooting without using complex networking terms.",
      "A support agent tells the user exactly where to click and what message to look for.",
      "A help desk worker compares a password reset to changing a lock and key to make it easier to understand."
    ]
  },
  {
    id: 24,
    question: "What is MFA and why is it useful?",
    modelAnswer:
      `Multi-Factor Authentication requires more than one form of verification before allowing access to an account or system. It is useful because it adds an extra layer of security, so even if a password is stolen, unauthorized users are less likely to get in. Help desk technicians may assist users with MFA setup or troubleshooting.`,
    realWorldExamples: [
      "A user signs in with a password and then confirms access with a code on their phone.",
      "An employee cannot complete login until they approve the MFA prompt.",
      "A help desk technician helps a user re-register their authenticator app after getting a new phone."
    ]
  },
  {
    id: 25,
    question: "What steps would you take before escalating a ticket?",
    modelAnswer:
      `Before escalating a ticket, I would gather details, reproduce the issue if possible, perform basic troubleshooting, document what I found, and confirm that the problem is outside my support level or permissions. Proper escalation helps the next technician work faster and avoids wasting time repeating the same steps.`,
    realWorldExamples: [
      "A help desk worker documents failed login tests before escalating to the identity team.",
      "A technician records network troubleshooting results before sending the issue to the network team.",
      "A support agent notes error messages and completed steps before escalating an application problem."
    ]
  },
  {
    id: 26,
    question: "Why is documentation important in IT support?",
    modelAnswer:
      `Documentation is important because it creates a record of issues, solutions, and troubleshooting steps. It helps teams work more efficiently, supports knowledge sharing, and allows recurring problems to be identified more easily. Good documentation also improves handoffs and accountability.`,
    realWorldExamples: [
      "A technician reuses a documented solution for a recurring VPN problem.",
      "A support team reviews past tickets to identify a pattern of printer failures.",
      "A help desk worker leaves clear notes so another technician can continue the case."
    ]
  },
  {
    id: 27,
    question: "Describe a time you solved a technical problem.",
    modelAnswer:
      `I identified the issue, determined the cause, applied the correct fix, and confirmed the problem was resolved successfully. I would explain the problem clearly, describe the steps I took, and mention the result. A strong answer shows problem-solving, communication, and follow-through.`,
    realWorldExamples: [
      "A user could not access email because their password had expired, and resetting it restored access.",
      "A laptop could not connect to Wi-Fi until the wireless adapter was re-enabled.",
      "A printer issue was resolved after clearing the queue and restarting the print spooler service."
    ]
  },
  {
    id: 28,
    question: "Why do you want to work in help desk or IT support?",
    modelAnswer:
      `I want to work in help desk because I enjoy solving technical problems, helping people, and continuing to build my IT skills. The role combines customer service, troubleshooting, and hands-on learning. It is also a strong foundation for growing into other IT roles over time.`,
    realWorldExamples: [
      "A help desk role allows someone to build experience with hardware, software, and user support.",
      "Supporting users gives hands-on exposure to real technical problems every day.",
      "A technician can start in help desk and later grow into systems, networking, or cybersecurity roles."
    ]
  },
  {
    id: 29,
    question: "How do you stay organized when handling many tasks?",
    modelAnswer:
      `I stay organized by prioritizing tasks, tracking work carefully in the ticketing system, and communicating clearly about deadlines and status updates. I focus on urgent issues first while making sure lower-priority tasks are also followed up appropriately. Organization is important in help desk because there are often many requests at once.`,
    realWorldExamples: [
      "A technician uses ticket priorities and notes to keep track of multiple requests.",
      "A support agent updates tickets after each action so nothing is missed.",
      "A help desk worker manages urgent outages first, then returns to routine requests."
    ]
  },
  {
    id: 30,
    question: "Where do you see your IT or help desk career in the future?",
    modelAnswer:
      `In the future, I want to continue developing my technical and customer support skills through hands-on experience, training, and certifications. I see help desk as a strong starting point where I can build a solid IT foundation and later grow into areas such as system administration, networking, cloud support, or cybersecurity.`,
    realWorldExamples: [
      "A help desk technician later becomes a system administrator.",
      "An entry-level support professional builds experience and moves into networking.",
      "A support role provides the foundation for future growth in cybersecurity or cloud support."
    ]
  }
];

export const SYSTEM_INSTRUCTION = `
You are a Help Desk Interview Coach for ASM Educational Center.
Run a realistic voice-based mock interview for an entry-level help desk candidate.

QUESTIONS, MODEL ANSWERS, AND EXAMPLES:
\${INTERVIEW_QUESTIONS.map(q => \`
\${q.id}. \${q.question}
Model Answer: \${q.modelAnswer}
Examples: \${q.realWorldExamples.join('; ')}
\`).join('\\n')}

RULES:
- Greet the user, ask for their name, and use it.
- Start with Question 1.
- Ask exactly 30 questions, one at a time.
- Say the question number only when asking a new question, for example: "Question 1 of 30."
- Keep responses concise and natural for voice.

SCORING:
- After each answer, begin your response with one of:
  "Correct."
  "Partially Correct."
  or a supportive phrase such as:
  "Not quite."
  "Almost there."
  "Good attempt."
- Use the provided Model Answer as the source of truth.
- Do not contradict or replace it with a different explanation.

FEEDBACK:
- If the answer is strong, briefly explain why it is correct.
- If the answer is weak, vague, incorrect, or the user says "I don't know," give a corrected explanation based on the Model Answer.
- When correcting an answer, include most of the key points from the Model Answer, but keep it concise and natural for speech.
- Only give a fuller explanation when the answer is very weak, incorrect, or the user says "I don't know".
- Keep explanations concise (max 3–5 spoken sentences).
- Do not repeat the full question during feedback unless the user explicitly asks.

- Base your explanation directly on the Model Answer.
- Include the key components from the Model Answer.
- Do not replace the Model Answer with a vague or overly simplified version.
- You may slightly rephrase for natural speech, but keep the full meaning and key points intact.

- Do NOT use labels like "Feedback:" or "Evaluation:".

- After the explanation:
  - Give exactly 2 short coaching notes.
  - Start each with "Coaching note:".

- Then:
  - Give exactly 1 real-world example.
  - The example MUST come from the provided Examples list for that question.
  - Do not invent a new example if one is provided.
  - If multiple examples exist, choose one and stay close to its wording.

FLOW:
- After feedback, ask: "Would you like clarification, or should we move on?"
- If the user says "repeat," repeat the current question exactly.
- If the user says "skip," move to the next question and mark it as Skipped.
- If the user asks for a specific question or topic, jump there.

FINAL SUMMARY:
- At the end, give:
  - score out of 30
  - strengths
  - improvement areas
  - a 7-day practice plan

STYLE:
- Professional, encouraging, and direct.
- Short spoken paragraphs.
- Avoid long or repetitive responses.
- Sound like a real interviewer and coach, not like a rubric.
`.trim();
