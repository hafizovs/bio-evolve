import { Injectable, signal } from '@angular/core';
import { LocaleId } from '../models/locale.model';
import { ThemeId } from '../models/theme.model';

@Injectable({ providedIn: 'root' })
export class UiStore {
  readonly theme = signal<ThemeId>('dark');
  readonly locale = signal<LocaleId>('ru');
  readonly hotkeysHelpOpen = signal(false);
  readonly mobileDrawerOpen = signal(false);

  setTheme(theme: ThemeId): void {
    this.theme.set(theme);
  }

  toggleTheme(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  setLocale(locale: LocaleId): void {
    this.locale.set(locale);
  }

  toggleLocale(): void {
    this.locale.update((l) => (l === 'ru' ? 'en' : 'ru'));
  }

  toggleHotkeysHelp(): void {
    this.hotkeysHelpOpen.update((v) => !v);
  }

  setHotkeysHelpOpen(open: boolean): void {
    this.hotkeysHelpOpen.set(open);
  }

  toggleMobileDrawer(): void {
    this.mobileDrawerOpen.update((v) => !v);
  }

  setMobileDrawerOpen(open: boolean): void {
    this.mobileDrawerOpen.set(open);
  }
}
