import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import KilnHeartbeatDashboard from '@/components/dashboard/KilnHeartbeatDashboard';
import { KilnPulseLogo } from '@/components/icons/KilnPulseLogo';
import { LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <KilnPulseLogo className="size-8" />
            <span className="text-xl font-semibold">KilnPulse</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Dashboard" isActive>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <KilnHeartbeatDashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
