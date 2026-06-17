import { test, expect } from '@playwright/test';

test('masos test', async ({ page }) => {
  test.setTimeout(120_000);

  await test.step('Open main page and verify title', async () => {
    await page.goto('/');
    await expect(page).toHaveTitle('All Events | MasOS Staging');
    await page.screenshot({ path: 'screenshots/main-page.png', fullPage: true });
  });

  await test.step('Select the first event and a product card', async () => {
    await page.locator('[data-testid=event-card-0]').click();
    await expect(page.locator('[data-testid=product-card-5]').first()).toBeVisible();
    await page.screenshot({ path: 'screenshots/event.png', fullPage: true });
    await page.locator('[data-testid=product-card-5]').first().click();
  });

  await test.step('Verify sign-in page is displayed', async () => {
    await expect(page.getByRole('heading', { level: 1, name: 'Sign In' })).toBeVisible();
    await page.screenshot({ path: 'screenshots/sign-in.png', fullPage: true });
  });

  await test.step('Log in with valid credentials', async () => {
    await page.locator('[inputmode=email]').fill(process.env.EMAIL!);
    await page.locator('[type=password]').fill(process.env.PASSWORD!);
    await page.locator('[type=submit]').click();
    await expect(page).not.toHaveURL(/sign-in/);
  });

  await test.step('Handle Package Options', async () => {
    await expect(page.getByRole('heading', { level: 1, name: 'Package Options' })).toBeVisible();
    await page.screenshot({ path: 'screenshots/options.png', fullPage: true });
    await expect(page.getByText('No').first()).toBeVisible();
    await page.getByText('No').first().click();

    await expect(page.locator('[type=file]').first()).toBeVisible();
    await page.locator('[type=file]').first().setInputFiles('public/carnival.png');

    await expect(page.getByText('Save')).toBeVisible();
    await page.getByText('Save').click();

    await page.getByText('Next').click();
    await page.getByText('No').nth(3).click();
  });

  await test.step('Add product to cart and verify cart page', async () => {
    await page.getByTestId('add-to-cart-button').click();
    await page.waitForLoadState('load');
    await expect(page).toHaveURL(/cart/);
    await page.screenshot({ path: 'screenshots/cart.png', fullPage: true });
    await expect(page.getByTestId('go-to-checkout')).toBeVisible();
    await page.screenshot({ path: 'screenshots/checkout.png', fullPage: true });
    await page.getByTestId('go-to-checkout').click();
    await page.waitForLoadState('load');
  });

  await test.step('Accept legal terms and proceed to payment', async () => {
    await page.getByTestId('legal-terms-checkbox').click();
    await page.getByTestId('continue-to-payment').click();
    await page.waitForLoadState('load');
  });

  await test.step('Select payment method and wait for Stripe form', async () => {
    await expect(page.locator('#rswp-card-button')).toBeVisible();
    await expect(page.getByTestId('payment-method-select-4')).toBeVisible();
    await page.getByTestId('payment-method-select-4').click();
    await expect(page.getByTestId('payment-method-select-4')).toBeChecked();
    await page.screenshot({ path: 'screenshots/payment.png', fullPage: true });

    await expect(page.getByText('Initializing transaction...')).toBeVisible();
    await expect(page.getByText('Initializing transaction...')).toBeHidden();
    await expect(page.getByTestId('payment-stripe')).not.toHaveClass(/hidden/, { timeout: 30_000 });
  });

  await test.step('Fill in card details and complete payment', async () => {
    const frameHandle = page.locator('[title="Secure payment input frame"]');
    const frame = frameHandle.contentFrame();

    await expect(frame.getByText('Card number')).toBeVisible();
    await expect(frame.locator('#payment-numberInput')).toBeVisible();
    await frame.locator('#payment-numberInput').fill('378282246310005');
    await frame.locator('#payment-expiryInput').fill('1234');
    await frame.locator('#payment-cvcInput').fill('123');

    await expect(page.getByText('Pay Now')).toBeVisible();
    await page.getByText('Pay Now').click();
  });

  await test.step('Wait for payment success confirmation', async () => {
    await expect(page.getByTestId('payment-stripe')).toHaveClass(/hidden/, { timeout: 80_000 });
    await expect(page.getByRole('heading', { level: 1, name: 'Payment Successful' })).toBeVisible({
      timeout: 80_000,
    });
  });

  await test.step('Navigate to orders and open receipt', async () => {
    await page.goto('/masquerader/orders');
    await expect(page.getByRole('heading', { level: 1, name: 'Orders' })).toBeVisible({
      timeout: 30_000,
    });
    await page.screenshot({ path: 'screenshots/orders.png', fullPage: true });

    await page.getByTestId('menu').first().click();
    await page.getByText('View Receipt').click();

    await expect(page.getByText('MasOS Staging')).toBeVisible();
    await page.screenshot({ path: 'screenshots/receipt.png', fullPage: true });
  });
});
