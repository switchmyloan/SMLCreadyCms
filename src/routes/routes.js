export const routes = [
  // --- Non-grouped ---
  {
    path: "/",
    label: "Dashboard",
    icon: "Home",
    showInSidebar: false,
    order: 0,
    roles: ["admin", "super-admin","marketing","reporting-manager"],
  },

  // --- Lead Management ---
  {
    path: "/signin-user",
    label: "App Leads",
    icon: "LucideMonitor", // ✅ login-related
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1,
    order: 1,
    roles: ["admin", "super-admin","marketing","reporting-manager"]
  },
  {
    path: "/leads",
    label: "Web Leads",
    icon: "Users", // ✅ leads list
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1,
    order: 2,
    roles: ["admin", "super-admin","marketing","reporting-manager"],
  },
  {
    path: "/partner-leads",
    label: "UTM Leads",
    icon: "Users", // ✅ leads list
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1,
    order: 2,
    roles: ["admin", "super-admin","marketing","reporting-manager"],
  },
  {
    path: "/all-leads",
    label: "All Leads",
    icon: "Users2", // ✅ leads list
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1,
    order: 3,
    roles: ["admin", "super-admin","marketing","reporting-manager"],
  },
  {
    path: "/archive-users",
    label: "Archive users",
    icon: "UserMinus", // ✅ archived users
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1,
    order: 3,
    roles: ["super-admin"],
  },
  {
    path: "/contact",
    label: "Contact US",
    icon: "Phone", // ✅ archived users
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1,
    order: 4,
    roles: ["admin","super-admin","marketing","reporting-manager"],
  },
  {
    path: "/upload-app-metrics",
    label: "Upload File",
    icon: "Upload",
    showInSidebar: true,
    group: "App Statistics",
    groupOrder: 1,
    order: 2,
    roles: ["admin","super-admin","marketing"],
  },
  {
    path: "/app-metrics",
    label: "App Metrics",
    icon: "Camera",
    showInSidebar: true,
    group: "App Statistics",
    groupOrder: 1,
    order: 1,
    roles: ["admin","super-admin","marketing","reporting-manager"],
  },

  // --- Lender Management ---
  {
    path: "/on-borde-lender-from",
    label: "Onboard Lender",
    icon: "UserPlus", // ✅ add new lender
    showInSidebar: true,
    group: "Lender Management",
    groupOrder: 5,
    order: 2,
    roles: ["admin","super-admin"],
  },
  {
    path: "/list-of-lenders",
    label: "List of Lenders",
    icon: "Building2", // ✅ lenders
    showInSidebar: true,
    group: "Lender Management",
    groupOrder: 5,
    order: 1,
    roles: ["admin","super-admin","reporting-manager"],
  },

  // --- Blogs ---
  {
    path: "/blogs",
    label: "Blogs View",
    icon: "FileText", // ✅ blog/articles
    showInSidebar: true,
    order: 1,
    group: "Blogs",
    groupOrder: 6,
    roles: ["admin","super-admin","marketing"],
  },
  {
    path: "/blog/create",
    label: "Blog Create",
    icon: "BookOpen", // ✅ writing blogs
    showInSidebar: true,
    order: 2,
    group: "Blogs",
    groupOrder: 6,
    roles: ["admin","super-admin","marketing"],
  },

  // --- FAQ ---
  {
    path: "/faq",
    label: "FAQ View",
    icon: "HelpCircle",
    showInSidebar: true,
    order: 1,
    group: "FAQ",
    groupOrder: 7,
    roles: ["admin","super-admin","marketing"],
  },

  // --- CMS Management ---
  {
    path: "/press",
    label: "Press Room",
    icon: "Newspaper",
    showInSidebar: true,
    group: "CMS Management",
    groupOrder: 10,
    order: 1,
    roles: ["admin","super-admin","marketing"],
  },
  {
    path: "/testimonials",
    label: "Testimonials",
    icon: "MessageSquare",
    showInSidebar: true,
    group: "CMS Management",
    groupOrder: 10,
    order: 2,
    roles: ["admin","super-admin"],
  },
  // {
  //   path: "/social-icons",
  //   label: "Social Icons",
  //   icon: "Settings", // ✅ generic icons/social
  //   showInSidebar: true,
  //   group: "CMS Management",
  //   groupOrder: 5,
  //   order: 3,
  // },
  // {
  //   path: "/offer",
  //   label: "Offers",
  //   icon: "ClipboardList", // ✅ offers list
  //   showInSidebar: true,
  //   group: "CMS Management",
  //   groupOrder: 5,
  //   order: 4,
  // },
  {
    path: "/banners",
    label: "Banners",
    icon: "FileText", // ✅ banners/files
    showInSidebar: true,
    group: "CMS Management",
    groupOrder: 10,
    order: 5,
    roles: ["super-admin","marketing"],
  },
  {
    path: "/terms-conditions",
    label: "Pages",
    icon: "ShieldCheck", // ✅ policies/security
    showInSidebar: true,
    group: "CMS Management",
    groupOrder: 10,
    order: 6,
    roles: ["super-admin"],
  },
  // {
  //   path: "/privacy-policy",
  //   label: "Privacy Policy",
  //   icon: "ShieldCheck", // ✅ security/privacy
  //   showInSidebar: true,
  //   group: "CMS Management",
  //   groupOrder: 5,
  //   order: 7,
  // },

 
  {
    path: "/push-notification",
    label: "Push Notification",
    icon: "ShieldCheck", 
    showInSidebar: true,
    group: "Push Notification",
    groupOrder: 6,
    order: 2,
    roles: ["super-admin","marketing"],
  },
  {
    path: "/group",
    label: "Groups",
    icon: "ShieldCheck", // ✅ roles/permissions
    showInSidebar: true,
    group: "Push Notification",
    groupOrder: 6,
    order: 1,
    roles: ["super-admin","marketing"],
  },
  {
    path: "/utm-generate",
    label: "UTM Generate",
    icon: "ShieldCheck", // ✅ roles/permissions
    showInSidebar: true,
    group: "UTM",
    groupOrder: 6,
    order: 1,
    roles: ["admin", "super-admin","marketing"],
  },
  {
    path: "/mis-zype-data",
    label: "MIS Data",
    icon: "ShieldCheck",
    showInSidebar: true,
    group: "MIS Raw",
    groupOrder: 7,
    order: 1,
    roles: ["admin", "super-admin","marketing","reporting-manager"],
  },
  {
    path: "/fetch-all-mf-users",
    label: "Fetch All Users",
    icon: "ShieldCheck", 
    showInSidebar: true,
    group: "Mutual Funds",
    groupOrder: 4,
    order: 2,
    roles: ["admin", "super-admin","reporting-manager"],
  },
  {
    path: "/fetch-all-mf-loans",
    label: "Fetch All Loans",
    icon: "ShieldCheck", 
    showInSidebar: true,
    group: "Mutual Funds",
    groupOrder: 4,
    order: 3,
    roles: ["admin", "super-admin","reporting-manager"],
  },
  {
    path: "/fetch-mf-loans-summary",
    label: "Fetch Loans Summary",
    icon: "ShieldCheck", 
    showInSidebar: true,
    group: "Mutual Funds",
    groupOrder: 4,
    order: 1,
    roles: ["admin", "super-admin","reporting-manager"],
  },
  {
    path: "/internal-MF-Detail",
    label: "Internal MF Detail",
    icon: "ShieldCheck", 
    showInSidebar: true,
    group: "Internal Mutual Funds",
    groupOrder: 3,
    order: 1,
    roles: ["admin", "super-admin","reporting-manager"],
  },
];
