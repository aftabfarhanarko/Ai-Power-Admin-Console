export const USERS = [
  {
    id: "u1",
    name: "Simin Nikmanesh",
    avatar: "https://i.pravatar.cc/150?u=u1",
    email: "simin@tica.co",
    company: "Tica Co.",
  },
  {
    id: "u2",
    name: "Aaron Wang",
    avatar: "https://i.pravatar.cc/150?u=u2",
    email: "aaron@floratina.com",
    company: "Floratina",
  },
  {
    id: "u3",
    name: "Ava Taylor",
    avatar: "https://i.pravatar.cc/150?u=u3",
    email: "ava@melorinshop.com",
    company: "Melorinshop",
  },
  {
    id: "u4",
    name: "Shamima Melen",
    avatar: "https://i.pravatar.cc/150?u=u4",
    email: "shamima@shoppine.com",
    company: "Shoppine",
  },
  {
    id: "u5",
    name: "Honey Harper",
    avatar: "https://i.pravatar.cc/150?u=u5",
    email: "honey@brilliant.com",
    company: "Brilliant Boutique",
  },
];

export const TICKETS = [
  {
    id: "#665",
    requesterId: "u2",
    priority: "highest",
    subject: "Login issue",
    status: "open",
    date: new Date(2023, 10, 24, 9, 13),
    tags: ["Login", "Bug"],
    messages: [
      {
        id: "m1",
        senderId: "u2",
        content:
          "I cannot log in to my account. It says invalid credentials but I just reset my password.",
        timestamp: new Date(2023, 10, 24, 9, 13),
      },
      {
        id: "m2",
        senderId: "me",
        content: "Hi Aaron, let me check the logs for you. One moment please.",
        timestamp: new Date(2023, 10, 24, 9, 15),
      },
    ],
  },
  {
    id: "#664",
    requesterId: "u1",
    priority: "medium",
    subject: "New feature request",
    status: "pending",
    date: new Date(2023, 10, 23, 14, 20),
    tags: ["Feature", "Product"],
    messages: [],
  },
  {
    id: "#663",
    requesterId: "u3",
    priority: "low",
    subject: "Invoice #4022",
    status: "closed",
    date: new Date(2023, 10, 22, 11, 5),
    tags: ["Billing"],
    messages: [],
  },
  {
    id: "#662",
    requesterId: "u4",
    priority: "high",
    subject: "Payment failed",
    status: "open",
    date: new Date(2023, 10, 22, 10, 30),
    tags: ["Billing", "Urgent"],
    messages: [],
  },
  {
    id: "#661",
    requesterId: "u5",
    priority: "medium",
    subject: "Account settings",
    status: "on hold",
    date: new Date(2023, 10, 21, 15, 45),
    tags: ["Account"],
    messages: [],
  },
  {
    id: "#660",
    requesterId: "u2",
    priority: "low",
    subject: "Question about shipping",
    status: "open",
    date: new Date(2023, 10, 21, 9, 10),
    tags: ["Shipping"],
    messages: [],
  },
  {
    id: "#659",
    requesterId: "u5",
    priority: "high",
    subject: "Updating details",
    status: "closed",
    date: new Date(2023, 10, 21, 16, 45),
    tags: ["Account"],
    messages: [],
  },
];

export const KNOWLEDGE_BASE = [
  {
    id: "kb1",
    title: "Server capacity",
    category: "Infrastructure",
    type: "Article",
  },
  // ... other KB items
];
 