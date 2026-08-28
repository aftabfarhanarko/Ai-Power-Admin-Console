import { useState } from "react";
import {
  Search,
  Settings,
  MoreVertical,
  Star,
  Plus,
  Check,
  Code,
  PenTool,
  MessageSquare,
  ExternalLink,
  Zap,
  Box,
  Video,
  FileText,
  Trello,
  Mail,
  Book,
  Github,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const BrandIcons = {
  Loom: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="#625DF5"
      />
      <path
        d="M12 6.75C14.8995 6.75 17.25 9.1005 17.25 12C17.25 14.8995 14.8995 17.25 12 17.25C9.1005 17.25 6.75 14.8995 6.75 12C6.75 9.1005 9.1005 6.75 12 6.75Z"
        fill="white"
      />
    </svg>
  ),
  Dropbox: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 1.80005L0.600098 5.40005L6 9.00005L11.4 5.40005L6 1.80005Z"
        fill="#0061FF"
      />
      <path
        d="M6 9.00005L0.600098 12.6L6 16.2L11.4 12.6L6 9.00005Z"
        fill="#0061FF"
      />
      <path
        d="M18 1.80005L12.6 5.40005L18 9.00005L23.4 5.40005L18 1.80005Z"
        fill="#0061FF"
      />
      <path
        d="M18 9.00005L12.6 12.6L18 16.2L23.4 12.6L18 9.00005Z"
        fill="#0061FF"
      />
      <path
        d="M6 17.3999L0.600098 13.7999V16.6201L6 20.2201L11.4 16.6201V13.7999L6 17.3999Z"
        fill="#0061FF"
      />
      <path
        d="M18 17.3999L12.6 13.7999V16.6201L18 20.2201L23.4 16.6201V13.7999L18 17.3999Z"
        fill="#0061FF"
      />
    </svg>
  ),
  Zapier: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="4" fill="#FF4F00" />
      <path
        d="M6.3999 15.1999H11.9999V20.7999L17.5999 8.7999H11.9999V3.1999L6.3999 15.1999Z"
        fill="white"
      />
    </svg>
  ),
  Github: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37 0 0 5.37 0 12C0 17.3 3.438 21.8 8.205 23.385C8.805 23.495 9.025 23.125 9.025 22.805C9.025 22.515 9.015 21.745 9.01 20.725C5.672 21.45 4.968 19.115 4.968 19.115C4.422 17.73 3.633 17.36 3.633 17.36C2.544 16.615 3.717 16.63 3.717 16.63C4.922 16.715 5.555 17.865 5.555 17.865C6.625 19.7 8.363 19.17 9.048 18.865C9.155 18.09 9.465 17.56 9.81 17.26C7.145 16.955 4.345 15.925 4.345 11.325C4.345 10.015 4.812 8.945 5.578 8.105C5.455 7.8 5.045 6.57 5.695 4.925C5.695 4.925 6.702 4.605 8.995 6.155C9.952 5.89 10.978 5.755 12 5.755C13.022 5.755 14.048 5.89 15.005 6.155C17.295 4.605 18.3 4.925 18.3 4.925C18.953 6.57 18.543 7.8 18.42 8.105C19.188 8.945 19.653 10.015 19.653 11.325C19.653 15.935 16.85 16.95 14.18 17.255C14.615 17.63 15.003 18.37 15.003 19.505C15.003 21.125 14.99 22.435 14.99 22.805C14.99 23.13 15.207 23.505 15.815 23.385C20.578 21.795 24 17.3 24 12C24 5.37 18.63 0 12 0Z"
        fill="currentColor"
      />
    </svg>
  ),
  Jira: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.53 0.0500488L11.59 0.0800488L0.0800018 11.59L0.0500018 11.53C-0.219998 10.74 0.0600018 9.87005 0.700002 9.23005L9.23 0.700049C9.87 0.0600488 10.74 -0.219951 11.53 0.0500488Z"
        fill="#0052CC"
      />
      <path
        d="M11.53 11.53L11.59 11.56L0.0800018 23.07L0.0500018 23.01C-0.219998 22.22 0.0600018 21.35 0.700002 20.71L9.23 12.18C9.87 11.54 10.74 11.26 11.53 11.53Z"
        fill="#0052CC"
      />
      <path
        d="M23.01 0.0500488L23.07 0.0800488L11.56 11.59L11.53 11.53C11.26 10.74 11.54 9.87005 12.18 9.23005L20.71 0.700049C21.35 0.0600488 22.22 -0.219951 23.01 0.0500488Z"
        fill="#0052CC"
      />
    </svg>
  ),
  Confluence: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0 24H24V0L8.657 15.343C7.59 16.41 7.59 18.143 8.657 19.21L13.447 24H0Z"
        fill="#0052CC"
      />
      <path
        d="M24 0H0V24L15.343 8.657C16.41 7.59 18.143 7.59 19.21 8.657L24 13.447V0Z"
        fill="#2684FF"
      />
    </svg>
  ),
  Gitlab: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M23.955 13.586L21.43 5.811C21.383 5.666 21.303 5.534 21.196 5.424C21.089 5.314 20.957 5.228 20.811 5.174C20.665 5.119 20.508 5.096 20.353 5.106C20.197 5.116 20.047 5.158 19.914 5.23L19.865 5.255L16.234 7.893L13.218 0.69C13.167 0.567 13.087 0.459 12.984 0.375C12.881 0.292 12.758 0.236 12.627 0.212C12.496 0.188 12.361 0.198 12.234 0.24C12.107 0.283 11.992 0.356 11.9 0.455L11.854 0.506L2.378 22.653L23.955 13.586Z"
        fill="#E24329"
      />
      <path
        d="M0.045 13.586L2.57 5.811C2.617 5.666 2.697 5.534 2.804 5.424C2.911 5.314 3.043 5.228 3.189 5.174C3.335 5.119 3.492 5.096 3.647 5.106C3.803 5.116 3.953 5.158 4.086 5.23L4.135 5.255L7.766 7.893L10.782 0.69C10.833 0.567 10.913 0.459 11.016 0.375C11.119 0.292 11.242 0.236 11.373 0.212C11.504 0.188 11.639 0.198 11.766 0.24C11.893 0.283 12.008 0.356 12.1 0.455L12.146 0.506L21.622 22.653L0.045 13.586Z"
        fill="#FC6D26"
      />
      <path d="M12 24L24 13.586H0L12 24Z" fill="#FCA326" />
    </svg>
  ),
  Notion: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.761 5.362L14.757 5.334L15.15 2.768L3.715 2.812L3.257 5.385L4.545 5.589C5.034 5.667 5.247 5.923 5.163 6.425L3.43 17.156C3.315 17.895 2.895 18.064 2.41 18.005L1.134 17.844L0.686 20.399L10.027 20.37L10.435 17.844L9.124 17.65C8.636 17.572 8.423 17.316 8.506 16.814L9.27 12.067L15.113 20.36L21.492 20.33L21.94 17.756L20.652 17.552C20.163 17.474 19.95 17.218 20.034 16.716L21.583 7.156C21.698 6.417 22.118 6.248 22.603 6.307L23.879 6.468L24.327 3.913L15.363 3.942L8.761 5.362ZM13.064 16.653L12.21 11.688L12.049 10.428L12.181 10.443L14.653 14.896L15.631 16.653H13.064ZM18.599 5.86L17.288 13.987L14.155 8.356L13.167 6.58L13.033 5.655L18.599 5.86Z"
        fill="currentColor"
      />
    </svg>
  ),
  Gmail: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21.6 4.8H18V13.2L12 8.4L6 13.2V4.8H2.4C1.08 4.8 0 5.88 0 7.2V19.2C0 20.52 1.08 21.6 2.4 21.6H7.2V14.4L12 10.8L16.8 14.4V21.6H21.6C22.92 21.6 24 20.52 24 19.2V7.2C24 5.88 22.92 4.8 21.6 4.8Z"
        fill="#EA4335"
      />
      <path
        d="M21.6 4.8H18V13.2L12 8.4L6 13.2V4.8H2.4C1.725 4.8 1.118 5.096 0.694 5.568C0.245 6.024 0 6.592 0 7.2V19.2C0 20.52 1.08 21.6 2.4 21.6H7.2V14.4L12 10.8L16.8 14.4V21.6H21.6C22.92 21.6 24 20.52 24 19.2V7.2C24 6.592 23.755 6.024 23.306 5.568C22.882 5.096 22.275 4.8 21.6 4.8Z"
        fill="#EA4335"
      />
      <path
        d="M2.4 4.8C1.08 4.8 0 5.88 0 7.2V19.2C0 20.52 1.08 21.6 2.4 21.6H7.2V14.4L2.4 10.8V4.8Z"
        fill="#C5221F"
      />
      <path d="M21.6 4.8H16.8V10.8L21.6 14.4V4.8Z" fill="#B31412" />
      <path
        d="M16.8 14.4V21.6H21.6C22.92 21.6 24 20.52 24 19.2V7.2C24 5.88 22.92 4.8 21.6 4.8H16.8V14.4Z"
        fill="#EA4335"
      />
      <path
        d="M12 10.8L7.2 14.4V21.6H2.4C1.08 21.6 0 20.52 0 19.2V7.2C0 5.88 1.08 4.8 2.4 4.8H7.2V14.4L12 10.8Z"
        fill="#EA4335"
      />
      <path d="M2.4 4.8L12 12L21.6 4.8H2.4Z" fill="#EA4335" />
    </svg>
  ),
  Figma: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 20C6 22.2091 7.79086 24 10 24C12.2091 24 14 22.2091 14 20V14H10C7.79086 14 6 15.7909 6 20Z"
        fill="#0ACF83"
      />
      <path
        d="M6 10C6 7.79086 7.79086 6 10 6H14V14H10C7.79086 14 6 12.2091 6 10Z"
        fill="#A259FF"
      />
      <path
        d="M6 4C6 1.79086 7.79086 0 10 0H14C16.2091 0 18 1.79086 18 4C18 6.20914 16.2091 8 14 8H10C7.79086 8 6 6.20914 6 4Z"
        fill="#F24E1E"
      />
      <path
        d="M14 0H18C20.2091 0 22 1.79086 22 4C22 6.20914 20.2091 8 18 8H14V0Z"
        fill="#FF7262"
      />
      <path
        d="M14 14H18C20.2091 14 22 12.2091 22 10C22 7.79086 20.2091 6 18 6H14V14Z"
        fill="#1ABCFE"
      />
    </svg>
  ),
  Slack: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.04 15.12C2.26 15.12 0 17.38 0 20.16C0 22.94 2.26 25.2 5.04 25.2C7.82 25.2 10.08 22.94 10.08 20.16V15.12H5.04Z"
        fill="#E01E5A"
        transform="translate(0 -1.2)"
      />
      <path
        d="M11.76 15.12C11.76 17.9 14.02 20.16 16.8 20.16H21.84V15.12C21.84 12.34 19.58 10.08 16.8 10.08C14.02 10.08 11.76 12.34 11.76 15.12Z"
        fill="#36C5F0"
        transform="translate(0 -1.2)"
      />
      <path
        d="M18.96 10.08C21.74 10.08 24 7.82 24 5.04C24 2.26 21.74 0 18.96 0C16.18 0 13.92 2.26 13.92 5.04V10.08H18.96Z"
        fill="#2EB67D"
        transform="translate(0 -1.2)"
      />
      <path
        d="M12.24 10.08C12.24 7.3 9.98 5.04 7.2 5.04H2.16V10.08C2.16 12.86 4.42 15.12 7.2 15.12C9.98 15.12 12.24 12.86 12.24 10.08Z"
        fill="#ECB22E"
        transform="translate(0 -1.2)"
      />
    </svg>
  ),
  OpenAI: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M22.2819 9.82116C22.1842 8.95663 21.9055 8.12108 21.4673 7.37871C21.0292 6.63635 20.4431 6.00693 19.7538 5.53857C19.0645 5.07022 18.2902 4.77531 17.4897 4.67664C16.6892 4.57797 15.8837 4.67822 15.1345 4.96971C14.8697 3.59765 14.1205 2.36665 13.0039 1.46975C11.8872 0.572856 10.4665 0.0610352 9.01168 0.0150352C7.55685 -0.0309648 6.15112 0.391535 4.98662 1.21665C3.82212 2.04177 2.96602 3.22239 2.55422 4.57144C1.69812 4.66911 0.88422 4.94781 0.14185 5.38591C0.14185 5.38591 0.14185 5.38591 0.14185 5.38591C-0.45077 5.82401 -0.93992 6.41011 -1.40827 7.09944C-1.87662 7.78877 -2.17153 8.56306 -2.2702 9.36356C-2.36887 10.1641 -2.26862 10.9696 -1.97713 11.7188C-1.71233 13.0909 -0.96313 14.3219 0.15347 15.2188C1.27007 16.1157 2.69077 16.6275 4.1456 16.6735C5.60043 16.7195 7.00616 16.297 8.17066 15.4719C9.02676 15.3742 9.84066 15.0955 10.583 14.6574C11.176 15.2504 11.915 15.6985 12.730 15.9603C13.545 16.2221 14.410 16.2894 15.245 16.1557C16.080 16.022 16.855 15.6917 17.500 15.1952C18.145 14.6987 18.639 14.0537 18.939 13.3188C19.7951 13.2211 20.609 12.9424 21.3514 12.5043C22.0938 12.0662 22.7232 11.4772 23.1915 10.7879C23.6599 10.0986 23.9548 9.32431 24.0535 8.52381C24.1522 7.72331 24.0519 6.91781 23.7604 6.16861L22.2819 9.82116Z"
        fill="currentColor"
      />
    </svg>
  ),
  GoogleDrive: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.01 19.98L2.46 10.38L8.64 0H14.19L8.01 10.74L8.01 19.98Z"
        fill="#0066DA"
      />
      <path d="M15.42 19.98L21 10.38H9.9L4.32 19.98H15.42Z" fill="#00AC47" />
      <path d="M21 10.38L15.42 0H8.64L14.22 9.66L21 10.38Z" fill="#EA4335" />
      <path d="M8.01 10.74L14.19 0H21L15.42 10.38L8.01 10.74Z" fill="#FFBA00" />
    </svg>
  ),
};

/**
 * ConnectedAppsPage Component
 * A premium dashboard for managing third-party integrations and app connections.
 */
export default function ConnectedAppsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const yourIntegrations = [
    {
      id: 1,
      name: "Loom",
      url: "https://loom.com",
      description:
        "Connect SquadCart with Loom to automatically capture, transcribe, and organize video messages.",
      icon: <BrandIcons.Loom className="w-6 h-6" />,
      status: true,
    },
    {
      id: 2,
      name: "Dropbox",
      url: "https://dropbox.com",
      description:
        "Connect SquadCart with Dropbox to capture, transcribe, and organize video insights automatically",
      icon: <BrandIcons.Dropbox className="w-6 h-6" />,
      status: false,
    },
    {
      id: 3,
      name: "Zapier",
      url: "https://zapier.com",
      description:
        "Connect SquadCart with Zapier to automate workflows between SquadCart and thousands of apps, enabling seamless data",
      icon: <BrandIcons.Zapier className="w-6 h-6" />,
      status: true,
    },
    {
      id: 4,
      name: "Github",
      url: "https://github.com",
      description:
        "Connect SquadCart with Github to track repositories, pull requests, and commits, allowing SquadCart to",
      icon: (
        <BrandIcons.Github className="w-6 h-6 text-gray-900 dark:text-white" />
      ),
      status: true,
    },
    {
      id: 5,
      name: "Jira",
      url: "https://jira.atlassian.com",
      description:
        "Connect SquadCart with Jira to sync issues, tickets, and project updates, giving SquadCart full context to analyze progress",
      icon: <BrandIcons.Jira className="w-6 h-6" />,
      status: false,
    },
    {
      id: 6,
      name: "Confluence",
      url: "https://confluence.atlassian.com",
      description:
        "Connect SquadCart with Confluence to centralize documentation, sync knowledge, and enhance",
      icon: <BrandIcons.Confluence className="w-6 h-6" />,
      status: false,
    },
  ];

  const recommendedApps = [
    {
      id: 7,
      name: "Gitlab",
      url: "https://gitlab.com",
      description:
        "Integrate SquadCart with GitLab to seamlessly sync your repositories and manage issues more effectively.",
      icon: <BrandIcons.Gitlab className="w-5 h-5" />,
      rating: 5.0,
      connectedCount: "100K+",
    },
    {
      id: 8,
      name: "Notion",
      url: "https://notion.com",
      description:
        "Integrate SquadCart with Notion to effectively centralize all your notes and tasks in one convenient location.",
      icon: (
        <BrandIcons.Notion className="w-5 h-5 text-gray-900 dark:text-white" />
      ),
      rating: 5.0,
      connectedCount: "1M+",
    },
    {
      id: 9,
      name: "Gmail",
      url: "https://gmail.com",
      description:
        "Integrate SquadCart with your Gmail account to seamlessly extract valuable insights and actionable items.",
      icon: <BrandIcons.Gmail className="w-5 h-5" />,
      rating: 4.9,
      connectedCount: "1M+",
    },
  ];

  return (
    <div className="p-6 lg:p-10 bg-gray-50 dark:bg-[#0b0f14] min-h-screen font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Zap className="w-6 h-6" />
          </div>
          Connected Apps
        </h1>

        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search integration"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-full border-none bg-white dark:bg-[#1a1f26] shadow-sm text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
          />
        </div>
      </div>

      {/* --- BANNER --- */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-700 dark:to-violet-800 rounded-[24px] p-6 lg:p-8 mb-10 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Supercharge Your Workflow
            </h2>
            <p className="text-indigo-100 dark:text-indigo-200 max-w-2xl">
              Combine your favorite tools into ready-to-use workflows and
              automate repetitive tasks effortlessly.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl backdrop-blur-sm"
            >
              Create your own
            </Button>
            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold">
              Browse bundling
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {/* Card 1 */}
          <div className="bg-white rounded-xl p-5 text-gray-900 shadow-md flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <BrandIcons.GoogleDrive className="w-5 h-5" />
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm">
                  <BrandIcons.Github className="w-4 h-4 text-black" />
                </div>
                <div className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm">
                  <BrandIcons.Gitlab className="w-4 h-4" />
                </div>
                <div className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm">
                  <BrandIcons.Jira className="w-4 h-4" />
                </div>
              </div>
            </div>
            <h3 className="font-bold text-sm mb-1">Developer Workflow Pack</h3>
            <p className="text-xs text-gray-500 mb-4 flex-1">
              Simplify development from code to collaboration.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-lg text-xs font-semibold h-8 hover:bg-gray-50"
            >
              View bundling
            </Button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-5 text-gray-900 shadow-md flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <BrandIcons.Figma className="w-5 h-5" />
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm text-[10px] text-pink-500 font-bold">
                  Sk
                </div>
                <div className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm">
                  <BrandIcons.OpenAI className="w-4 h-4 text-black" />
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 shadow-sm">
                  +3
                </div>
              </div>
            </div>
            <h3 className="font-bold text-sm mb-1">
              Designer Productivity Pack
            </h3>
            <p className="text-xs text-gray-500 mb-4 flex-1">
              Transform your ideas into polished results with AI.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-lg text-xs font-semibold h-8 hover:bg-gray-50"
            >
              View bundling
            </Button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-5 text-gray-900 shadow-md flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-900">
                <BrandIcons.Notion className="w-5 h-5" />
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm">
                  <BrandIcons.Loom className="w-4 h-4" />
                </div>
                <div className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm">
                  <BrandIcons.OpenAI className="w-4 h-4 text-black" />
                </div>
                <div className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm">
                  <BrandIcons.Slack className="w-4 h-4" />
                </div>
              </div>
            </div>
            <h3 className="font-bold text-sm mb-1">
              Support Automation Suite Pack
            </h3>
            <p className="text-xs text-gray-500 mb-4 flex-1">
              Automate support replies to keep chats flowing.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-lg text-xs font-semibold h-8 hover:bg-gray-50"
            >
              View bundling
            </Button>
          </div>
        </div>
      </div>

      {/* --- YOUR INTEGRATIONS --- */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Your Integrations
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View, connect, and manage your integrations with SquadCart.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yourIntegrations.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-[#1a1f26] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {app.name}
                    </h3>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 flex items-center gap-1 hover:text-indigo-500 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />{" "}
                      {app.url.replace("https://", "")}
                    </a>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed min-h-[60px]">
                {app.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                <div className="flex gap-4 text-xs font-semibold">
                  <button className="text-gray-900 dark:text-white hover:text-indigo-500 transition-colors">
                    Integration Detail
                  </button>
                  <button className="text-red-500 hover:text-red-600 transition-colors">
                    Remove
                  </button>
                </div>
                <Switch
                  checked={app.status}
                  className="data-[state=checked]:bg-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RECOMMENDED TO ADD --- */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recommended to add
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover popular integrations that are trusted by countless users
              to significantly.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedApps.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-[#1a1f26] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {app.name}
                    </h3>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 flex items-center gap-1 hover:text-indigo-500 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />{" "}
                      {app.url.replace("https://", "")}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{" "}
                  {app.rating}
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed min-h-[40px]">
                {app.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs font-semibold gap-1.5 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-800"
                >
                  <Plus className="w-3 h-3" /> Add Integration
                </Button>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase">
                  <div className="flex -space-x-1.5 mr-1">
                    <div className="w-4 h-4 rounded-full bg-gray-200 border border-white dark:border-gray-800"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300 border border-white dark:border-gray-800"></div>
                  </div>
                  {app.connectedCount} connected
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
