"""
automate_flow_prompts.py — User Manual
=======================================
Automates submitting image prompts to Google Labs Flow
in your already signed-in browser session.

────────────────────────────────────────────────────────
 STEP 1 — Install dependencies (only once)
────────────────────────────────────────────────────────
  pip install selenium webdriver-manager

────────────────────────────────────────────────────────
 STEP 2 — Launch Edge with remote debugging (first time)
────────────────────────────────────────────────────────
  Run in PowerShell:

  Start-Process "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
    -ArgumentList "--remote-debugging-port=9222 --user-data-dir=C:\EdgeDebugProfile"

  NOTE: This opens a SEPARATE debug profile (C:\EdgeDebugProfile).
        Your real Edge profile and bookmarks are completely untouched.
        Sign into labs.google in this new window — it will remember
        your session next time you use the same --user-data-dir.

────────────────────────────────────────────────────────
 STEP 3 — Run the script
────────────────────────────────────────────────────────
  python automate_flow_prompts.py <path_to_prompts_file>

  Examples:
    python automate_flow_prompts.py shorts/KRISHNA_FLUTE_SECRET/image_prompts_1.txt
    python automate_flow_prompts.py "C:/full/path/to/any_prompts.txt"

  With venv (Windows):
    & "C:/Users/PK/Desktop/DharmaForTheDigitalAge/.venv/Scripts/python.exe" `
        automate_flow_prompts.py .\shorts\KRISHNA_FLUTE_SECRET\image_prompts_1.txt

────────────────────────────────────────────────────────
 FUTURE RUNS (Edge already set up)
────────────────────────────────────────────────────────
  1. Launch the debug Edge window (same command as Step 2 above).
     Your sign-in will already be saved.
  2. Navigate to https://labs.google/ in that window.
  3. Run the script (Step 3).

────────────────────────────────────────────────────────
 PROMPTS FILE FORMAT
────────────────────────────────────────────────────────
  Plain text file, one prompt per line. Blank lines are ignored.
  Example (image_prompts_1.txt):
    A glowing lotus inside a bamboo shoot. Cinematic, 8K.
    Krishna playing the flute at midnight. Epic scale.

────────────────────────────────────────────────────────
 NOTES
────────────────────────────────────────────────────────
  - The script targets the first open tab whose URL starts with:
      https://labs.google/
  - A random cooldown of 30–60 seconds is applied between each
    submission. You can freely use other tabs during this wait.
  - If a submission fails, the script skips it after 5 seconds
    and moves to the next prompt.
"""

import sys
import os
import time
import random

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge.service import Service as EdgeService

try:
    from webdriver_manager.chrome import ChromeDriverManager
    from webdriver_manager.microsoft import EdgeChromiumDriverManager
    USE_WDM = True
except ImportError:
    USE_WDM = False

# ── Config ───────────────────────────────────────────────────────────────────
TARGET_URL_PREFIX  = "https://labs.google/"
DEBUG_PORT         = "127.0.0.1:9222"
COOLDOWN_MIN       = 30   # seconds
COOLDOWN_MAX       = 60   # seconds
EDGEDRIVER_PATH    = r"C:\EdgeDriver\msedgedriver.exe"  # downloaded for Edge 146
# ─────────────────────────────────────────────────────────────────────────────


def resolve_path(filepath: str) -> str:
    """Accept relative (from CWD) or absolute paths."""
    if os.path.isabs(filepath):
        return filepath
    return os.path.abspath(os.path.join(os.getcwd(), filepath))


def load_prompts(filepath: str) -> list[str]:
    resolved = resolve_path(filepath)
    if not os.path.exists(resolved):
        print(f"ERROR: File not found: {resolved}")
        sys.exit(1)
    with open(resolved, 'r', encoding='utf-8') as f:
        prompts = [line.strip() for line in f if line.strip()]
    print(f"Loaded {len(prompts)} prompt(s) from: {resolved}")
    return prompts


def connect_to_browser() -> webdriver.Chrome:
    """Connect to the already-running Chrome or Edge via remote debugging port.
    Tries Edge first (since msedge is detected on this system), then Chrome.
    Strategy: attempt Selenium's built-in selenium-manager first (no explicit
    service), then fall back to webdriver_manager if available.
    """
    edge_options = EdgeOptions()
    edge_options.add_experimental_option("debuggerAddress", DEBUG_PORT)

    # --- Try Edge: hardcoded driver path (most reliable) ---
    import os as _os
    if _os.path.exists(EDGEDRIVER_PATH):
        try:
            driver = webdriver.Edge(
                service=EdgeService(EDGEDRIVER_PATH),
                options=edge_options
            )
            print(f"Connected to Microsoft Edge. Open tabs: {len(driver.window_handles)}")
            return driver
        except Exception as e:
            print(f"Edge (hardcoded driver) failed: {e}")
    else:
        print(f"msedgedriver not found at {EDGEDRIVER_PATH}, trying selenium-manager...")

    # --- Try Edge: built-in selenium-manager (auto-matches browser version) ---
    try:
        driver = webdriver.Edge(options=edge_options)
        print(f"Connected to Microsoft Edge. Open tabs: {len(driver.window_handles)}")
        return driver
    except Exception as e:
        print(f"Edge (selenium-manager) failed: {e}")

    # --- Try Edge: webdriver_manager fallback ---
    if USE_WDM:
        try:
            driver = webdriver.Edge(
                service=EdgeService(EdgeChromiumDriverManager().install()),
                options=edge_options
            )
            print(f"Connected to Microsoft Edge (wdm). Open tabs: {len(driver.window_handles)}")
            return driver
        except Exception as e:
            print(f"Edge (webdriver_manager) failed: {e}")

    print("Edge connection failed, trying Chrome...")

    chrome_options = ChromeOptions()
    chrome_options.add_experimental_option("debuggerAddress", DEBUG_PORT)

    # --- Try Chrome: built-in selenium-manager ---
    try:
        driver = webdriver.Chrome(options=chrome_options)
        print(f"Connected to Chrome. Open tabs: {len(driver.window_handles)}")
        return driver
    except Exception as e:
        print(f"Chrome (selenium-manager) failed: {e}")

    # --- Try Chrome: webdriver_manager fallback ---
    if USE_WDM:
        try:
            driver = webdriver.Chrome(
                service=ChromeService(ChromeDriverManager().install()),
                options=chrome_options
            )
            print(f"Connected to Chrome (wdm). Open tabs: {len(driver.window_handles)}")
            return driver
        except Exception as e:
            print(f"Chrome (webdriver_manager) failed: {e}")

    print(f"\nERROR: Could not connect to any browser on port {DEBUG_PORT}")
    print("\nMake sure you launched the debug Edge window first (see Step 2 in the script header).")
    print("\nFor Edge (PowerShell):")
    print('  Start-Process "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"')
    print('    -ArgumentList "--remote-debugging-port=9222 --user-data-dir=C:\\EdgeDebugProfile"')
    sys.exit(1)


def find_target_tab(driver: webdriver.Chrome) -> str:
    """Scan all tabs and return the handle for the labs.google tab."""
    print(f"\nSearching for tab starting with: {TARGET_URL_PREFIX}")
    for handle in driver.window_handles:
        driver.switch_to.window(handle)
        if driver.current_url.startswith(TARGET_URL_PREFIX):
            print(f"  ✔ Found: {driver.current_url}")
            return handle

    print(f"\nERROR: No open tab found for '{TARGET_URL_PREFIX}'")
    print("Please open the page in your browser and run the script again.")
    sys.exit(1)


def submit_prompt(driver: webdriver.Chrome, wait: WebDriverWait, prompt: str):
    """Type a prompt into the Slate editor and click Submit."""
    # Find the contenteditable Slate input
    input_box = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//div[@role="textbox"][@contenteditable="true"]')
    ))

    # ActionChains is the reliable way to interact with Slate editors
    ActionChains(driver)\
        .move_to_element(input_box)\
        .click()\
        .send_keys(prompt)\
        .perform()

    time.sleep(1)  # brief pause for the editor to register the text

    # Click the Submit/Create button (arrow_forward icon)
    submit_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//button[.//span[text()="Create"] and .//i[text()="arrow_forward"]]')
    ))
    submit_btn.click()


def main():
    # ── Argument handling ────────────────────────────────────────────────────
    if len(sys.argv) < 2:
        print(__doc__)
        print("ERROR: Please supply a path to the prompts file.")
        print("  Example: python automate_flow_prompts.py shorts/KRISHNA_FLUTE_SECRET/image_prompts_1.txt")
        sys.exit(1)

    prompts_path = sys.argv[1]

    # ── Load prompts ─────────────────────────────────────────────────────────
    prompts = load_prompts(prompts_path)

    # ── Connect to browser ───────────────────────────────────────────────────
    driver = connect_to_browser()

    # ── Find and lock onto the labs.google tab ───────────────────────────────
    labs_handle = find_target_tab(driver)
    wait = WebDriverWait(driver, 15)

    # ── Main loop ────────────────────────────────────────────────────────────
    for i, prompt in enumerate(prompts):
        print(f"\n[{i+1}/{len(prompts)}] {prompt[:70]}{'...' if len(prompt) > 70 else ''}")

        try:
            # Always re-focus the labs tab before interacting
            driver.switch_to.window(labs_handle)
            submit_prompt(driver, wait, prompt)
            print(f"  ✔ Submitted.")

        except Exception as e:
            print(f"  ✘ Error: {e}")
            print("  Skipping after 5s...")
            time.sleep(5)
            continue

        # Cooldown between prompts (skip after the last one)
        if i < len(prompts) - 1:
            cooldown = random.randint(COOLDOWN_MIN, COOLDOWN_MAX)
            print(f"  ⏳ Waiting {cooldown}s before next prompt (you can use other tabs)...")
            time.sleep(cooldown)

    print("\n✅ All prompts processed!")


if __name__ == "__main__":
    main()
