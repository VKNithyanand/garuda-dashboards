
import React from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { IntegrationSettings } from '@/components/settings/IntegrationSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function Settings() {
  return (
    <DashboardLayout>
      <SettingsLayout defaultTab="profile">
        <ProfileSettings />
        <AppearanceSettings />
        <NotificationSettings />
        <SecuritySettings />
        <IntegrationSettings />
        <PrivacySettings />
      </SettingsLayout>
    </DashboardLayout>
  );
}
