"""
Renders HTML email templates by substituting {{variable}} placeholders.
Keeps zero dependencies — no Jinja2 needed.
Swap this for Jinja2 later if templates grow complex.
"""
import os
from pathlib import Path

TEMPLATES_DIR = Path(__file__).parent


def render_email(template_name: str, context: dict) -> str:
    path = TEMPLATES_DIR / f"{template_name}.html"
    if not path.exists():
        # Fallback: plain text
        return f"<p>{'<br>'.join(f'{k}: {v}' for k, v in context.items())}</p>"

    html = path.read_text(encoding="utf-8")
    for key, value in context.items():
        html = html.replace(f"{{{{{key}}}}}", str(value))
    return html
