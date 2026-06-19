"""
Calculator Launcher
===================
Custom dropdown · rounded corners (Windows 11) · glass-morphism design
"""

import tkinter as tk
import ctypes
from ctypes import wintypes
from calculators.basic_calculator import BasicCalculator
from calculators.scientific_calculator import ScientificCalculator
from calculators import THEME


CALCULATORS = {
    "Simple":     (BasicCalculator,      "Simple Calculator"),
    "Scientific": (ScientificCalculator, "Scientific Calculator"),
}


def _set_rounded_corners(root):
    try:
        hwnd = wintypes.HWND(root.winfo_id())
        dwmapi = ctypes.windll.dwmapi
        DWMWA_WINDOW_CORNER_PREFERENCE = 33
        DWMWCP_ROUND = 2
        dwmapi.DwmSetWindowAttribute(
            hwnd, DWMWA_WINDOW_CORNER_PREFERENCE,
            ctypes.byref(ctypes.c_int(DWMWCP_ROUND)),
            ctypes.sizeof(ctypes.c_int),
        )
    except Exception:
        pass


class CalculatorApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Calculator")
        self.root.resizable(False, False)
        self.root.attributes("-topmost", True)
        try:
            self.root.attributes("-toolwindow", True)
        except Exception:
            pass
        self.root.configure(bg=THEME["bg"])

        self.root.after(50, lambda: _set_rounded_corners(self.root))

        self._menu_open = False
        self._build_menu()
        self._build_container()

        self.current_frame = None
        self._switch_to("Simple")

    # ── custom dropdown menu ──────────────────────────────────────
    def _build_menu(self):
        bar = tk.Frame(self.root, bg=THEME["surface"], height=36)
        bar.pack(fill="x")
        bar.pack_propagate(False)

        # bottom border line
        tk.Frame(bar, bg=THEME["border"], height=1).pack(side="bottom", fill="x")

        self._menu_label = tk.Label(
            bar, text="Calculators  \u25be",
            font=("Segoe UI", 11, "bold"),
            bg=THEME["surface"], fg=THEME["menu_fg"], cursor="hand2",
            padx=16, pady=6,
        )
        self._menu_label.pack(side="left")
        self._menu_label.bind("<Button-1>", self._toggle_menu)
        self._menu_label.bind("<Enter>", lambda e: self._menu_label.configure(
            bg=THEME["menu_hover"]))
        self._menu_label.bind("<Leave>", lambda e: self._menu_label.configure(
            bg=THEME["surface"]))

        # dropdown frame
        self._menu_frame = tk.Frame(
            self.root, bg=THEME["menu_border"],
            highlightbackground=THEME["menu_border"],
            highlightthickness=1,
        )
        self._menu_items = []
        for name in CALCULATORS:
            item = tk.Label(
                self._menu_frame, text=name,
                font=("Segoe UI", 11),
                bg=THEME["menu_bg"], fg=THEME["menu_fg"],
                padx=28, pady=7, anchor="w", cursor="hand2",
            )
            item.pack(fill="x")
            item.bind("<Button-1>", lambda e, n=name: self._select(n))
            item.bind("<Enter>",
                      lambda e, i=item: i.configure(bg=THEME["menu_hover"]))
            item.bind("<Leave>",
                      lambda e, i=item: i.configure(bg=THEME["menu_bg"]))
            self._menu_items.append(item)

    def _toggle_menu(self, event=None):
        if self._menu_open:
            self._hide_menu()
        else:
            self._show_menu()

    def _show_menu(self):
        self._overlay = tk.Frame(self.root, bg="")
        self._overlay.place(x=0, y=0, relwidth=1, relheight=1)
        self._overlay.bind("<Button-1>", self._hide_menu)

        self._menu_frame.place(
            x=10,
            y=self._menu_label.winfo_rooty() - self.root.winfo_rooty() + 34,
            anchor="nw",
        )
        self._menu_frame.lift()
        self._menu_open = True

    def _hide_menu(self, event=None):
        self._menu_frame.place_forget()
        if hasattr(self, "_overlay"):
            self._overlay.destroy()
        self._menu_open = False

    def _select(self, name):
        self._hide_menu()
        self._switch_to(name)
        self._menu_label.config(text=f"{name}  \u25be")

    # ── container ─────────────────────────────────────────────────
    def _build_container(self):
        self.container = tk.Frame(self.root, bg=THEME["bg"])
        self.container.pack(fill="both", expand=True)

    def _switch_to(self, name):
        cls, title = CALCULATORS[name]
        if self.current_frame is not None:
            self.current_frame.destroy()
        self.current_frame = cls(self.container)
        self.current_frame.pack(fill="both", expand=True)
        self.current_frame.focus_set()
        w, h = cls.get_min_size()
        self.root.geometry(f"{w}x{h}")
        self.root.title(title)

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    CalculatorApp().run()
