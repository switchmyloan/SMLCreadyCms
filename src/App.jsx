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

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route index element={<Home />} />   {/* path="/" */}
            <Route path="about" element={<About />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blog/create" element={<BlogCreate />} />
            <Route path="blog/:id" element={<BlogCreate />} />
            <Route path="faq" element={<Faq />} />
            <Route path="press" element={<Press />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="signin-user" element={<SigninUser />} />
            <Route path="leads" element={<Leads />} />
            <Route path="lead-detail/:id" element={<LeadDetail />} />
            <Route path="archive-users" element={<ArchiveUsers />} />
            <Route path="on-borde-lender-from" element={<OnBoardLender />} />
            <Route path="on-borde-lender-from/:id" element={<OnBoardLender />} />
            <Route path="list-of-lenders" element={<ListOfLender />} />
            <Route path="social-icons" element={<SocialIcons />} />
            <Route path="offer" element={<Offers />} />
            <Route path="banners" element={<Banner />} />
            <Route path="terms-conditions" element={<TermsAndConditions />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="roles" element={<Roles />} />
            <Route path="users" element={<Users />} />
            <Route path="push-notification" element={<PushNotificationList/>} />
            <Route path="push-notification/create" element={<PushNotificationCreate/>} />
            <Route path="push-notification/:id" element={<PushNotificationCreate/>} />
            <Route path="group" element={<GroupList/>}/>
            <Route path="group/create" element={<GroupCreate/>}/>
            <Route path="contact" element={<Contact />}/>
            <Route path="utm-generate" element={<UTMGenerator />}/>
            <Route path="all-leads" element={<AllLeads />}/>
            <Route path="partner-leads" element={<PartnersLeads />}/>
            <Route path="partner-detail/:id" element={<PartnerDetail />} />
            <Route path="kyc-statistics" element={<GetKycStageStatistics />} />
            <Route path="fetch-all-mf-users" element={<MFAllUsers />} />
            <Route path="fetch-all-mf-loans" element={<MFAllLoans />} />
            <Route path="fetch-mf-loans-summary" element={<MFLoansSummary />} />
            <Route path="fetch-mf-loans/:id" element={<LoanDetail />} />
            <Route path="fetch-all-mf-users/:id" element={<AllUserDetail />} />
            <Route path="upload-app-metrics" element={<UploadAppMatrix />} />
            <Route path="app-metrics" element={<AppMetricsDisplay />} />
            <Route path="mis-zype-upload" element={<RawMisZypeUpload />} />
            <Route path="mis-zype-data" element={<RawMisZypeData />} />
            <Route path="internal-mf" element={<InternalMFData />} />
            <Route path="internal-MF-Detail/:id" element={<InternalMFDetail />} />
            <Route path="analytics-dashboard" element={<AnalyticsDashboard />} />
            <Route path="executive-dashboard" element={<ExecutiveDashboard />} />
            <Route path="lender-management-pro" element={<LenderManagementPro />} />
            <Route path="app-statistics-pro" element={<AppStatisticsPro />} />
            <Route path="mutual-funds-dashboard" element={<MutualFundsDashboard />} />
            <Route path="internal-mf-dashboard" element={<InternalMFDashboard />} />
            <Route path="active-users-dashboard" element={<ActiveUsersDashboard />} />
            <Route path="active-users-list" element={<ActiveUsersList />} />
          <Route path="*" element={<NotFound />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
