import { expect, type Locator, type Page } from '@playwright/test';

export class MetersPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/medidores');
    await expect(this.page).toHaveURL("/medidores");
  }

  async searchMeter(meterId: string): Promise<void> {
    const searchbox = this.page.getByRole('combobox', { name: 'Medidor' });
    await searchbox.fill(meterId);
  }

  async openMeter(meterId: string): Promise<void> {
    await this.page.getByRole('link', { name: 'M-109' }).click();
    await expect(this.page).toHaveURL(new RegExp(`/medidores/${meterId}(?:$|[/?#])`));
  }
}
