import './App.css'
import Home from '@pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from '@pages/About'
import Blogs from '@pages/Blogs/Blogs'
import DefaultLayout from './layouts/DefaultLayout'
import BlogCreate from '@pages/Blogs/BlogsCreate'
import Faq from '@pages/FAQ/Faq'
import Press from '@pages/CMSManagement/PressRoom/Press'
import LoginPage from '@pages/Auth/LoginPage'
import ProtectedRoute from './components/ProtectedRoute';
import PermissionGuard from './components/PermissionGuard';
import Testimonials from '@pages/CMSManagement/Testimonials/Testimonial';
import SigninUser from "@pages/LeadManagement/SignInUserApp/SigninUser"
import Leads from "@pages/LeadManagement/Leads/Leads"
import ArchiveUsers from "@pages/LeadManagement/ArchiveUsers/ArchiveUsers"
import OnBoardLender from "@pages/LenderManagement/OnBoardLender/OnBoardLender"
import ListOfLender from "@pages/LenderManagement/ListOfLenders/ListOfLenders"
import SocialIcons from "@pages/CMSManagement/Social/SocialIcons"
import Offers from "@pages/CMSManagement/Offers/Offers"
import Banner from "@pages/CMSManagement/Banners/Banner"
import TermsAndConditions from '@pages/CMSManagement/T&C/TermsAndConditions';
import NotFound from '@pages/NotFound';
import PrivacyPolicy from '@pages/CMSManagement/Privacy/PrivacyPolicy';
import Roles from "@pages/AdminManagement/Roles/Roles"
import Users from '@pages/AdminManagement/Users/Users';
import RoleList from '@pages/AdminManagement/Roles/RoleList';
import RoleCreate from '@pages/AdminManagement/Roles/RoleCreate';
import RoleEdit from '@pages/AdminManagement/Roles/RoleEdit';
import AdminUserList from '@pages/AdminManagement/Users/AdminUserList';
import AdminUserForm from '@pages/AdminManagement/Users/AdminUserForm';

import LeadDetail from '@pages/LeadManagement/Leads/LeadDetail';
import PushNotificationList from './pages/PushNotification/PushNotificationsList';
import PushNotificationCreate from './pages/PushNotification/PushNotificationCreate';
import GroupList from './pages/PushNotification/GroupsList';
import GroupCreate from './pages/PushNotification/GroupCreate';
import Contact from './pages/LeadManagement/Contact/Contact';
import UTMGenerator from './pages/UTM/UtmLinkGenerate';
import AllLeads from './pages/LeadManagement/AllLeads/AllLeads';
import PartnersLeads from './pages/LeadManagement/PartnersLead/PartnersLead';
import PartnerDetail from './pages/LeadManagement/PartnersLead/PartnerDetail';
import GetKycStageStatistics from './pages/AppStatstics/KycStageDashboard';
import MFAllUsers from './pages/MutalFund/MFAllUsers';
import MFAllLoans from './pages/MutalFund/MFAllLoans';
import MFLoansSummary from './pages/MutalFund/MFLoansSummary';
import LoanDetail from './pages/MutalFund/LoanDetail';
import AllUserDetail from './pages/MutalFund/AllUserDetail';
import UploadAppMatrix from './pages/AppMatrix/UploadAppMetrics'
import AppMetricsDisplay from './pages/AppMatrix/AppMetrics';
import RawMisZypeUpload from './pages/MIS/RawMisZypeUpload';
import RawMisZypeData from './pages/MIS/RawMisZypeData';
import InternalMFData from './pages/InternalMF/InternalMFData'
import InternalMFDetail from './pages/InternalMF/InternalMFDetail';
import AnalyticsDashboard from './pages/AnalyticsDashboard/AnalyticsDashboard';
import ExecutiveDashboard from './pages/DashboardPro/ExecutiveDashboard';
import LenderManagementPro from './pages/DashboardPro/LenderManagementPro';
import AppStatisticsPro from './pages/DashboardPro/AppStatisticsPro';
import MutualFundsDashboard from './pages/DashboardPro/MutualFundsDashboard';
import InternalMFDashboard from './pages/DashboardPro/InternalMFDashboard';
import ActiveUsersDashboard from './pages/ActiveUsers/ActiveUsersDashboard';
import ActiveUsersList from './pages/ActiveUsers/ActiveUsersList';
import ActiveUserDetail from './pages/ActiveUsers/ActiveUserDetail';
import LiveUsersPage from './pages/ActiveUsers/LiveUsersPage';
import FunnelAnalyticsPage from './pages/ActiveUsers/FunnelAnalyticsPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />

            {/* Active Users */}
            <Route path="active-users-dashboard" element={<PermissionGuard permission="active_users.view"><ActiveUsersDashboard /></PermissionGuard>} />
            <Route path="active-users-list" element={<PermissionGuard permission="active_users.view"><ActiveUsersList /></PermissionGuard>} />
            <Route path="active-user/:id" element={<PermissionGuard permission="active_users.view"><ActiveUserDetail /></PermissionGuard>} />
            <Route path="live-users" element={<PermissionGuard permission="active_users.view"><LiveUsersPage /></PermissionGuard>} />
            <Route path="funnel-analytics" element={<PermissionGuard permission="active_users.view"><FunnelAnalyticsPage /></PermissionGuard>} />

            {/* Executive Dashboards */}
            <Route path="executive-dashboard" element={<PermissionGuard permission="executive_dashboard.view"><ExecutiveDashboard /></PermissionGuard>} />
            <Route path="lender-management-pro" element={<PermissionGuard permission="executive_dashboard.view"><LenderManagementPro /></PermissionGuard>} />
            <Route path="app-statistics-pro" element={<PermissionGuard permission="executive_dashboard.view"><AppStatisticsPro /></PermissionGuard>} />
            <Route path="mutual-funds-dashboard" element={<PermissionGuard permission="executive_dashboard.view"><MutualFundsDashboard /></PermissionGuard>} />
            <Route path="internal-mf-dashboard" element={<PermissionGuard permission="executive_dashboard.view"><InternalMFDashboard /></PermissionGuard>} />

            {/* Lead Management */}
            <Route path="signin-user" element={<PermissionGuard permission="lead_management.view"><SigninUser /></PermissionGuard>} />
            <Route path="leads" element={<PermissionGuard permission="lead_management.view"><Leads /></PermissionGuard>} />
            <Route path="lead-detail/:id" element={<PermissionGuard permission="lead_management.view"><LeadDetail /></PermissionGuard>} />
            <Route path="all-leads" element={<PermissionGuard permission="lead_management.view"><AllLeads /></PermissionGuard>} />
            <Route path="partner-leads" element={<PermissionGuard permission="lead_management.view"><PartnersLeads /></PermissionGuard>} />
            <Route path="partner-detail/:id" element={<PermissionGuard permission="lead_management.view"><PartnerDetail /></PermissionGuard>} />
            <Route path="archive-users" element={<PermissionGuard permission="lead_management.delete"><ArchiveUsers /></PermissionGuard>} />
            <Route path="contact" element={<PermissionGuard permission="lead_management.view"><Contact /></PermissionGuard>} />

            {/* App Statistics */}
            <Route path="app-metrics" element={<PermissionGuard permission="app_statistics.view"><AppMetricsDisplay /></PermissionGuard>} />
            <Route path="upload-app-metrics" element={<PermissionGuard permission="app_statistics.create"><UploadAppMatrix /></PermissionGuard>} />
            <Route path="kyc-statistics" element={<PermissionGuard permission="app_statistics.view"><GetKycStageStatistics /></PermissionGuard>} />

            {/* Analytics */}
            <Route path="analytics-dashboard" element={<PermissionGuard permission="analytics.view"><AnalyticsDashboard /></PermissionGuard>} />

            {/* Internal Mutual Funds */}
            <Route path="internal-mf" element={<PermissionGuard permission="internal_mutual_funds.view"><InternalMFData /></PermissionGuard>} />
            <Route path="internal-MF-Detail/:id" element={<PermissionGuard permission="internal_mutual_funds.view"><InternalMFDetail /></PermissionGuard>} />

            {/* Mutual Funds */}
            <Route path="fetch-all-mf-users" element={<PermissionGuard permission="mutual_funds.view"><MFAllUsers /></PermissionGuard>} />
            <Route path="fetch-all-mf-loans" element={<PermissionGuard permission="mutual_funds.view"><MFAllLoans /></PermissionGuard>} />
            <Route path="fetch-mf-loans-summary" element={<PermissionGuard permission="mutual_funds.view"><MFLoansSummary /></PermissionGuard>} />
            <Route path="fetch-mf-loans/:id" element={<PermissionGuard permission="mutual_funds.view"><LoanDetail /></PermissionGuard>} />
            <Route path="fetch-all-mf-users/:id" element={<PermissionGuard permission="mutual_funds.view"><AllUserDetail /></PermissionGuard>} />

            {/* Lender Management */}
            <Route path="list-of-lenders" element={<PermissionGuard permission="lender_management.view"><ListOfLender /></PermissionGuard>} />
            <Route path="on-borde-lender-from" element={<PermissionGuard permission="lender_management.create"><OnBoardLender /></PermissionGuard>} />
            <Route path="on-borde-lender-from/:id" element={<PermissionGuard permission="lender_management.edit"><OnBoardLender /></PermissionGuard>} />

            {/* Blogs */}
            <Route path="blogs" element={<PermissionGuard permission="blogs.view"><Blogs /></PermissionGuard>} />
            <Route path="blog/create" element={<PermissionGuard permission="blogs.create"><BlogCreate /></PermissionGuard>} />
            <Route path="blog/:id" element={<PermissionGuard permission="blogs.edit"><BlogCreate /></PermissionGuard>} />

            {/* Push Notification */}
            <Route path="push-notification" element={<PermissionGuard permission="push_notification.view"><PushNotificationList /></PermissionGuard>} />
            <Route path="push-notification/create" element={<PermissionGuard permission="push_notification.create"><PushNotificationCreate /></PermissionGuard>} />
            <Route path="push-notification/:id" element={<PermissionGuard permission="push_notification.edit"><PushNotificationCreate /></PermissionGuard>} />
            <Route path="group" element={<PermissionGuard permission="push_notification.view"><GroupList /></PermissionGuard>} />
            <Route path="group/create" element={<PermissionGuard permission="push_notification.create"><GroupCreate /></PermissionGuard>} />

            {/* UTM */}
            <Route path="utm-generate" element={<PermissionGuard permission="utm.view"><UTMGenerator /></PermissionGuard>} />

            {/* FAQ */}
            <Route path="faq" element={<PermissionGuard permission="faq.view"><Faq /></PermissionGuard>} />

            {/* MIS Raw */}
            <Route path="mis-zype-upload" element={<PermissionGuard permission="mis_raw.create"><RawMisZypeUpload /></PermissionGuard>} />
            <Route path="mis-zype-data" element={<PermissionGuard permission="mis_raw.view"><RawMisZypeData /></PermissionGuard>} />

            {/* CMS Management */}
            <Route path="press" element={<PermissionGuard permission="cms_management.view"><Press /></PermissionGuard>} />
            <Route path="testimonials" element={<PermissionGuard permission="cms_management.view"><Testimonials /></PermissionGuard>} />
            <Route path="banners" element={<PermissionGuard permission="cms_management.view"><Banner /></PermissionGuard>} />
            <Route path="terms-conditions" element={<PermissionGuard permission="cms_management.edit"><TermsAndConditions /></PermissionGuard>} />
            <Route path="privacy-policy" element={<PermissionGuard permission="cms_management.view"><PrivacyPolicy /></PermissionGuard>} />
            <Route path="social-icons" element={<PermissionGuard permission="cms_management.view"><SocialIcons /></PermissionGuard>} />
            <Route path="offer" element={<PermissionGuard permission="cms_management.view"><Offers /></PermissionGuard>} />

            {/* Admin Management */}
            <Route path="roles" element={<PermissionGuard permission="admin_management.view"><Roles /></PermissionGuard>} />
            <Route path="users" element={<PermissionGuard permission="admin_management.view"><Users /></PermissionGuard>} />
            <Route path="admin/roles" element={<PermissionGuard permission="admin_management.view"><RoleList /></PermissionGuard>} />
            <Route path="admin/roles/create" element={<PermissionGuard permission="admin_management.create"><RoleCreate /></PermissionGuard>} />
            <Route path="admin/roles/:id" element={<PermissionGuard permission="admin_management.edit"><RoleEdit /></PermissionGuard>} />
            <Route path="admin/roles/:id/edit" element={<PermissionGuard permission="admin_management.edit"><RoleEdit /></PermissionGuard>} />
            <Route path="admin/users" element={<PermissionGuard permission="admin_management.view"><AdminUserList /></PermissionGuard>} />
            <Route path="admin/users/create" element={<PermissionGuard permission="admin_management.create"><AdminUserForm /></PermissionGuard>} />
            <Route path="admin/users/:id/edit" element={<PermissionGuard permission="admin_management.edit"><AdminUserForm /></PermissionGuard>} />

            <Route path="*" element={<NotFound />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
