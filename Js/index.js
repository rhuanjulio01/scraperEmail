require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");

async function scrapG1() {
  const response = await axios.get("https://g1.globo.com/");
  const $ = cheerio.load(response.data);

  const noticias = [];

  $("a.feed-post-link").slice(0, 5).each((i, elem) => {
    const titulo = $(elem).text().trim();
    const link = $(elem).attr("href");
    noticias.push(`${titulo} - ${link}`);
  });

  return noticias;
}

async function enviarEmail(noticias) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Bot de Notícias" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: "Top 5 notícias do G1",
    text: noticias.join("\n\n"),
  });

  console.log("✅ E-mail enviado:", info.messageId);
}

async function main() {
  try {
    const noticias = await scrapG1();
    await enviarEmail(noticias);
  } catch (err) {
    console.error("❌ Erro:", err);
  }
}

main();