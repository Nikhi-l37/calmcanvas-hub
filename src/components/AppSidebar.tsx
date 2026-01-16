import { LayoutDashboard, Smartphone, Target, BarChart3, Flame, UserCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { LocalStorage } from '@/services/storage';

const items = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'My Apps', url: '/apps', icon: Smartphone },
  { title: 'Streaks', url: '/streaks', icon: Flame },
  { title: 'Statistics', url: '/statistics', icon: BarChart3 },
  { title: 'Settings', url: '/profile', icon: UserCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const settings = LocalStorage.getSettings();
  const name = settings.name;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-muted/50';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarContent className="pt-safe">
        <div className="p-4 border-b border-border">
          {!collapsed && (
            <div className="space-y-1">
              <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Screen Tracker
              </h2>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
