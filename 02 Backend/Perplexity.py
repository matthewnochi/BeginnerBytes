import functools

import os
import time

from selenium import webdriver

from selenium.webdriver.common.by import By

# PERPLEXITY_URL = "https://www.perplexity.ai/"

# Use a specialty URL for this project that includes system instructions.
PERPLEXITY_URL = "https://www.perplexity.ai/collections/2024-dubhacks-282mCeoqTmSMEnSqTY9qEw"

BROWSER_EXECUTABLE_PATH = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"


# A decorator that immediately attempts a block of code up to an optionally specified number of times.
def attempt_immediately(max_num_attempts=5, pause_between_attempt_time=0) -> bool:
    '''
        This decorator attempts to run code (func) for a specified number of times (max_num_attempts).
        It will pause for a specified number of seconds (pause_between_attempt_time) in between attempts.
    '''

    # When the "attempt_immediately" function is called, it returns the "decorator_attempt_immediately" function
    # (with the appropriate arguments) that the decorator is actually applied to.

    def decorator_attempt_immediately(func):

        # Provide a standard decorator wrapper to be able to use functools to preserve information
        # about the original function.
        @functools.wraps(func)
        def wrapper_attempt_immediately(func):
            current_num_attempts = 0
            
            while current_num_attempts < max_num_attempts:
                try:
                    func()
                    # If the code runs successfully, no further actions is required.
                    return True
                except:
                    # If the code fails 
                    time.sleep(pause_between_attempt_time)
                    current_num_attempts += 1
            
            # Exit if the code failed to run.
            return False

        return wrapper_attempt_immediately(func)
    
    # Immediately execute the function and return the result.
    return decorator_attempt_immediately

class Perplexity():

    def __init__(self):

        # Use Brave Browser as the Chrome-based browser for this program.
        options = webdriver.ChromeOptions()
        options.binary_location = BROWSER_EXECUTABLE_PATH

        # Options to hide use
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)

        # Create a Desktop Webdriver
        self.driver = webdriver.Chrome(
            # service=service,
            options=options
        )

        # Options to Hide Driver
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        self.driver.get("https://www.google.com")

    def infer(self, query, image_path=None):

        self.driver.get(PERPLEXITY_URL)

        # Text Box
        self.driver.find_element(By.CLASS_NAME, "caret-superDuper").send_keys(query)

        if image_path != None:
            self.driver.find_element(By.TAG_NAME, "input").send_keys(image_path)

        # Click Submit Button
        self.driver.find_element(By.CLASS_NAME, "fa-arrow-right").click()

        time.sleep(3)

        # Wait for the generation to finish by watching for the stop icon to disappear
        @attempt_immediately()
        def locate_plus_button():
            while True:
                try:
                    self.driver.find_element(By.CLASS_NAME, "fa-circle-stop")
                    time.sleep(1)
                except:
                    return

        # Locate text content
        text_elements = None
        @attempt_immediately()
        def locate_completed_text():
            nonlocal text_elements
            text_block = self.driver.find_element(By.CLASS_NAME, "prose")
            text_elements = text_block.find_elements(By.TAG_NAME, "span")

            assert len(text_elements) > 2

        text = ""
        for element in text_elements:
            text += " " + element.text

        return text.strip()