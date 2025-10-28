"use client";

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

import { KilnPulseLogo } from '@/components/icons/KilnPulseLogo';
import { LayoutDashboard, Fuel, Component, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import ClientDashboard from '@/components/dashboard/ClientDashboard';


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
              <SidebarMenuButton asChild tooltip="Dashboard" isActive>
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
              <SidebarMenuButton asChild tooltip="Visual Summary">
                <Link href="/visual-summary">
                  <LayoutGrid />
                  <span>Visual Summary</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <ClientDashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
