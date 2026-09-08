const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendSuggestionReceivedMail = async (email, name, word) => {
  const displayName = name || "സുഹൃത്തേ";

  await transporter.sendMail({
    from: '"ഭാഷാമിത്രം" <cditresearch@gmail.com>',
    to: email,
    subject: "നിങ്ങളുടെ സംഭാവനയ്ക്ക് നന്ദി! - ഭാഷാമിത്രം",
    html: `
      <div style="background-color: #121212; padding: 30px 15px; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 16px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);">
        
        <!-- Header Gradient Banner -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%); padding: 35px 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">നിങ്ങളുടെ സംഭാവനയ്ക്ക് നന്ദി!</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #E0E7FF; opacity: 0.9;">ഭാഷാമിത്രം കുടുംബത്തിന്റെ ഭാഗമായതിന്</p>
        </div>

        <!-- Content Area -->
        <div style="padding: 0 10px;">
          <p style="font-size: 16px; font-weight: 700; color: #818CF8; margin-bottom: 18px;">പ്രിയ ${displayName},</p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #D1D5DB; margin-bottom: 16px;">
            ഭാഷാമിത്രം നിഘണ്ടുവിലേക്ക് ഒരു പുതിയ പദം (<strong>"${word}"</strong>) നിർദ്ദേശിച്ചതിന് ഹൃദയപൂർവ്വം നന്ദി. നിങ്ങളുടെ സംഭാവന ഞങ്ങളുടെ ഭാഷയെ സമ്പന്നമാക്കാൻ സഹായിക്കുന്നു.
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #D1D5DB; margin-bottom: 24px;">
            നിങ്ങളുടെ നിർദ്ദേശം ഞങ്ങളുടെ ടീം ഉടൻ തന്നെ പരിശോധിക്കും. അത് അംഗീകരിക്കപ്പെട്ടാൽ, നിങ്ങളെ അറിയിക്കുന്നതായിരിക്കും.
          </p>

          <!-- Status Box -->
          <div style="background-color: #062f1c; border: 1px solid #16a34a; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #4ade80; display: flex; align-items: center; gap: 8px;">
              ✨ നിങ്ങളുടെ സംഭാവന പ്രക്രിയ
            </h3>
            <ul style="margin: 0; padding-left: 0; list-style-type: none; font-size: 13px; color: #D1D5DB; line-height: 1.8;">
              <li style="margin-bottom: 4px;">• നിർദ്ദേശം സ്വീകരിച്ചു ✓</li>
              <li style="margin-bottom: 4px;">• പരിശോധനയ്ക്കായി കാത്തിരിക്കുന്നു ⏳</li>
              <li>• അംഗീകരണ ഫലം അറിയിക്കുന്നതായിരിക്കും ✉️</li>
            </ul>
          </div>

          <!-- Notice Box -->
          <div style="background-color: #2b1f03; border: 1px solid #ca8a04; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
            <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #facc15;">
              💡 നിങ്ങൾ അറിഞ്ഞിരിക്കേണ്ടത്
            </h3>
            <p style="margin: 0; font-size: 13px; color: #E5E7EB; line-height: 1.6;">
              നിങ്ങളുടെ സംഭാവന ഭാഷാമിത്രം നിഘണ്ടുവിന്റെ വിസ്തൃതിയിൽ സഹായിക്കുന്നു. ഓരോ പദവും ഭാഷയുടെ സമ്പത്ത് വർദ്ധിപ്പിക്കുന്നു.
            </p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://shabdatharavalidemo.cditonline.org/" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%); color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);">
              🌐 ഭാഷാമിത്രം സന്ദർശിക്കുക
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #1F2937; margin-bottom: 24px;" />

          <!-- Sign-off -->
          <div style="text-align: center; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #9CA3AF;">സ്നേഹത്തോടെ,</p>
            <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: bold; color: #818CF8;">ഭാഷാമിത്രം ടീം</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #6B7280; font-style: italic;">ഭാഷയെ സംരക്ഷിക്കുന്നതിനും സമ്പന്നമാക്കുന്നതിനും</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 11px; color: #4B5563; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">&copy; 2026 ഭാഷാമിത്രം. എല്ലാ അവകാശങ്ങളും സംരക്ഷിക്കപ്പെട്ടു.</p>
            <p style="margin: 0;">ഇതൊരു സ്വയമേവയുള്ള സന്ദേശമാണ്. ദയവായി ഈ ഇമെയിലിന് മറുപടി നൽകരുത്.</p>
          </div>
        </div>

      </div>
    `
  });
};

module.exports = {
  sendSuggestionReceivedMail
};