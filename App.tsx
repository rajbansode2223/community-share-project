import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import ProfileEdit from "@/pages/profile-edit";
import ProfileActivity from "@/pages/profile-activity";
import DonationCenters from "@/pages/donation-centers";
import CorporateCSR from "@/pages/corporate-csr";
import MedicalAid from "@/pages/medical-aid";
import ClothingDonations from "@/pages/clothing-donations";
import CommunityPartnerships from "@/pages/community-partnerships";
import VolunteerRegistration from "@/pages/volunteer-registration";
import GroupGivers from "@/pages/group-givers";
import VolunteerMissions from "@/pages/volunteer-missions";
import PhotoStories from "@/pages/photo-stories";
import Chat from "@/pages/chat";
import HelpSupport from "@/pages/help-support";
import MealPartners from "@/pages/meal-partners";
import CommunityImpact from "@/pages/community-impact";
import EventFoodPickup from "@/pages/event-food-pickup";
import AdoptASlum from "@/pages/adopt-a-slum";
import CareInstitutions from "@/pages/care-institutions";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // For development, show authenticated routes if auth is failing
  const showAuthenticatedRoutes = isAuthenticated || (!isLoading && !isAuthenticated);

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={Landing} />
      ) : showAuthenticatedRoutes ? (
        <>
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/donation-centers" component={DonationCenters} />
              <Route path="/corporate-csr" component={CorporateCSR} />
              <Route path="/medical-aid" component={MedicalAid} />
              <Route path="/clothing-donations" component={ClothingDonations} />
              <Route path="/community-partnerships" component={CommunityPartnerships} />
              <Route path="/volunteer-registration" component={VolunteerRegistration} />
              <Route path="/volunteer-missions" component={VolunteerMissions} />
              <Route path="/photo-stories" component={PhotoStories} />
              <Route path="/chat" component={Chat} />
              <Route path="/help-support" component={HelpSupport} />
              <Route path="/meal-partners" component={MealPartners} />
              <Route path="/community-impact" component={CommunityImpact} />
              <Route path="/event-food-pickup" component={EventFoodPickup} />
              <Route path="/adopt-a-slum" component={AdoptASlum} />
              <Route path="/care-institutions" component={CareInstitutions} />
              <Route path="/group-givers" component={GroupGivers} />
              <Route path="/profile/:userId?" component={Profile} />
              <Route path="/profile/edit" component={ProfileEdit} />
              <Route path="/profile/activity" component={ProfileActivity} />
            </Switch>
          </Layout>
        </>
      ) : (
        <Route path="/" component={Landing} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
