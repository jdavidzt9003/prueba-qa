import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.page.getByRole('textbox', { name: 'Email' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Contraseña' }).fill(password);
    await this.page.getByRole('button', { name: 'Entrar' }).click();
  }
}
