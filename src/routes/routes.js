export const routes = [
  {
    path: "/",
    label: "Dashboard",
    icon: "Home",
    showInSidebar: false,
    order: 5
  },
  {
    path: "/blogs",
    label: "Blogs",
    icon: "FileText",
    showInSidebar: true,
    order: 2
  },
  {
    path: "/faq",
    label: "FAQ",
    icon: "HelpCircle",
    showInSidebar: true,
    order: 3
  },
  {
    path: "/users",
    label: "Users",
    icon: "Users",
    showInSidebar: true,
    group: "Admin Management",
    order: 4
  },
  {
    path: "/roles",
    label: "Roles",
    icon: "Users",
    showInSidebar: true,
    group: "Admin Management",
    order: 1
  },
  {
    path: "/press",
    label: "Press Room",
    icon: "Newspaper",
    showInSidebar: true,
    group: "CMS",
    order: 6
  },
  {
    path: "/testimonials",
    label: "Testimonials",
    icon: "MessageSquare",
    showInSidebar: true,
    group: "CMS",
    order: 7
  },
];
