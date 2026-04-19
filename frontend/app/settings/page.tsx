import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use the theme toggle in the top bar to switch between light and dark mode.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active portfolio ID: 1
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
