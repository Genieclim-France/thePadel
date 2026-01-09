export const prerender = false;
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validation des champs requis
    if (!body.email || !body.name || !body.demand || !body.details) {
      return new Response(
        JSON.stringify({ success: false, error: "Champs manquants" }),
        { status: 400 }
      );
    }

    const payload = {
      sender: {
        email: import.meta.env.BREVO_EMAIL,
        name: "The Padel - Formulaire Contact",
      },
      replyTo: {
        email: body.email,
        name: body.name,
      },
      to: [{ email: import.meta.env.BREVO_EMAIL, name: "The Padel" }],
      subject: `Contact The Padel : ${body.demand}`,
      htmlContent: `
        <div style="background:#f6f8fa;padding:40px 0;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,138,239,0.08);padding:32px 28px;font-family:'Raleway',Arial,sans-serif;">
            <h2 style="color:#008AEF;font-size:24px;margin-bottom:16px;font-weight:800;letter-spacing:1px;">Nouvelle demande de contact</h2>
            <table style="width:100%;font-size:16px;color:#222;margin-bottom:24px;">
              <tr><td style="font-weight:600;padding:8px 0;width:140px;">Nom/Prénom :</td><td>${
                body.name
              }</td></tr>
              <tr><td style="font-weight:600;padding:8px 0;">Email :</td><td>${
                body.email
              }</td></tr>
              <tr><td style="font-weight:600;padding:8px 0;">Téléphone :</td><td>${
                body.phone || "Non renseigné"
              }</td></tr>
              <tr><td style="font-weight:600;padding:8px 0;">Demande :</td><td>${
                body.demand
              }</td></tr>
              <tr><td style="font-weight:600;padding:8px 0;vertical-align:top;">Précisions :</td><td>${body.details.replace(
                /\n/g,
                "<br>"
              )}</td></tr>
            </table>
            <div style="text-align:center;margin-top:32px;">
              <img src="https://thepadel.fr/logo-color.svg" alt="The Padel" style="height:48px;margin-bottom:8px;"/>
              <div style="color:#008AEF;font-weight:700;font-size:18px;">The Padel</div>
              <div style="color:#888;font-size:14px;">Contact reçu depuis le site web</div>
            </div>
          </div>
        </div>
      `,
    };

    console.log("Envoi email vers Brevo:", {
      to: import.meta.env.BREVO_EMAIL,
      replyTo: body.email,
      subject: payload.subject,
    });

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": import.meta.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json();

    if (res.ok) {
      console.log("Email envoyé avec succès:", responseData);
      return new Response(
        JSON.stringify({ success: true, messageId: responseData.messageId }),
        {
          status: 200,
        }
      );
    } else {
      console.error("Erreur Brevo:", res.status, responseData);
      return new Response(
        JSON.stringify({
          success: false,
          error: responseData,
          status: res.status,
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      }),
      { status: 500 }
    );
  }
};
