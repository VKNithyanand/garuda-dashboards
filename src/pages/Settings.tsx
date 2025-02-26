
import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Bell,
  Lock,
  User,
  Globe,
  Shield,
  Palette,
  Save,
} from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <div className="dashboard-card md:col-span-3">
            <h3 className="font-medium mb-4">Profile Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>

          <div className="dashboard-card md:col-span-4">
            <h3 className="font-medium mb-4">Preferences</h3>
            <div className="space-y-4">
              {[
                {
                  icon: Bell,
                  title: "Notifications",
                  description: "Manage notification settings",
                },
                {
                  icon: Lock,
                  title: "Privacy",
                  description: "Control your privacy settings",
                },
                {
                  icon: Shield,
                  title: "Security",
                  description: "Configure security options",
                },
                {
                  icon: Globe,
                  title: "Language",
                  description: "Set your preferred language",
                },
                {
                  icon: Palette,
                  title: "Appearance",
                  description: "Customize the interface",
                },
              ].map((setting, i) => {
                const Icon = setting.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{setting.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <button className="rounded-full p-2 hover:bg-accent">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
