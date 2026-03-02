'use client';

import { CircleUserRound, LogOut, Moon, Sun, Monitor, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from '@/app/(auth)/actions';
import { Avatar, AvatarFallback } from './avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from './dropdown-menu';

export function UserMenu() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer hover:ring-2 hover:ring-indigo-100 dark:hover:ring-indigo-900 transition-all">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <CircleUserRound className="h-6 w-6 stroke-[1.5]" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span>Tema</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span>Terang</span>
                {theme === 'light' && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>Gelap</span>
                {theme === 'dark' && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span>Sistem</span>
                {theme === 'system' && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
