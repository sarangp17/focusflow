import subprocess
import sys
import os

STARTUP_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"
APP_NAME = "FocusFlow"

def register_startup():
    """Register FocusFlow to prompt on Windows startup"""
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, STARTUP_KEY, 0, winreg.KEY_SET_VALUE)
        # Points to our startup prompt script
        script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "startup_prompt.py"))
        python_path = sys.executable
        winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, f'"{python_path}" "{script_path}"')
        winreg.CloseKey(key)
        print("[Startup] FocusFlow registered to run on startup.")
    except Exception as e:
        print(f"[Startup] Failed to register: {e}")

def unregister_startup():
    """Remove FocusFlow from startup"""
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, STARTUP_KEY, 0, winreg.KEY_SET_VALUE)
        winreg.DeleteValue(key, APP_NAME)
        winreg.CloseKey(key)
        print("[Startup] FocusFlow removed from startup.")
    except Exception as e:
        print(f"[Startup] Failed to unregister: {e}")

if __name__ == "__main__":
    register_startup()