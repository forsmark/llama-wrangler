import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import { join } from 'path'

test.describe('llama-cpp-cmd-builder', () => {
  test('app launches and shows main UI', async () => {
    // Launch the built Electron app
    const electronApp = await electron.launch({
      args: [join(__dirname, '../../out/main/index.js')],
    })

    const window = await electronApp.firstWindow()

    // Check title
    await expect(window.locator('h1')).toContainText('llama-cpp-cmd-builder')

    // Check major UI sections are present
    await expect(window.locator('text=Hardware')).toBeVisible()

    await electronApp.close()
  })

  test('command preview shows llama-server', async () => {
    const electronApp = await electron.launch({
      args: [join(__dirname, '../../out/main/index.js')],
    })

    const window = await electronApp.firstWindow()

    // Wait for hardware detection to complete
    await window.waitForSelector('text=Detecting hardware', { state: 'hidden', timeout: 15000 })

    // Command panel should show llama-server
    const commandContent = await window.locator('pre').first().textContent()
    expect(commandContent).toContain('llama-server')

    await electronApp.close()
  })
})
