import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Resend } from "resend";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emailsDir = path.join(__dirname, "..", "emails");

const resend = new Resend(process.env.RESEND_API_KEY);

function renderTemplate(templateName, variables) {
    const filePath = path.join(emailsDir, `${templateName}.html`);
    let html = readFileSync(filePath, "utf-8");

    for (const [key, value] of Object.entries(variables)) {
        html = html.replaceAll(`{{${key}}}`, value);
    }

    return html;
}

async function sendEmail({ to, subject, html }) {
    if (process.env.EMAIL_SENDING_ENABLED !== "true") {
        console.log(`Email sending disabled, skipping "${subject}" to ${to}`);
        return;
    }

    const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
    });

    if (error) {
        throw new Error(`Resend failed to send "${subject}" to ${to}: ${error.message}`);
    }
}

export async function sendOnboardingEmail(user) {
    const html = renderTemplate("onboarding", {
        firstName: user.name?.split(" ")[0] || "there",
        email: user.email,
        dashboardUrl: `${process.env.FRONTEND_URL}/`,
    });

    await sendEmail({
        to: user.email,
        subject: "Welcome to TransitOps",
        html,
    });
}

export async function sendVerificationEmail(user, verificationUrl) {
    const html = renderTemplate("verify-email", {
        firstName: user.name?.split(" ")[0] || "there",
        email: user.email,
        verificationUrl,
    });

    await sendEmail({
        to: user.email,
        subject: "Verify your TransitOps email",
        html,
    });
}
