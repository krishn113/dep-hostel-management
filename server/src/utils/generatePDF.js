import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF(data, fileName) {

  const templatePath = path.join(__dirname,"../templates/guesthouse.ejs");
  const logoPath = path.join(process.cwd(), "public", "logo.png");

  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath, "base64")}`;


  const safeData = {
    guestName: "",
    gender: "",
    address: "",
    contactNumber: "",
    numGuests: "",
    numRooms: "",
    occupancyType: "",
    arrivalDate: "",
    departureDate: "",
    arrivalTime: "",
    departureTime: "",
    purpose: "",
    roomToBeBooked: "",
    paymentByGuest: "",
    applicantName: "",
    applicantDepartment: "",
    applicantEntryNo: "",
    applicantMobileNo: "",
    createdAt: new Date(),
    logoBase64,
    ...data
  };

  const html = await ejs.renderFile(templatePath, safeData);

  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const pdfPath = path.join(__dirname,`../pdf/${fileName}.pdf`);

  await page.pdf({
    path: pdfPath,
    format:"A4",
    printBackground:true
  });

  await browser.close();

  return pdfPath;
}

export default generatePDF;