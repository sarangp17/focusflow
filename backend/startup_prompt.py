import tkinter as tk
from tkinter import messagebox
import subprocess
import sys
import os

def ask_permission():
    # Hide the main tkinter window
    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True)

    # Ask permission
    response = messagebox.askyesno(
        "FocusFlow",
        "🎯 Start tracking your screen time with FocusFlow?\n\nClick YES to begin tracking.\nClick NO to skip for now.",
        icon='question'
    )

    root.destroy()

    if response:
        # User said YES — start the backend
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        python_path = sys.executable

        # Start monitor
        subprocess.Popen(
            [python_path, os.path.join(backend_dir, "monitor.py")],
            cwd=backend_dir,
            creationflags=subprocess.CREATE_NO_WINDOW
        )

        # Start API
        subprocess.Popen(
            [python_path, os.path.join(backend_dir, "api.py")],
            cwd=backend_dir,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        print("[Startup] FocusFlow tracking started.")
    else:
        print("[Startup] User skipped tracking.")

if __name__ == "__main__":
    ask_permission()