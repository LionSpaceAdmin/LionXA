import { _electron, chromium } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ValidationResult {
  success: boolean;
  message: string;
  path?: string;
  error?: string;
}

async function checkPlaywrightInstallation(): Promise<ValidationResult> {
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const hasPlaywright = packageJson.devDependencies?.['@playwright/test'] || packageJson.dependencies?.['@playwright/test'];
    
    if (!hasPlaywright) {
      console.log('🔄 Installing Playwright...');
      execSync('pnpm install -D @playwright/test', { stdio: 'inherit' });
    }
    
    return { success: true, message: '✅ Playwright is installed correctly' };
  } catch (error: any) {
    return { 
      success: false, 
      message: '❌ Failed to verify Playwright installation', 
      error: error.message 
    };
  }
}

async function findChromiumPath(): Promise<ValidationResult> {
  try {
    // Check common locations
    const commonPaths = [
      path.join(process.cwd(), 'node_modules', '.cache', 'ms-playwright'),
      path.join(process.env.HOME || '', '.cache', 'ms-playwright'),
      path.join(process.env.HOME || '', 'Library', 'Caches', 'ms-playwright'),
    ];

    for (const basePath of commonPaths) {
      try {
        const dirs = await fs.readdir(basePath);
        for (const dir of dirs) {
          if (dir.startsWith('chromium-')) {
            const chromePath = path.join(
              basePath,
              dir,
              'chromium-mac-arm64',
              'chrome-mac',
              'Chromium.app',
              'Contents',
              'MacOS',
              'Chromium'
            );
            
            try {
              await fs.access(chromePath);
              return { 
                success: true, 
                message: '✅ Found Chromium executable', 
                path: chromePath 
              };
            } catch {}
          }
        }
      } catch {}
    }

// If not found, try to install browsers
await ensurePlaywrightBrowsers();

async function ensurePlaywrightBrowsers(): Promise<void> {
  try {
    console.log('🔄 Installing Playwright browsers...');
    execSync('pnpm exec playwright install chromium --with-deps', { stdio: 'inherit' });
  } catch (error: any) {
    throw new Error('Failed to install Playwright browsers: ' + error.message);
  }
}

// Try to find again after installation
try {
  const { stdout } = await execAsync('find ~ -type d -name "chromium-*" 2>/dev/null');
  const paths = stdout.split('\n').filter(Boolean);

  for (const p of paths) {
    const chromePath = path.join(p, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium');
    try {
      await fs.access(chromePath);
      return { 
        success: true, 
        message: '✅ Chromium installed and found', 
        path: chromePath 
      };
    } catch {}
  }
} catch {}

    // Try to get browser directly from Playwright
    try {
      const browserType = chromium;
      const executablePath = browserType.executablePath();
      const browser = await browserType.launch();
      await browser.close();
      
      return {
        success: true,
        message: '✅ Chromium found via Playwright',
        path: executablePath
      };
    } catch {}

    return { 
      success: false, 
      message: '❌ Could not locate Chromium executable' 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: '❌ Error searching for Chromium', 
      error: error.message 
    };
  }
}

async function testChromiumLaunch(chromePath: string): Promise<ValidationResult> {
  try {
    // Test manual launch first
    execSync(`"${chromePath}" --version`, { stdio: 'pipe' });
    
    // Test with Playwright
    const browser = await chromium.launch({ 
      executablePath: chromePath,
      headless: false,
      args: ['--enable-automation']
    });
    await browser.close();
    
    return { 
      success: true, 
      message: '✅ Chromium launches successfully',
      path: chromePath
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: '❌ Failed to launch Chromium', 
      error: error.message 
    };
  }
}

async function checkAccessibilityPermissions(chromePath: string): Promise<ValidationResult> {
  try {
    // Check if we can get a screenshot (requires accessibility permissions)
    const browser = await chromium.launch({ 
      executablePath: chromePath,
      headless: false 
    });
    const page = await browser.newPage();
    await page.goto('chrome://version');
    await page.screenshot({ path: 'test-accessibility.png' });
    await browser.close();
    await fs.unlink('test-accessibility.png');
    
    return { 
      success: true, 
      message: '✅ Accessibility permissions are granted' 
    };
  } catch (error: any) {
    // Open System Preferences to Accessibility
    execSync('open x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
    
    return { 
      success: false, 
      message: '⚠️ Please grant Accessibility permissions for Chromium in System Settings',
      error: error.message 
    };
  }
}

async function main() {
  console.log('\n🔍 Starting Playwright Environment Validation\n');

  // 1. Check Playwright Installation
  const playwrightCheck = await checkPlaywrightInstallation();
  console.log(`[1/4] Playwright Installation: ${playwrightCheck.message}`);
  if (!playwrightCheck.success) {
    console.error(`Error: ${playwrightCheck.error}`);
    return;
  }

  // 2. Find Chromium
  const chromiumCheck = await findChromiumPath();
  console.log(`[2/4] Chromium Location: ${chromiumCheck.message}`);
  if (!chromiumCheck.success || !chromiumCheck.path) {
    console.error(`Error: ${chromiumCheck.error}`);
    return;
  }
  console.log(`📍 Path: ${chromiumCheck.path}`);

  // 3. Test Launch
  const launchCheck = await testChromiumLaunch(chromiumCheck.path);
  console.log(`[3/4] Launch Test: ${launchCheck.message}`);
  if (!launchCheck.success) {
    console.error(`Error: ${launchCheck.error}`);
    return;
  }

  // 4. Check Accessibility
  const accessibilityCheck = await checkAccessibilityPermissions(chromiumCheck.path);
  console.log(`[4/4] Accessibility: ${accessibilityCheck.message}`);
  if (!accessibilityCheck.success) {
    console.log('\n⚠️ Action Required:');
    console.log('1. Open System Settings > Privacy & Security > Accessibility');
    console.log(`2. Add and enable ${chromiumCheck.path}`);
    console.log('3. Run this script again to verify\n');
    return;
  }

  console.log('\n✅ Environment Validation Complete');
  console.log('All checks passed. Ready for browser automation.\n');
}

// Run validation
main().catch(console.error);
