import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home,
  Building2,
  Heart,
  Calendar,
  MapPin,
  Stethoscope,
  Building,
  Users,
  Camera,
  MessageCircle,
  HelpCircle,
  Utensils,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Shirt,
  Handshake,
  UserCheck,
  Target
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    title: "Browse",
    href: "/",
    icon: Home,
    description: "Discover food sharing opportunities"
  },
  {
    title: "Adopt Communities",
    href: "/adopt-a-slum",
    icon: Building2,
    description: "Support underserved communities"
  },
  {
    title: "Care Institutions",
    href: "/care-institutions",
    icon: Heart,
    description: "Connect with orphanages & elderly care"
  },
  {
    title: "Event Pickup",
    href: "/event-food-pickup",
    icon: Calendar,
    description: "Coordinate event food collection"
  },
  {
    title: "Donation Centers",
    href: "/donation-centers",
    icon: MapPin,
    description: "Find nearby donation points"
  },
  {
    title: "Medical Aid",
    href: "/medical-aid",
    icon: Stethoscope,
    description: "Healthcare support & supplies"
  },
  {
    title: "Corporate CSR",
    href: "/corporate-csr",
    icon: Building,
    description: "Business social responsibility"
  },
  {
    title: "Meal Partners",
    href: "/meal-partners",
    icon: Utensils,
    description: "Restaurant partnerships"
  },
  {
    title: "Community Impact",
    href: "/community-impact",
    icon: TrendingUp,
    description: "View impact statistics"
  },
  {
    title: "Photo Stories",
    href: "/photo-stories",
    icon: Camera,
    description: "Share inspiring moments"
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageCircle,
    description: "Connect with community"
  },
  {
    title: "Help & Support",
    href: "/help-support",
    icon: HelpCircle,
    description: "Get assistance"
  }
];

const mobileOnlyItems = [
  {
    title: "Clothing Donations",
    href: "/clothing-donations",
    icon: Shirt,
    description: "Donate and receive clothing"
  },
  {
    title: "Community Partnerships",
    href: "/community-partnerships",
    icon: Handshake,
    description: "Partner organizations"
  },
  {
    title: "Volunteer Registration",
    href: "/volunteer-registration",
    icon: UserCheck,
    description: "Join our volunteer network"
  },
  {
    title: "Volunteer Missions",
    href: "/volunteer-missions",
    icon: Target,
    description: "Active volunteer opportunities"
  },
  {
    title: "Group Givers",
    href: "/group-givers",
    icon: Users,
    description: "Collective giving initiatives"
  }
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  const allItems = [...navigationItems, ...mobileOnlyItems];

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-64"
      }`}>
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-white shadow-md"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {allItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    active 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "hover:bg-gray-50 text-gray-700"
                  }`}>
                    <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-primary" : "text-gray-500"}`} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${active ? "text-primary" : "text-gray-900"}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}