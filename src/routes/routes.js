export const routes = [
  // --- Non-grouped ---
  {
    path: "/",
    label: "Dashboard",
    icon: "Home",
    showInSidebar: false,
    order: 0,
    roles: ["admin", "super-admin"],
  },

  // --- Lead Management ---
  {
    path: "/signin-user",
    label: "Signin user (in app)",
    icon: "UserCheck", // ✅ login-related
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1,
    order: 1,
    roles: ["admin"]
  },
  {
    path: "/leads",
    label: "Leads",
    icon: "ClipboardList", // ✅ leads list
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1,
    order: 2,
    roles: ["admin", "super-admin"],
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
    icon: "ContactUs", // ✅ archived users
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1,
    order: 4,
    roles: ["super-admin"],
  },

  // --- Lender Management ---
  {
    path: "/on-borde-lender-from",
    label: "Onboard Lender",
    icon: "UserPlus", // ✅ add new lender
    showInSidebar: true,
    group: "Lender Management",
    groupOrder: 2,
    order: 2,
    roles: ["super-admin"],
  },
  {
    path: "/list-of-lenders",
    label: "List of Lenders",
    icon: "Building2", // ✅ lenders
    showInSidebar: true,
    group: "Lender Management",
    groupOrder: 2,
    order: 1,
    roles: ["super-admin"],
  },

  // --- Blogs ---
  {
    path: "/blogs",
    label: "Blogs View",
    icon: "FileText", // ✅ blog/articles
    showInSidebar: true,
    order: 1,
    group: "Blogs",
    groupOrder: 3,
    roles: ["super-admin"],
  },
  {
    path: "/blog/create",
    label: "Blog Create",
    icon: "BookOpen", // ✅ writing blogs
    showInSidebar: true,
    order: 2,
    group: "Blogs",
    groupOrder: 3,
    roles: ["super-admin"],
  },

  // --- FAQ ---
  {
    path: "/faq",
    label: "FAQ View",
    icon: "HelpCircle",
    showInSidebar: true,
    order: 1,
    group: "FAQ",
    groupOrder: 4,
    roles: ["super-admin"],
  },

  // --- CMS Management ---
  {
    path: "/press",
    label: "Press Room",
    icon: "Newspaper",
    showInSidebar: true,
    group: "CMS Management",
    groupOrder: 5,
    order: 1,
    roles: ["super-admin"],
  },
  {
    path: "/testimonials",
    label: "Testimonials",
    icon: "MessageSquare",
    showInSidebar: true,
    group: "CMS Management",
    groupOrder: 5,
    order: 2,
    roles: ["super-admin"],
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
    groupOrder: 5,
    order: 5,
    roles: ["super-admin"],
  },
  {
    path: "/terms-conditions",
    label: "Pages",
    icon: "ShieldCheck", // ✅ policies/security
    showInSidebar: true,
    group: "CMS Management",
    groupOrder: 5,
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

  // --- Admin Management ---
  {
    path: "/users",
    label: "Users",
    icon: "Users",
    showInSidebar: true,
    group: "Admin Management",
    groupOrder: 7,
    order: 2,
    roles: ["super-admin"],
  },
  {
    path: "/roles",
    label: "Roles",
    icon: "ShieldCheck", // ✅ roles/permissions
    showInSidebar: true,
    group: "Admin Management",
    groupOrder: 7,
    order: 1,
    roles: ["super-admin"],
  },
  {
    path: "/push-notification",
    label: "Push Notification",
    icon: "ShieldCheck", // ✅ roles/permissions
    showInSidebar: true,
    group: "Push Notification",
    groupOrder: 6,
    order: 2,
    roles: ["admin", "super-admin"],
  },
  {
    path: "/group",
    label: "Groups",
    icon: "ShieldCheck", // ✅ roles/permissions
    showInSidebar: true,
    group: "Push Notification",
    groupOrder: 6,
    order: 1,
    roles: ["admin", "super-admin"],
  },
];
