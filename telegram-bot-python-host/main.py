#!/usr/bin/env python3
"""ROTH DIGITAL polling bot for Python-only hosts.

This standalone package intentionally uses only Python's standard library.
It never stores card codes, payment credentials, wallet private keys, or
customer order data. Fulfilment and approve/reject actions remain in the
protected ROTH DIGITAL website admin desk.
"""

from __future__ import annotations

import json
import os
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any


BOT_API = "https://api.telegram.org/bot{token}/{method}"
SUPPORT_HANDLE = "@the_stevenroths"


def env(name: str) -> str:
    return os.environ.get(name, "").strip()


def normalized_url(value: str) -> str:
    value = value.rstrip("/")
    if not value.startswith("https://"):
        raise RuntimeError("TELEGRAM_PUBLIC_URL must start with https://")
    return value


@dataclass(frozen=True)
class BotConfig:
    kind: str
    token: str
    public_url: str
    admin_chat_id: str


def telegram_request(token: str, method: str, payload: dict[str, Any]) -> Any:
    body = urllib.parse.urlencode(
        {
            key: json.dumps(value) if isinstance(value, (dict, list)) else str(value)
            for key, value in payload.items()
            if value is not None
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        BOT_API.format(token=token, method=method),
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=35) as response:
        data = json.loads(response.read().decode("utf-8"))
    if not data.get("ok"):
        raise RuntimeError(f"Telegram {method} failed")
    return data.get("result")


def send_message(token: str, chat_id: int, text: str, keyboard: list[list[dict[str, str]]] | None = None) -> None:
    payload: dict[str, Any] = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    if keyboard:
        payload["reply_markup"] = {"inline_keyboard": keyboard}
    telegram_request(token, "sendMessage", payload)


def answer_callback(token: str, callback_id: str) -> None:
    try:
        telegram_request(token, "answerCallbackQuery", {"callback_query_id": callback_id})
    except (RuntimeError, urllib.error.URLError):
        pass


def shop_keyboard(base_url: str) -> list[list[dict[str, str]]]:
    return [
        [{"text": "Open ROTH DIGITAL", "url": f"{base_url}/"}, {"text": "Fund wallet", "url": f"{base_url}/wallet#deposit"}],
        [{"text": "Browse catalog", "url": f"{base_url}/#catalog"}, {"text": "My account", "url": f"{base_url}/account"}],
        [{"text": "Support", "url": f"{base_url}/support"}],
    ]


def shop_catalog_message() -> str:
    return (
        "<b>ROTH DIGITAL</b>\n\n"
        "Browse live catalog routes on the website.\n\n"
        "<b>How checkout works</b>\n"
        "1. Browse products on the website.\n"
        "2. Fund your wallet using a Flipkart gift-card or crypto deposit request.\n"
        "3. Use wallet checkout for all cart items.\n"
        "4. Every credit and order stays under manual owner review.\n\n"
        "No direct product-payment address or automatic delivery is sent through this bot. Use /help for commands."
    )


def shop_help_message() -> str:
    return (
        "<b>ROTH DIGITAL shop help</b>\n\n"
        "/catalog — open live catalog routes\n"
        "/fund — open wallet funding\n"
        "/support — open support desk\n"
        "/order — learn where to view private order status\n\n"
        "For privacy, order status is visible only in the signed-in website account or an existing confirmation link."
    )


def admin_help_message(base_url: str) -> str:
    return (
        "<b>ROTH ADMIN BOT</b>\n\n"
        "/orders — open the protected order review desk\n"
        "/deposits — open the protected wallet review desk\n"
        "/menu — open the protected admin overview\n\n"
        "Approve only after independent verification. Product delivery remains owner-controlled and manual. "
        f"Support handle: {SUPPORT_HANDLE}"
    )


def admin_keyboard(base_url: str, section: str = "admin") -> list[list[dict[str, str]]]:
    route = {
        "orders": "/admin/payments",
        "deposits": "/admin/wallet",
        "admin": "/admin",
    }.get(section, "/admin")
    return [[{"text": "Open protected admin desk", "url": f"{base_url}{route}"}]]


def message_fields(update: dict[str, Any]) -> tuple[int | None, str, str | None]:
    message = update.get("message") or {}
    callback = update.get("callback_query") or {}
    callback_message = callback.get("message") or {}
    chat = message.get("chat") or callback_message.get("chat") or {}
    chat_id = chat.get("id")
    text = str(message.get("text") or "").strip()
    callback_id = callback.get("id")
    if callback.get("data"):
        text = str(callback["data"])
    return (int(chat_id) if isinstance(chat_id, int) else None, text, str(callback_id) if callback_id else None)


def handle_shop(config: BotConfig, update: dict[str, Any]) -> None:
    chat_id, text, callback_id = message_fields(update)
    if not chat_id:
        return
    if callback_id:
        answer_callback(config.token, callback_id)
    if text.startswith("/start") or text == "/catalog":
        send_message(config.token, chat_id, shop_catalog_message(), shop_keyboard(config.public_url))
        return
    if text == "/fund":
        send_message(
            config.token,
            chat_id,
            "Open Wallet to create a Flipkart or crypto funding request. Wallet credit is never automatic and requires manual review.",
            [[{"text": "Fund wallet", "url": f"{config.public_url}/wallet#deposit"}]],
        )
        return
    if text == "/order":
        send_message(
            config.token,
            chat_id,
            "For privacy, this bot does not look up order IDs sent in chat. Use your signed-in account desk or existing confirmation link.",
            [[{"text": "Open my account", "url": f"{config.public_url}/account"}]],
        )
        return
    if text == "/support":
        send_message(config.token, chat_id, f"Open the support desk for order-state help. Official Telegram support: {SUPPORT_HANDLE}", [[{"text": "Open support", "url": f"{config.public_url}/support"}]])
        return
    send_message(config.token, chat_id, shop_help_message(), shop_keyboard(config.public_url))


def handle_admin(config: BotConfig, update: dict[str, Any]) -> None:
    chat_id, text, callback_id = message_fields(update)
    if not chat_id or str(chat_id) != config.admin_chat_id:
        if callback_id:
            answer_callback(config.token, callback_id)
        return
    if callback_id:
        answer_callback(config.token, callback_id)
    if text in {"/start", "/menu"}:
        send_message(config.token, chat_id, admin_help_message(config.public_url), admin_keyboard(config.public_url))
        return
    if text == "/orders":
        send_message(config.token, chat_id, "Open the protected payment review desk. Approvals and manual delivery remain in the website admin panel.", admin_keyboard(config.public_url, "orders"))
        return
    if text == "/deposits":
        send_message(config.token, chat_id, "Open the protected wallet review desk. Verify each request independently before crediting a wallet.", admin_keyboard(config.public_url, "deposits"))
        return
    send_message(config.token, chat_id, admin_help_message(config.public_url), admin_keyboard(config.public_url))


def poll(config: BotConfig, handler) -> None:
    offset: int | None = None
    print(f"[telegram.{config.kind}] polling started", flush=True)
    while True:
        try:
            updates = telegram_request(config.token, "getUpdates", {"timeout": 25, "offset": offset, "allowed_updates": ["message", "callback_query"]}) or []
            for update in updates:
                update_id = update.get("update_id")
                if isinstance(update_id, int):
                    offset = update_id + 1
                handler(config, update)
        except KeyboardInterrupt:
            raise
        except Exception as exc:  # keep a transient Telegram error from killing the host process
            print(f"[telegram.{config.kind}] polling error: {type(exc).__name__}", file=sys.stderr, flush=True)
            time.sleep(5)


def main() -> int:
    if env("TELEGRAM_POLLING_ENABLED") != "1":
        print("Polling remains disabled. Set TELEGRAM_POLLING_ENABLED=1 in the host secret panel to start intentionally.")
        return 0
    public_url = normalized_url(env("TELEGRAM_PUBLIC_URL"))
    admin_chat_id = env("TELEGRAM_ADMIN_CHAT_ID")
    shop_token = env("TELEGRAM_SHOP_BOT_TOKEN")
    admin_token = env("TELEGRAM_ADMIN_BOT_TOKEN")
    if not admin_chat_id or not shop_token or not admin_token:
        raise RuntimeError("Missing required Telegram host secrets. See README.md; do not add secrets to this file.")
    shop = BotConfig("shop", shop_token, public_url, admin_chat_id)
    admin = BotConfig("admin", admin_token, public_url, admin_chat_id)
    threads = [threading.Thread(target=poll, args=(shop, handle_shop), daemon=True)]
    if admin_token == shop_token:
        print("Shop and admin tokens match; run separate bot tokens for isolated command handling.", file=sys.stderr)
    else:
        threads.append(threading.Thread(target=poll, args=(admin, handle_admin), daemon=True))
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(0)
    except Exception as exc:
        print(f"Startup failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
