import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { KilnPulseLogo } from '@/components/icons/KilnPulseLogo';
import { LayoutDashboard, Fuel, Component, LayoutGrid, Wrench, BarChartHorizontal, ShieldCheck, BookUser, AreaChart } from 'lucide-react';
import Link from 'next/link';

export default function SafetyComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Fuel Optimization">
                <Link href="/fuel-optimization">
                  <Fuel />
                  <span>Fuel Optimization</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Raw Material Prediction">
                <Link href="/raw-material-prediction">
                  <Component />
                  <span>Raw Materials</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Maintenance Predictor">
                <Link href="/maintenance-predictor">
                  <Wrench />
                  <span>Maintenance</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Visual Summary">
                <Link href="/visual-summary">
                  <LayoutGrid />
                  <span>Visual Summary</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Safety Compliance" isActive>
                    <Link href="/safety-compliance">
                        <ShieldCheck />
                        <span>Safety</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Operator Logbook">
                    <Link href="/operator-logbook">
                        <BookUser />
                        <span>Logbook</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Energy Cost Analysis">
                    <Link href="/energy-cost-analysis">
                        <AreaChart />
                        <span>Energy Costs</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Impact Tracker">
                    <Link href="/impact-tracker">
                        <BarChartHorizontal />
                        <span>Impact Tracker</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
