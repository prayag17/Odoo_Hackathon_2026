import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { authClient } from '#/lib/auth-client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  LayoutDashboardIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  TruckElectricIcon,
  UsersIcon,
  WrenchIcon,
  HandCoinsIcon,
  ChartSplineIcon,
  TruckIcon,
  PackageIcon,
} from 'lucide-react'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Fleet',
      url: '/fleet',
      icon: <TruckIcon />,
    },
    {
      title: 'Drivers',
      url: '/drivers',
      icon: <UsersIcon />,
    },
    {
      title: 'Trips',
      url: '/trips',
      icon: <PackageIcon />,
    },
    {
      title: 'Maintenance',
      url: '/maintenance',
      icon: <WrenchIcon />,
    },
    {
      title: 'Fuel & Expenses',
      url: '/fuel-expenses',
      icon: <HandCoinsIcon />,
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: <ChartSplineIcon />,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: <Settings2Icon />,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: <CircleHelpIcon />,
    },
    {
      title: 'Search',
      url: '#',
      icon: <SearchIcon />,
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <TruckElectricIcon className="size-5!" />
              <span className="text-base font-semibold">TransitOps</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {session?.user && (
          <NavUser
            user={{
              name: session.user.name,
              email: session.user.email,
              avatar: session.user.image ?? '',
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
