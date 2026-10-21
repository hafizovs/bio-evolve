import { Injectable, signal } from '@angular/core';
import { LocaleId } from '../models/locale.model';
import { I18nKey } from '../i18n/i18n.keys';
import { EN_DICT } from '../i18n/dictionaries/en';
import { RU_DICT } from '../i18n/dictionaries/ru';
import { UiStore } from '../ui/ui.store';
import { inject } from '@angular/core';

const DICTS: Record<LocaleId, Record<I18nKey, string>> = {
  ru: RU_DICT,
  en: EN_DICT,
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly ui = inject(UiStore);

  /** Reactive tick so templates re-evaluate t() when locale changes. */
  readonly localeVersion = signal(0);

  constructor() {
    // Sync version when locale changes via effect-like polling of signal reads in t().
  }

  t(key: I18nKey): string {
    const locale = this.ui.locale();
    void this.localeVersion();
    return DICTS[locale][key] ?? DICTS.ru[key] ?? key;
  }

  notifyLocaleChanged(): void {
    this.localeVersion.update((v) => v + 1);
  }
}
