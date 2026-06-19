"""
Scientific Calculator — glass-morphism design
==============================================
Compact · keyboard accessible · memory · DEG/RAD · constants · unary/binary ops
"""

import tkinter as tk
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP, Overflow
import math
import re
from calculators import THEME


MAX_DIGITS = 15


class ScientificCalculator(tk.Frame):
    """A compact scientific calculator as an embeddable frame."""

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

        self.angle_mode       = "DEG"
        self.memory           = None

        self._build_ui()
        self._bind_keys()
        self.focus_set()

    WINDOW_W = 370
    WINDOW_H = 610
    DISPLAY_H = 130

    @classmethod
    def get_min_size(cls):
        return (cls.WINDOW_W, cls.WINDOW_H)

    # ── UI ──────────────────────────────────────────────────────────
    def _build_ui(self):
        top = tk.Frame(self, bg=THEME["display_bg"], height=self.DISPLAY_H)
        top.pack(fill="x")
        top.pack_propagate(False)

        ind = tk.Frame(top, bg=THEME["display_bg"])
        ind.pack(fill="x")

        self._mem_var = tk.StringVar(value="")
        tk.Label(
            ind, textvariable=self._mem_var,
            font=("Segoe UI", 10),
            bg=THEME["display_bg"], fg=THEME["indicator_fg"],
            anchor="w", padx=18,
        ).pack(side="left")

        self._mode_var = tk.StringVar(value="DEG")
        tk.Label(
            ind, textvariable=self._mode_var,
            font=("Segoe UI", 10),
            bg=THEME["display_bg"], fg=THEME["indicator_fg"],
            anchor="e", padx=18,
        ).pack(side="right")

        self._expr_var = tk.StringVar(value="")
        tk.Label(
            top, textvariable=self._expr_var,
            font=("Segoe UI", 11),
            bg=THEME["display_bg"], fg=THEME["expression_fg"],
            anchor="se", padx=18,
        ).pack(fill="x", expand=True, pady=(10, 0))

        self._value_var = tk.StringVar(value="0")
        tk.Label(
            top, textvariable=self._value_var,
            font=("Segoe UI", 40, "normal"),
            bg=THEME["display_bg"], fg=THEME["display_fg"],
            anchor="se", padx=18,
        ).pack(fill="x", expand=True, pady=(0, 8))

        grid = tk.Frame(self, bg=THEME["bg"])
        grid.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        # ── scientific section ──
        sci = tk.Frame(grid, bg=THEME["bg"])
        sci.pack(fill="x")

        sci_layout = [
            (0, 0, "MC",  "mem", "MC"),
            (0, 1, "MR",  "mem", "MR"),
            (0, 2, "M+",  "mem", "M+"),
            (0, 3, "M-",  "mem", "M-"),
            (0, 4, "(" ,  "sci", "("),
            (0, 5, ")" ,  "sci", ")"),
            (1, 0, "x\u00b2", "sci", "x\u00b2"),
            (1, 1, "\u221a",  "sci", "\u221a"),
            (1, 2, "x\u00b3", "sci", "x\u00b3"),
            (1, 3, "\u00b3\u221a", "sci", "\u00b3\u221a"),
            (1, 4, "x\u02b8", "sci", "x\u02b8"),
            (1, 5, "|x|", "sci", "|x|"),
            (2, 0, "sin", "sci", "sin"),
            (2, 1, "cos", "sci", "cos"),
            (2, 2, "tan", "sci", "tan"),
            (2, 3, "log", "sci", "log"),
            (2, 4, "ln",  "sci", "ln"),
            (2, 5, "e\u02e3", "sci", "e\u02e3"),
            (3, 0, "DEG", "sci", "DEG"),
            (3, 1, "\u03c0", "sci", "\u03c0"),
            (3, 2, "e",   "sci", "e"),
            (3, 3, "x!",  "sci", "!"),
            (3, 4, "10\u02e3", "sci", "10\u02e3"),
            (3, 5, "1/x", "sci", "1/x"),
        ]

        for r in range(4):
            sci.rowconfigure(r, weight=1, uniform="sci")
        for c in range(6):
            sci.columnconfigure(c, weight=1, uniform="sci")

        for row, col, text, kind, action in sci_layout:
            btn = self._mkbtn(sci, text, kind,
                              cmd=lambda a=action: self._press(a))
            btn.grid(row=row, column=col, sticky="nsew", padx=2, pady=2)

        sep = tk.Frame(grid, bg=THEME["bg"], height=3)
        sep.pack(fill="x")

        # ── basic section ──
        basic = tk.Frame(grid, bg=THEME["bg"])
        basic.pack(fill="both", expand=True)

        basic_layout = [
            (0, 0, "AC",  "func", "AC"),
            (0, 1, "\u00b1", "func", "\u00b1"),
            (0, 2, "%",   "func", "%"),
            (0, 3, "\u00f7", "op", "\u00f7"),
            (1, 0, "7",   "num",  "7"),
            (1, 1, "8",   "num",  "8"),
            (1, 2, "9",   "num",  "9"),
            (1, 3, "\u00d7", "op", "\u00d7"),
            (2, 0, "4",   "num",  "4"),
            (2, 1, "5",   "num",  "5"),
            (2, 2, "6",   "num",  "6"),
            (2, 3, "\u2212", "op", "\u2212"),
            (3, 0, "1",   "num",  "1"),
            (3, 1, "2",   "num",  "2"),
            (3, 2, "3",   "num",  "3"),
            (3, 3, "+",   "op",   "+"),
            (4, 0, "0",   "num",  "0"),
            (4, 1, "\u232b", "func", "\u232b"),
            (4, 2, ".",   "num",  "."),
            (4, 3, "=",   "equal", "="),
        ]

        for r in range(5):
            basic.rowconfigure(r, weight=1, uniform="basic")
        for c in range(4):
            basic.columnconfigure(c, weight=1, uniform="basic")

        for row, col, text, kind, action in basic_layout:
            btn = self._mkbtn(basic, text, kind,
                              cmd=lambda a=action: self._press(a))
            btn.grid(row=row, column=col, sticky="nsew", padx=2, pady=2)

        self._update_indicators()

    def _mkbtn(self, parent, text, kind, cmd=None):
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
        elif kind == "mem":
            bg = fg = THEME["memory_bg"]
            hov = THEME["memory_hover"]
            act = THEME["memory_bg"]
            border = THEME["border"]
        elif kind == "sci":
            bg, fg, hov, act = (THEME["sci_bg"], THEME["sci_fg"],
                                THEME["sci_hover"], THEME["sci_active"])
            border = THEME["border"]
        else:
            bg, fg, hov, act = (THEME["equal_bg"], THEME["equal_fg"],
                                THEME["equal_hover"], THEME["equal_active"])
            border = THEME["equal_active"]

        font_size = 16 if kind in ("num", "op", "func", "equal", "mem") else 13
        btn = tk.Button(
            parent, text=text,
            font=("Segoe UI", font_size, "normal"),
            bg=bg, fg=fg,
            activebackground=act, activeforeground=fg,
            bd=0, highlightthickness=1, highlightbackground=border,
            highlightcolor=border, relief="flat",
            cursor="hand2", command=cmd,
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
        self.bind("<Key-BackSpace>",lambda _: self._press("\u232b"))
        self.bind("<Key-Delete>",   lambda _: self._press("AC"))
        self.bind("<Key-percent>",  lambda _: self._press("%"))
        self.bind("<Key-parenleft>",lambda _: self._press("("))
        self.bind("<Key-parenright>",lambda _: self._press(")"))
        self.bind("<Key-s>",        lambda _: self._press("sin"))
        self.bind("<Key-S>",        lambda _: self._press("sin"))
        self.bind("<Key-c>",        lambda _: self._press("cos"))
        self.bind("<Key-C>",        lambda _: self._press("cos"))
        self.bind("<Key-t>",        lambda _: self._press("tan"))
        self.bind("<Key-T>",        lambda _: self._press("tan"))
        self.bind("<Key-l>",        lambda _: self._press("log"))
        self.bind("<Key-L>",        lambda _: self._press("log"))
        self.bind("<Key-n>",        lambda _: self._press("ln"))
        self.bind("<Key-N>",        lambda _: self._press("ln"))
        self.bind("<Key-p>",        lambda _: self._press("\u03c0"))
        self.bind("<Key-P>",        lambda _: self._press("\u03c0"))
        self.bind("<Key-e>",        lambda _: self._press("e"))
        self.bind("<Key-E>",        lambda _: self._press("e"))
        self.bind("<Key-r>",        lambda _: self._press("\u221a"))
        self.bind("<Key-R>",        lambda _: self._press("\u221a"))
        self.bind("<Key-q>",        lambda _: self._press("x\u00b2"))
        self.bind("<Key-Q>",        lambda _: self._press("x\u00b2"))

    # ── dispatch ────────────────────────────────────────────────────
    def _press(self, value):
        if self.error and value != "AC":
            return

        sci_dispatch = {
            "sin": self._scientific_op,  "cos": self._scientific_op,
            "tan": self._scientific_op,  "log": self._scientific_op,
            "ln":  self._scientific_op,  "e\u02e3": self._scientific_op,
            "\u221a": self._scientific_op,  "x\u00b2": self._scientific_op,
            "x\u00b3": self._scientific_op,  "\u00b3\u221a": self._scientific_op,
            "|x|": self._scientific_op,  "!": self._scientific_op,
            "10\u02e3": self._scientific_op,  "1/x": self._scientific_op,
            "MC": self._mc,  "MR": self._mr,
            "M+": self._m_plus,  "M-": self._m_minus,
        }

        if value in sci_dispatch:
            sci_dispatch[value](value)
            self._refresh()
            self._update_indicators()
            self.focus_set()
            return

        if value == "x\u02b8":
            self._operator("^")
            self._refresh()
            self.focus_set()
            return

        if value == "\u03c0":
            self._insert_pi()
            self._refresh()
            self.focus_set()
            return
        if value == "e":
            self._insert_e()
            self._refresh()
            self.focus_set()
            return

        if value == "DEG":
            self._toggle_angle_mode()
            self.focus_set()
            return

        if value in ("(", ")"):
            self.focus_set()
            return

        dispatch = {
            "AC": self._clear,  "\u00b1": self._negate,  "%": self._percent,
            "=": self._equals,  "+": self._operator,  "\u2212": self._operator,
            "\u00d7": self._operator,  "\u00f7": self._operator,
            ".": self._decimal,  "\u232b": self._backspace,
        }
        handler = dispatch.get(value)
        if handler:
            handler(value)
        else:
            self._digit(value)
        self._refresh()
        self.focus_set()

    # ── digit / decimal ────────────────────────────────────────────
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

    # ── operators ──────────────────────────────────────────────────
    OP_TEXT = {"^": "x\u02b8"}

    def _op_display(self, op):
        return self.OP_TEXT.get(op, op)

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
        self._expr_var.set(f"{self._fmt(self.operand)} {self._op_display(op)}")

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
        self._expr_var.set(
            f"{self._fmt(a)} {self._op_display(op)} {self._fmt(b)} ="
        )

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
            f"{self._fmt(a)} {self._op_display(self.last_op)} "
            f"{self._fmt(self.last_operand)} ="
        )

    # ── arithmetic core ────────────────────────────────────────────
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
            if op == "^":
                if b == Decimal("0"):
                    return Decimal("1")
                return a ** b
        except (Overflow, InvalidOperation):
            self._set_error("Overflow")
            return None
        except Exception:
            self._set_error("Error")
            return None
        return b

    # ── scientific ops ──────────────────────────────────────────────
    def _scientific_op(self, func_name):
        val = self._parse(self.display_text)
        if val is None:
            return
        old_text = self.display_text
        try:
            result = self._apply_scientific(func_name, val)
            if result is None:
                return
            self.display_text = self._fmt(result)
            self._expr_var.set(f"{func_name}({old_text}) = ")
            self.waiting = True
            self.just_calculated = True
        except Exception:
            self._set_error("Error")

    def _apply_scientific(self, func_name, val):
        fval = float(val)
        result = None
        try:
            if func_name == "sin":
                result = math.sin(math.radians(fval) if self.angle_mode == "DEG" else fval)
            elif func_name == "cos":
                result = math.cos(math.radians(fval) if self.angle_mode == "DEG" else fval)
            elif func_name == "tan":
                result = math.tan(math.radians(fval) if self.angle_mode == "DEG" else fval)
            elif func_name == "log":
                if fval <= 0: self._set_error("Invalid input"); return None
                result = math.log10(fval)
            elif func_name == "ln":
                if fval <= 0: self._set_error("Invalid input"); return None
                result = math.log(fval)
            elif func_name == "e\u02e3":
                result = math.exp(fval)
            elif func_name == "\u221a":
                if fval < 0: self._set_error("Invalid input"); return None
                result = math.sqrt(fval)
            elif func_name == "x\u00b2":
                result = fval ** 2
            elif func_name == "x\u00b3":
                result = fval ** 3
            elif func_name == "\u00b3\u221a":
                result = fval ** (1/3) if fval >= 0 else -((-fval) ** (1/3))
            elif func_name == "|x|":
                result = abs(fval)
            elif func_name == "!":
                if fval < 0 or fval > 100 or fval != int(fval):
                    self._set_error("Invalid input"); return None
                result = math.factorial(int(fval))
            elif func_name == "10\u02e3":
                result = 10 ** fval
            elif func_name == "1/x":
                if fval == 0: self._set_error("Cannot divide by zero"); return None
                result = 1.0 / fval
        except (OverflowError, ValueError):
            self._set_error("Overflow")
            return None
        if result is None:
            return None
        if abs(result) > 1e100:
            self._set_error("Overflow")
            return None
        return Decimal(f"{result:.15g}")

    # ── constants ──────────────────────────────────────────────────
    def _insert_pi(self):
        self.display_text = str(math.pi)
        self._expr_var.set("\u03c0")
        self.waiting = True
        self.just_calculated = True

    def _insert_e(self):
        self.display_text = str(math.e)
        self._expr_var.set("e")
        self.waiting = True
        self.just_calculated = True

    # ── angle mode ─────────────────────────────────────────────────
    def _toggle_angle_mode(self):
        self.angle_mode = "RAD" if self.angle_mode == "DEG" else "DEG"
        self._mode_var.set(self.angle_mode)
        self._update_indicators()

    # ── unary ops ───────────────────────────────────────────────────
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
        self._update_indicators()

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

    # ── memory ─────────────────────────────────────────────────────
    def _mc(self, _=None):
        self.memory = None
        self._update_indicators()

    def _mr(self, _=None):
        if self.memory is not None:
            self.display_text = self._fmt(self.memory)
            self._expr_var.set("MR")
            self.waiting = False
            self.just_calculated = False
            self._refresh()

    def _m_plus(self, _=None):
        val = self._parse(self.display_text)
        if val is not None:
            if self.memory is None:
                self.memory = val
            else:
                self.memory += val
            self._update_indicators()

    def _m_minus(self, _=None):
        val = self._parse(self.display_text)
        if val is not None:
            if self.memory is None:
                self.memory = -val
            else:
                self.memory -= val
            self._update_indicators()

    # ── display helpers ────────────────────────────────────────────
    def _update_indicators(self):
        self._mem_var.set("M" if self.memory is not None else "")
        self._mode_var.set(self.angle_mode)

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
            return ScientificCalculator._thousands(mant) + exp
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
