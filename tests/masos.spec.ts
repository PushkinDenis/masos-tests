import { test, expect } from '@playwright/test';

test('masos test', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await expect(page).toHaveTitle('All Events | MasOS Staging');

  await page.locator('[data-testid=event-card-0]').click();
  await expect(page.locator('[data-testid=product-card-5]').first()).toBeVisible();
  await page.locator('[data-testid=product-card-5]').first().click();

  await expect(page.getByRole('heading', { level: 1, name: 'Sign In' })).toBeVisible();

  await page.locator('[inputmode=email]').fill(process.env.EMAIL!);
  await page.locator('[type=password]').fill(process.env.PASSWORD!);

  await page.locator('[type=submit]').click();

  await expect(page).not.toHaveURL(/sign-in/);
  await expect(page.getByRole('heading', { level: 1, name: 'Package Options' })).toBeVisible();
  await expect(page.getByText('No').first()).toBeVisible();
  await page.getByText('No').first().click();

  await page.screenshot({
    path: 'screenshots/page.png',
    fullPage: true,
  });

  await expect(page.locator('[type=file]').first()).toBeVisible();
  await page.locator('[type=file]').first().setInputFiles('public/carnival.png');

  await expect(page.getByText('Save')).toBeVisible();
  await page.getByText('Save').click();

  await page.getByText('Next').click();
  await page.getByText('No').nth(3).click();

  await page.getByTestId('add-to-cart-button').click();

  await page.waitForLoadState('load');
  await expect(page).toHaveURL(/cart/);

  await expect(page.getByTestId('go-to-checkout')).toBeVisible();
  await page.screenshot({
    path: 'screenshots/page3.png',
    fullPage: true,
  });
  await page.getByTestId('go-to-checkout').click();
  await page.waitForLoadState('load');

  await page.getByTestId('legal-terms-checkbox').click();
  await page.getByTestId('continue-to-payment').click();

  await page.waitForLoadState('load');
  await expect(page.locator('#rswp-card-button')).toBeVisible();

  await expect(page.getByTestId('payment-method-select-4')).toBeVisible();
  await page.getByTestId('payment-method-select-4').click();
  await expect(page.getByTestId('payment-method-select-4')).toBeChecked();

  await expect(page.getByText('Initializing transaction...')).toBeVisible();
  await expect(page.getByText('Initializing transaction...')).toBeHidden();

  await expect(page.getByTestId('payment-stripe')).not.toHaveClass(/hidden/, { timeout: 30_000 });

  const frameHandle = page.locator('[title="Secure payment input frame"]');
  const frame = frameHandle.contentFrame();

  await expect(frame.getByText('Card number')).toBeVisible();
  await expect(frame.locator('#payment-numberInput')).toBeVisible();
  await frame.locator('#payment-numberInput').fill('378282246310005');
  await frame.locator('#payment-expiryInput').fill('1234');
  await frame.locator('#payment-cvcInput').fill('123');
  await expect(page.getByText('Pay Now')).toBeVisible();

  await page.getByText('Pay Now').click();

  await expect(page.getByTestId('payment-stripe')).toHaveClass(/hidden/, { timeout: 80_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Payment Successful' })).toBeVisible({
    timeout: 80_000,
  });

  await page.goto('/masquerader/orders');
  await expect(page.getByRole('heading', { level: 1, name: 'Orders' })).toBeVisible({
    timeout: 30_000,
  });

  await page.getByTestId('menu').first().click();
  await page.getByText('View Receipt').click();

  await expect(page.getByText('MasOS Staging')).toBeVisible();

  await page.screenshot({
    path: 'screenshots/page2.png',
    fullPage: true,
  });
});
