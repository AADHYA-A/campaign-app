"""
notification_service.py — Free-tier Email & WhatsApp Notification Service
─────────────────────────────────────────────────────────────────────────────
Email  : Resend API (https://resend.com) — Free: 3,000 emails/month, 100/day
         No credit card required for the free plan.

WhatsApp: CallMeBot API (https://www.callmebot.com/blog/free-api-whatsapp-messages/)
          100% free, no Meta Business account needed.
          Recipients must activate once by messaging +34 644 81 31 64

Usage:
    from app.services.notification_service import notification_service

    # Send email
    result = await notification_service.send_email(
        to="user@example.com",
        subject="Campaign Update",
        html_body="<h1>Hello!</h1><p>Your campaign is live.</p>",
    )

    # Send WhatsApp
    result = await notification_service.send_whatsapp(
        phone="+919810123456",
        message="Campaign launched successfully!",
        apikey="123456",   # recipient's CallMeBot API key
    )
"""
import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Optional, Dict, Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Email — Multi-Provider (Resend API + Direct SMTP/Gmail)
# ─────────────────────────────────────────────────────────────────────────────

class SmtpEmailService:
    """
    Sends transactional emails via direct SMTP (e.g. Gmail, Outlook, Amazon SES SMTP).
    Zero external SaaS accounts required if using Gmail App Password.
    """

    def _sync_send(
        self,
        recipients: list[str],
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        host = settings.SMTP_HOST or "smtp.gmail.com"
        port = settings.SMTP_PORT or 587
        user = settings.SMTP_USER
        password = settings.SMTP_PASSWORD
        sender_email = from_email or settings.SMTP_FROM_EMAIL or user
        sender_name = from_name or settings.SMTP_FROM_NAME or "Campaign Hub"

        if not user or not password:
            return {
                "success": False,
                "error": "SMTP_USER or SMTP_PASSWORD not configured.",
                "to": recipients,
            }

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = formataddr((sender_name, sender_email))
        msg["To"] = ", ".join(recipients)

        if text_body:
            msg.attach(MIMEText(text_body, "plain", "utf-8"))
        if html_body:
            msg.attach(MIMEText(html_body, "html", "utf-8"))

        try:
            with smtplib.SMTP(host, port, timeout=15.0) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                server.login(user, password)
                server.send_message(msg)

            logger.info(f"Email sent via SMTP to {recipients}")
            return {
                "success": True,
                "provider": f"SMTP ({host})",
                "to": recipients,
                "subject": subject,
            }
        except Exception as exc:
            logger.error(f"SMTP send failed: {exc}")
            return {
                "success": False,
                "error": str(exc),
                "to": recipients,
            }

    async def send(
        self,
        to: str | list[str],
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        recipients = [to] if isinstance(to, str) else to
        return await asyncio.to_thread(
            self._sync_send,
            recipients=recipients,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
            from_email=from_email,
            from_name=from_name,
        )


class ResendEmailService:
    """
    Sends transactional emails via Resend's REST API or Direct SMTP.
    Docs: https://resend.com/docs/api-reference/emails/send-email
    """

    RESEND_API_URL = "https://api.resend.com/emails"

    def __init__(self):
        self.smtp = SmtpEmailService()

    async def send(
        self,
        to: str | list[str],
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send an email via Resend API (if configured) or Direct SMTP / Gmail (if configured).
        Gracefully degrades with informative warning if neither is set.
        """
        recipients = [to] if isinstance(to, str) else to

        # 1. Prefer Direct SMTP / Gmail if credentials provided
        if settings.SMTP_USER and settings.SMTP_PASSWORD and not settings.SMTP_PASSWORD.startswith("your_"):
            return await self.smtp.send(
                to=recipients,
                subject=subject,
                html_body=html_body,
                text_body=text_body,
                from_email=from_email,
                from_name=from_name,
            )

        # 2. Check Resend API
        api_key = settings.RESEND_API_KEY
        if not api_key or api_key.startswith("re_your_"):
            logger.warning(
                "Neither RESEND_API_KEY nor SMTP credentials configured. Email not sent. "
                "Configure RESEND_API_KEY or SMTP_USER/SMTP_PASSWORD in backend/.env."
            )
            return {
                "success": False,
                "simulated": True,
                "warning": "Email credentials not set — email delivery is simulated. Set RESEND_API_KEY or SMTP_USER/SMTP_PASSWORD in backend/.env.",
                "to": recipients,
                "subject": subject,
            }

        from_email = from_email or settings.RESEND_FROM_EMAIL
        from_name = from_name or settings.RESEND_FROM_NAME
        from_field = f"{from_name} <{from_email}>" if from_name else from_email

        payload: Dict[str, Any] = {
            "from": from_field,
            "to": recipients,
            "subject": subject,
            "html": html_body,
        }
        if text_body:
            payload["text"] = text_body

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    self.RESEND_API_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )

            if resp.status_code in (200, 201):
                data = resp.json()
                logger.info(f"Email sent via Resend to {recipients}: id={data.get('id')}")
                return {
                    "success": True,
                    "message_id": data.get("id"),
                    "to": recipients,
                    "subject": subject,
                    "provider": "Resend",
                }
            else:
                error_body = resp.text
                logger.error(f"Resend API error {resp.status_code}: {error_body}")
                return {
                    "success": False,
                    "error": f"Resend API returned {resp.status_code}: {error_body}",
                    "to": recipients,
                }

        except httpx.RequestError as exc:
            logger.error(f"Resend HTTP request failed: {exc}")
            return {
                "success": False,
                "error": f"Network error: {exc}",
                "to": recipients,
            }


    async def send_campaign_notification(
        self,
        to: str,
        recipient_name: str,
        campaign_title: str,
        campaign_content: str,
        translated_content: Optional[str] = None,
        target_language: Optional[str] = None,
        custom_subject: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a styled campaign awareness email to a recipient with multilingual support."""
        translated_section = ""
        if translated_content:
            lang_label = target_language or "Translated Language"
            translated_section = f"""
            <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="color:#34d399;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;font-weight:700;">🌐 Regional Content ({lang_label})</p>
              <p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0;">{translated_content}</p>
            </div>
            """

        html_body = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1e1b4b,#1e293b);border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.25);box-shadow:0 20px 40px rgba(0,0,0,0.4);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
              <div style="display:inline-block;padding:4px 12px;background:rgba(255,255,255,0.18);border-radius:20px;color:#fff;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">📢 Campaign Awareness Broadcast</div>
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.03em;">🌐 Campaign Hub</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Multilingual Communication & Awareness Engine</p>
            </div>
            <!-- Body -->
            <div style="padding:32px;">
              <p style="color:#94a3b8;font-size:14px;margin:0 0 4px;">Hello</p>
              <h2 style="color:#e2e8f0;font-size:20px;margin:0 0 24px;font-weight:700;">{recipient_name}</h2>
              <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:24px;margin-bottom:20px;">
                <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;font-weight:600;">Campaign Subject</p>
                <h3 style="color:#c7d2fe;font-size:18px;margin:0 0 16px;font-weight:700;">{campaign_title}</h3>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0;">{campaign_content}</p>
              </div>
              {translated_section}
              <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px dashed rgba(255,255,255,0.1);text-align:center;">
                <p style="color:#64748b;font-size:12px;margin:0;">
                  This is a real-time awareness update dispatched directly to your inbox.
                </p>
              </div>
            </div>
            <!-- Footer -->
            <div style="background:rgba(0,0,0,0.3);padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="color:#64748b;font-size:12px;margin:0 0 4px;">Powered by <strong>Campaign Hub</strong></p>
              <p style="color:#475569;font-size:11px;margin:0;">Real-time Campaign Awareness Notification</p>
            </div>
          </div>
        </body>
        </html>
        """
        subject = custom_subject or f"📢 Campaign Awareness: {campaign_title}"
        return await self.send(
            to=to,
            subject=subject,
            html_body=html_body,
        )



# ─────────────────────────────────────────────────────────────────────────────
# WhatsApp — CallMeBot
# ─────────────────────────────────────────────────────────────────────────────

class CallMeBotWhatsAppService:
    """
    Sends WhatsApp messages via the CallMeBot free API.
    Docs: https://www.callmebot.com/blog/free-api-whatsapp-messages/

    HOW TO ACTIVATE (one-time per recipient):
      1. Open WhatsApp and send a message to: +34 644 81 31 64
         Message text: "I allow callmebot to send me messages"
      2. You will receive your personal API key back in ~2 minutes.
      3. Use that API key in the `apikey` parameter.
    """

    CALLMEBOT_API_URL = "https://api.callmebot.com/whatsapp.php"

    async def send(
        self,
        phone: str,
        message: str,
        apikey: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send a WhatsApp message via CallMeBot.

        Args:
            phone:   Recipient phone number with country code (e.g. +919810123456)
            message: Text message to send (max ~4096 chars)
            apikey:  Recipient's CallMeBot API key (falls back to CALLMEBOT_DEFAULT_APIKEY)

        Returns a dict with keys: success (bool), error (if any).
        Gracefully degrades if keys are not set.
        """
        apikey = apikey or settings.CALLMEBOT_DEFAULT_APIKEY
        if not apikey or apikey == "your_callmebot_apikey_here":
            logger.warning(
                "CALLMEBOT_DEFAULT_APIKEY not configured. WhatsApp not sent. "
                "Activate by messaging +34 644 81 31 64 on WhatsApp."
            )
            return {
                "success": False,
                "simulated": True,
                "warning": "CALLMEBOT_DEFAULT_APIKEY not set — WhatsApp delivery is simulated.",
                "phone": phone,
            }

        if not phone or phone == "+91XXXXXXXXXX":
            logger.warning("No valid phone number provided for WhatsApp message.")
            return {
                "success": False,
                "simulated": True,
                "warning": "No valid phone number provided.",
                "phone": phone,
            }

        # Clean phone: remove spaces, ensure + prefix
        phone_clean = phone.replace(" ", "").replace("-", "")
        if not phone_clean.startswith("+"):
            phone_clean = "+" + phone_clean

        # URL-encode the message
        try:
            from urllib.parse import quote
            encoded_msg = quote(message)

            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    self.CALLMEBOT_API_URL,
                    params={
                        "phone": phone_clean,
                        "text": message,
                        "apikey": apikey,
                    },
                )

            response_text = resp.text.strip()

            if resp.status_code == 200 and ("Message queued" in response_text or "OK" in response_text or len(response_text) > 0):
                logger.info(f"WhatsApp message sent via CallMeBot to {phone_clean}")
                return {
                    "success": True,
                    "phone": phone_clean,
                    "provider": "CallMeBot",
                    "response": response_text,
                }
            else:
                logger.error(f"CallMeBot error {resp.status_code}: {response_text}")
                return {
                    "success": False,
                    "error": f"CallMeBot returned {resp.status_code}: {response_text}",
                    "phone": phone_clean,
                }

        except httpx.RequestError as exc:
            logger.error(f"CallMeBot HTTP request failed: {exc}")
            return {
                "success": False,
                "error": f"Network error: {exc}",
                "phone": phone,
            }

    async def send_campaign_notification(
        self,
        phone: str,
        recipient_name: str,
        campaign_title: str,
        campaign_content: str,
        apikey: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a formatted campaign WhatsApp message."""
        # CallMeBot supports basic text only (no HTML)
        message = (
            f"📢 *Campaign Hub*\n\n"
            f"Hello {recipient_name}! 👋\n\n"
            f"*{campaign_title}*\n\n"
            f"{campaign_content}\n\n"
            f"_Sent via Campaign Hub_"
        )
        return await self.send(phone=phone, message=message, apikey=apikey)


# ─────────────────────────────────────────────────────────────────────────────
# Unified Notification Service
# ─────────────────────────────────────────────────────────────────────────────

class NotificationService:
    """
    Unified service for sending Email and WhatsApp notifications.
    Wraps Resend (email) and CallMeBot (WhatsApp).
    """

    def __init__(self):
        self.email = ResendEmailService()
        self.whatsapp = CallMeBotWhatsAppService()

    async def send_email(
        self,
        to: str | list[str],
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send an email via Resend (free tier)."""
        return await self.email.send(
            to=to,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
        )

    async def send_whatsapp(
        self,
        phone: str,
        message: str,
        apikey: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a WhatsApp message via CallMeBot (free)."""
        return await self.whatsapp.send(
            phone=phone,
            message=message,
            apikey=apikey,
        )

    async def send_campaign_to_recipient(
        self,
        recipient_name: str,
        email: Optional[str],
        phone: Optional[str],
        campaign_title: str,
        campaign_content: str,
        channels: list[str],
        callmebot_apikey: Optional[str] = None,
        translated_content: Optional[str] = None,
        target_language: Optional[str] = None,
        custom_subject: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send campaign notifications across selected channels for a single recipient.
        Returns a summary dict with per-channel results.
        """
        results: Dict[str, Any] = {}

        if "email" in channels and email:
            results["email"] = await self.email.send_campaign_notification(
                to=email,
                recipient_name=recipient_name,
                campaign_title=campaign_title,
                campaign_content=campaign_content,
                translated_content=translated_content,
                target_language=target_language,
                custom_subject=custom_subject,
            )

        if "whatsapp" in channels and phone:
            results["whatsapp"] = await self.whatsapp.send_campaign_notification(
                phone=phone,
                recipient_name=recipient_name,
                campaign_title=campaign_title,
                campaign_content=campaign_content,
                apikey=callmebot_apikey,
            )

        return results


# Module-level singleton
notification_service = NotificationService()
