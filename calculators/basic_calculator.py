"""
Basic Calculator — glass-morphism design
=========================================
Compact · keyboard accessible · extreme edge case handling.
"""

import tkinter as tk
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP, Overflow
import re
from calculators import THEME


MAX_DIGITS = 15


class BasicCalculator(tk.Frame):
    """A compact basic calculator as an embeddable frame."""

    def __init__(self, master=None, **kwargs):
        super().__init__(master, **kwargs)
        self.configure(bg=THEME["bg"])

        self.display_text     = "0"
        self.operand          = None
        self.operator         = None
        self.waiting          = True
        self.last_op          = None
        self.last_operand     = None
        self.error            = False
        self.just_calculated  = False

        self._build_ui()
        self._bind_keys()
        self.focus_set()

    WINDOW_W = 320
    WINDOW_H = 490
    DISPLAY_H = 120

    @classmethod
    def get_min_size(cls):
        return (cls.WINDOW_W, cls.WINDOW_H)

    # ── UI ──────────────────────────────────────────────────────────
    def _build_ui(self):
        top = tk.Frame(self, bg=THEME["display_bg"], height=self.DISPLAY_H)
        top.pack(fill="x")
        top.pack_propagate(False)

        self._expr_var = tk.StringVar(value="")
        tk.Label(
            top, textvariable=self._expr_var,
            font=("Segoe UI", 11),
            bg=THEME["display_bg"], fg=THEME["expression_fg"],
            anchor="se", padx=18,
        ).pack(fill="x", expand=True, pady=(14, 0))

        self._value_var = tk.StringVar(value="0")
        tk.Label(
            top, textvariable=self._value_var,
            font=("Segoe UI", 42, "normal"),
            bg=THEME["display_bg"], fg=THEME["display_fg"],
            anchor="se", padx=18,
        ).pack(fill="x", expand=True, pady=(0, 10))

        grid = tk.Frame(self, bg=THEME["bg"])
        grid.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        for r in range(5):
            grid.rowconfigure(r, weight=1, uniform="btn")
        for c in range(4):
            grid.columnconfigure(c, weight=1, uniform="btn")

        layout = [
            (0, 0, "AC",  "func", 1),
            (0, 1, "\u00b1", "func", 1),
            (0, 2, "%",   "func", 1),
            (0, 3, "\u00f7", "op", 1),
            (1, 0, "7",   "num",  1),
            (1, 1, "8",   "num",  1),
            (1, 2, "9",   "num",  1),
            (1, 3, "\u00d7", "op", 1),
            (2, 0, "4",   "num",  1),
            (2, 1, "5",   "num",  1),
            (2, 2, "6",   "num",  1),
            (2, 3, "\u2212", "op", 1),
            (3, 0, "1",   "num",  1),
            (3, 1, "2",   "num",  1),
            (3, 2, "3",   "num",  1),
            (3, 3, "+",   "op",  1),
            (4, 0, "0",   "num",  1),
            (4, 1, "\u232b", "func", 1),
            (4, 2, ".",   "num",  1),
            (4, 3, "=",   "equal", 1),
        ]

        for row, col, text, kind, colspan in layout:
            btn = self._mkbtn(grid, text, kind)
            btn.grid(row=row, column=col, columnspan=colspan,
                     sticky="nsew", padx=2, pady=2)

    def _mkbtn(self, parent, text, kind):
        if kind == "num":
            bg, fg, hov, act = (THEME["num_bg"], THEME["num_fg"],
                                THEME["num_hover"], THEME["num_active"])
            border = THEME["border"]
        elif kind == "op":
            bg, fg, hov, act = (THEME["op_bg"], THEME["op_fg"],
                                THEME["op_hover"], THEME["op_active"])
            border = THEME["op_active"]
        elif kind == "func":
            bg, fg, hov, act = (THEME["func_bg"], THEME["func_fg"],
                                THEME["func_hover"], THEME["func_active"])
            border = THEME["border"]
        else:
            bg, fg, hov, act = (THEME["equal_bg"], THEME["equal_fg"],
                                THEME["equal_hover"], THEME["equal_active"])
            border = THEME["equal_active"]

        btn = tk.Button(
            parent, text=text,
            font=("Segoe UI", 18, "normal"),
            bg=bg, fg=fg,
            activebackground=act, activeforeground=fg,
            bd=0, highlightthickness=1, highlightbackground=border,
            highlightcolor=border, relief="flat",
            cursor="hand2",
            command=lambda t=text: self._press(t),
        )
        btn.bind("<Enter>", lambda _, b=btn, c=hov: b.configure(bg=c))
        btn.bind("<Leave>", lambda _, b=btn, c=bg:  b.configure(bg=c))
        return btn

    # ── keyboard ────────────────────────────────────────────────────
    def _bind_keys(self):
        for i in range(10):
            self.bind(str(i), lambda _, d=str(i): self._press(d))
        self.bind("<Key-.>",        lambda _: self._press("."))
        self.bind("<Key-+>",        lambda _: self._press("+"))
        self.bind("<Key-minus>",    lambda _: self._press("\u2212"))
        self.bind("<Key-asterisk>", lambda _: self._press("\u00d7"))
        self.bind("<Key-slash>",    lambda _: self._press("\u00f7"))
        self.bind("<Key-Return>",   lambda _: self._press("="))
        self.bind("<Key-KP_Enter>", lambda _: self._press("="))
        self.bind("<Key-Escape>",   lambda _: self._press("AC"))
        self.bind("<Key-c>",        lambda _: self._press("AC"))
        self.bind("<Key-C>",        lambda _: self._press("AC"))
        self.bind("<Key-BackSpace>",lambda _: self._press("\u232b"))
        self.bind("<Key-Delete>",   lambda _: self._press("AC"))
        self.bind("<Key-percent>",  lambda _: self._press("%"))

    # ── dispatch ────────────────────────────────────────────────────
    def _press(self, value):
        if self.error and value != "AC":
            return
        dispatch = {
            "AC": self._clear, "\u00b1": self._negate, "%": self._percent,
            "=": self._equals, "+": self._operator, "\u2212": self._operator,
            "\u00d7": self._operator, "\u00f7": self._operator,
            ".": self._decimal, "\u232b": self._backspace,
        }
        handler = dispatch.get(value)
        if handler:
            handler(value)
        else:
            self._digit(value)
        self._refresh()
        self.focus_set()

    def _digit(self, d):
        if self.waiting or self.display_text == "0" or self.just_calculated:
            self.display_text = d
            self.waiting = False
            self.just_calculated = False
            return
        body = self.display_text.lstrip("-").replace(".", "")
        if len(body) >= MAX_DIGITS:
            return
        self.display_text += d

    def _decimal(self, _):
        if self.just_calculated:
            self.display_text = "0."
            self.waiting = False
            self.just_calculated = False
            return
        if self.waiting:
            self.display_text = "0."
            self.waiting = False
            return
        if "." not in self.display_text:
            self.display_text += "."

    def _operator(self, op):
        self.just_calculated = False
        cur = self._parse(self.display_text)
        if cur is None:
            return
        if self.operator and not self.waiting:
            self._evaluate(cur)
        else:
            self.operand = cur
        self.operator = op
        self.waiting = True
        self._expr_var.set(f"{self._fmt(self.operand)} {op}")

    def _equals(self, _):
        if self.error:
            return
        cur = self._parse(self.display_text)
        if cur is None:
            return
        if self.operator:
            self._evaluate(cur)
            self.last_op = self.operator
            self.last_operand = cur
            self.operator = None
            self.waiting = True
            self.just_calculated = True
        elif self.last_op is not None and self.last_operand is not None:
            self._repeat_last()
            self.just_calculated = True

    def _evaluate(self, b):
        a = self.operand
        op = self.operator
        result = self._apply(a, b, op)
        if result is None:
            return
        self.operand = result
        self.display_text = self._fmt(result)
        self._expr_var.set(f"{self._fmt(a)} {op} {self._fmt(b)} =")

    def _repeat_last(self):
        cur = self._parse(self.display_text)
        if cur is None:
            return
        a = self.operand if self.operand is not None else cur
        result = self._apply(a, self.last_operand, self.last_op)
        if result is None:
            return
        self.operand = result
        self.display_text = self._fmt(result)
        self._expr_var.set(
            f"{self._fmt(a)} {self.last_op} {self._fmt(self.last_operand)} ="
        )

    def _apply(self, a, b, op):
        if a is None:
            return b
        if b is None:
            return a
        try:
            if op == "+":
                return a + b
            if op == "\u2212":
                return a - b
            if op == "\u00d7":
                return a * b
            if op == "\u00f7":
                if b == Decimal("0"):
                    if a == Decimal("0"):
                        self._set_error("Not a Number")
                        return None
                    self._set_error("Cannot divide by zero")
                    return None
                return a / b
        except (Overflow, InvalidOperation):
            self._set_error("Overflow")
            return None
        except Exception:
            self._set_error("Error")
            return None
        return b

    def _negate(self, _):
        if self.display_text == "0":
            return
        self.display_text = (
            self.display_text[1:] if self.display_text.startswith("-")
            else "-" + self.display_text
        )
        self.just_calculated = False

    def _percent(self, _):
        val = self._parse(self.display_text)
        if val is None:
            return
        try:
            self.display_text = self._fmt(val / Decimal("100"))
            self.waiting = False
            self.just_calculated = False
        except Exception:
            self._set_error()

    def _clear(self, _):
        self.display_text    = "0"
        self.operand         = None
        self.operator        = None
        self.waiting         = True
        self.last_op         = None
        self.last_operand    = None
        self.error           = False
        self.just_calculated = False
        self._expr_var.set("")

    def _backspace(self):
        if self.error or self.just_calculated or self.waiting:
            return
        if len(self.display_text) <= 1 or \
           (len(self.display_text) == 2 and self.display_text.startswith("-")):
            self.display_text = "0"
            self.waiting = True
        else:
            self.display_text = self.display_text[:-1]
        self._refresh()

    def _refresh(self):
        if not self.error:
            self._value_var.set(self._thousands(self.display_text))

    def _parse(self, text):
        if not text or text in ("-", ".", ""):
            return Decimal("0")
        try:
            return Decimal(text)
        except (InvalidOperation, ValueError):
            self._set_error("Error")
            return None

    def _fmt(self, num):
        if num is None:
            return "0"
        if num.is_nan() or num.is_infinite():
            self._set_error()
            return "0"
        if abs(num) >= Decimal("1e15") or \
           (abs(num) < Decimal("1e-10") and num != Decimal("0")):
            s = f"{num:.10e}"
            parts = s.split("e")
            mant = parts[0].rstrip("0").rstrip(".")
            exp = parts[1].lstrip("+").lstrip("0") or "0"
            return f"{mant}e{exp}"
        s = str(num)
        if "." in s:
            s = s.rstrip("0").rstrip(".")
        if len(s) > MAX_DIGITS + 1:
            try:
                num = num.quantize(Decimal("1." + "0" * 10), rounding=ROUND_HALF_UP)
                s = str(num).rstrip("0").rstrip(".")
            except Exception:
                pass
        return s

    @staticmethod
    def _thousands(s):
        if not s or s == "0":
            return s
        if "e" in s or "E" in s:
            parts = re.split(r"[eE]", s, maxsplit=1)
            mant, exp = parts[0], ("e" + parts[1])
            return BasicCalculator._thousands(mant) + exp
        sign = ""
        if s.startswith("-"):
            sign = "-"
            s = s[1:]
        if "." in s:
            int_part, frac = s.split(".")
        else:
            int_part, frac = s, ""
        grouped = ""
        for i, ch in enumerate(reversed(int_part)):
            if i and i % 3 == 0:
                grouped = "," + grouped
            grouped = ch + grouped
        return sign + grouped + ("." + frac if frac else "")

    def _set_error(self, msg="Error"):
        self.error = True
        self.display_text = "0"
        self._value_var.set(msg)
        self._expr_var.set("")
