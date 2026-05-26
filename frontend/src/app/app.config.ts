import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { LucideAngularModule } from 'lucide-angular';
import {
  Archive,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Folder,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  Users,
} from 'lucide-angular/src/icons';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        Archive,
        Award,
        BarChart3,
        Bell,
        BookOpen,
        Building2,
        CheckCircle2,
        ChevronDown,
        ClipboardList,
        Copy,
        Download,
        ExternalLink,
        FileText,
        Folder,
        GraduationCap,
        LayoutDashboard,
        LogOut,
        Menu,
        Plus,
        ScrollText,
        Search,
        Settings,
        ShieldCheck,
        Trash2,
        User,
        Users,
      }),
    ),
  ]
};
