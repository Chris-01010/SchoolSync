import os
import logging
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY")

def _send_email(to_email: str, subject: str, html: str):
    with httpx.Client() as client:
        response = client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "from": "onboarding@resend.dev",
                "to": to_email,
                "subject": subject,
                "html": html
            }
        )
        response.raise_for_status()
        return response.json()

def send_verification_email(to_email: str, college_id: str, token: str):
    verification_url = f"http://localhost:5173/verify-email?token={token}"
    try:
        _send_email(
            to_email=to_email,
            subject="Verify your SchoolSync account",
            html=f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a1a2e;">Welcome to SchoolSync!</h2>
                    <p>Hi <strong>{college_id}</strong>,</p>
                    <p>Please verify your email address by clicking the button below:</p>
                    <a href="{verification_url}" 
                       style="display: inline-block; background: #0051d5; color: white; 
                              padding: 12px 24px; border-radius: 8px; text-decoration: none;
                              font-weight: bold; margin: 16px 0;">
                        Verify Email
                    </a>
                    <p>This link expires in <strong>24 hours</strong>.</p>
                    <p>If you didn't create this account, ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                    <p style="color: #999; font-size: 12px;">SchoolSync — Modern School Administration</p>
                </div>
            """
        )
        logger.info(f"Verification email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send verification email to {to_email}: {e}")

def send_password_reset_email(to_email: str, college_id: str, token: str):
    reset_url = f"http://localhost:5173/reset-password?token={token}"
    try:
        _send_email(
            to_email=to_email,
            subject="Reset your SchoolSync password",
            html=f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a1a2e;">Password Reset Request</h2>
                    <p>Hi <strong>{college_id}</strong>,</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="{reset_url}"
                       style="display: inline-block; background: #0051d5; color: white;
                              padding: 12px 24px; border-radius: 8px; text-decoration: none;
                              font-weight: bold; margin: 16px 0;">
                        Reset Password
                    </a>
                    <p>This link expires in <strong>1 hour</strong>.</p>
                    <p>If you didn't request this, ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                    <p style="color: #999; font-size: 12px;">SchoolSync — Modern School Administration</p>
                </div>
            """
        )
        logger.info(f"Password reset email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {e}")
