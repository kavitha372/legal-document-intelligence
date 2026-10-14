/**
 * Generates minimal valid text-based PDFs for demo/testing without external dependencies.
 * These are synthetic educational documents — not real legal agreements.
 * Run after npm install: npx ts-node src/utils/generateSamplePdfs.ts
 */
import fs from 'fs';
import path from 'path';

interface PdfPage { text: string; }

/**
 * Build a minimal valid PDF 1.4 file with plain text content.
 * Each page uses Courier font for clean extraction.
 */
function buildPdf(pages: PdfPage[]): Buffer {
  // All content in a single string, then convert to Buffer at the end
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  let objectCount = 0;

  const addObject = (id: number, content: string): string => {
    const obj = `${id} 0 obj\n${content}\nendobj\n`;
    offsets[id] = Buffer.byteLength(pdf, 'latin1');
    pdf += obj;
    if (id > objectCount) objectCount = id;
    return obj;
  };

  // Build page stream objects
  const pageObjIds: number[] = [];
  let nextId = 4; // 1=catalog,2=pages,3=font

  for (let i = 0; i < pages.length; i++) {
    const lines = pages[i].text.split('\n');
    // Build stream content — escape PDF special chars
    const textOps = lines.map(line => {
      const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      return `(${escaped}) Tj T*`;
    }).join('\n');

    const stream = `BT\n/F1 9 Tf\n50 800 Td\n11 TL\n${textOps}\nET`;
    const streamLen = Buffer.byteLength(stream, 'latin1');

    const streamId = nextId++;
    offsets[streamId] = Buffer.byteLength(pdf, 'latin1');
    pdf += `${streamId} 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`;
    if (streamId > objectCount) objectCount = streamId;

    const pageId = nextId++;
    offsets[pageId] = Buffer.byteLength(pdf, 'latin1');
    pdf += `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /Contents ${streamId} 0 R /Resources << /Font << /F1 3 0 R >> >> /MediaBox [0 0 595 842] >>\nendobj\n`;
    if (pageId > objectCount) objectCount = pageId;

    pageObjIds.push(pageId);
  }

  // Object 3: Font
  addObject(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');

  // Object 2: Pages
  const kidsStr = pageObjIds.map(id => `${id} 0 R`).join(' ');
  addObject(2, `<< /Type /Pages /Kids [${kidsStr}] /Count ${pages.length} >>`);

  // Object 1: Catalog
  addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');

  // Cross-reference table
  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  const total = objectCount + 1;

  let xref = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) {
    const off = offsets[i] ?? 0;
    xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  }

  pdf += xref;
  pdf += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

const SAMPLES_DIR = path.join(__dirname, '../../../sample_documents');

if (!fs.existsSync(SAMPLES_DIR)) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
}

const documents = [
  {
    filename: 'sample_service_agreement.pdf',
    pages: [
      `SAMPLE SERVICE AGREEMENT
[SYNTHETIC EDUCATIONAL DOCUMENT - NOT A REAL LEGAL AGREEMENT]

PARTIES
This Service Agreement (the Agreement) is entered into as of
January 15, 2026 (the Effective Date) between TechServe Solutions
Ltd, a company incorporated under the laws of England and Wales
(the Provider), and Acme Manufacturing Corp, a corporation
organized under Delaware USA law (the Client). Together the
Provider and the Client are referred to as the Parties.

SERVICES
The Provider agrees to provide cloud infrastructure management,
software development, and technical support services. The Provider
shall deliver services with reasonable care and skill consistent
with industry standards applicable to such services.`,

      `TERM AND DURATION
This Agreement shall commence on the Effective Date and continue
for an initial term of twelve (12) months. Upon expiration of the
Initial Term this Agreement shall automatically renew for
successive one-year periods unless either Party provides sixty
(60) days written notice of non-renewal prior to the end of the
then-current term. The commencement date of the Initial Term is
the Effective Date stated above.

FEES AND PAYMENT
In consideration for the Services the Client shall pay the
Provider a monthly retainer of USD 15,000 payable within thirty
(30) days of invoice date. Late payments shall accrue interest
at 1.5 percent per month.`,

      `CONFIDENTIALITY
Each Party agrees to keep strictly confidential all Confidential
Information of the other Party disclosed under this Agreement.
Confidential Information means any non-public information
including trade secrets, business plans, technical data, customer
lists, and financial information. The receiving Party shall not
disclose such Confidential Information to any third party without
prior written consent. This non-disclosure confidentiality
obligation shall survive termination of this Agreement for a
period of three (3) years. Each Party shall implement reasonable
technical and organisational measures to protect Confidential
Information from unauthorized access or disclosure.`,

      `TERMINATION
Either Party may terminate this Agreement upon sixty (60) days
written notice of termination to the other Party. Either Party
may terminate this Agreement immediately upon written notice if
the other Party commits a material breach and fails to remedy
such breach within thirty (30) days of receiving written notice
specifying the breach, or becomes insolvent or enters into
administration or any analogous insolvency proceeding, or ceases
to carry on business. Upon termination or expiry all outstanding
fees shall become immediately due and payable.

GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by and construed in accordance
with the laws of England and Wales. Any dispute arising out of
or in connection with this Agreement shall be subject to the
exclusive jurisdiction of the courts of England and Wales.`,

      `LIMITATION OF LIABILITY
To the maximum extent permitted by applicable law neither Party
shall be liable to the other for any indirect incidental special
consequential or punitive damages. Each Party total aggregate
liability shall not exceed the total fees paid or payable in the
twelve (12) months preceding the claim.

SIGNATURES
IN WITNESS WHEREOF the Parties have executed this Agreement as
of the Effective Date. Signed by duly authorized representatives.

For TechServe Solutions Ltd:
____________________________  Date: ____________
Name: Jane Smith
Title: Chief Executive Officer

For Acme Manufacturing Corp:
____________________________  Date: ____________
Name: John Doe
Title: Vice President Operations

[END OF SYNTHETIC SAMPLE DOCUMENT - EDUCATIONAL DEMONSTRATION ONLY]`,
    ],
  },
  {
    filename: 'sample_software_subscription_agreement.pdf',
    pages: [
      `SAMPLE SOFTWARE SUBSCRIPTION AGREEMENT
[SYNTHETIC EDUCATIONAL DOCUMENT - NOT A REAL LEGAL AGREEMENT]

PARTIES
This Software Subscription Agreement (the Agreement) is entered
into as of March 1, 2026 (Effective Date) between CloudSoft
Technologies Inc, a corporation organized under California law
(Licensor), and DataVault Financial Services LLC, a limited
liability company organized under New York law (Licensee). The
Licensor and Licensee are each a Party and collectively the
Parties. This Agreement governs Licensee access to the Licensor
proprietary software platform.

SUBSCRIPTION AND LICENSE
Subject to the terms of this Agreement and timely payment of all
subscription fees, the Licensor grants the Licensee a limited
non-exclusive non-transferable revocable licence to access and
use the CloudSoft Analytics Platform solely for internal business
purposes during the Subscription Term.`,

      `SUBSCRIPTION TERM AND RENEWAL
The initial subscription term shall commence on the Effective
Date and expire on February 28, 2027 (Initial Subscription
Term). The commencement date of each subsequent renewal term
shall be the day following expiration of the prior term. This
Agreement shall automatically renew for successive one-year
periods unless either Party provides ninety (90) days written
notice of non-renewal before the end of the then-current term.

SUBSCRIPTION FEES
The Licensee shall pay the Licensor an annual subscription fee
of USD 48,000 payable in advance on or before the first day of
each subscription year. Overdue amounts shall accrue interest
at 2 percent per month. All fees are non-refundable.`,

      `CONFIDENTIAL INFORMATION AND NON-DISCLOSURE
The Parties acknowledge that in the course of this Agreement
each may disclose confidential and proprietary information to
the other. Each Party agrees to hold the other Party Confidential
Information in strict confidence, not to use Confidential
Information except as necessary to perform obligations under this
Agreement, and not to disclose Confidential Information to any
third party without prior written consent of the disclosing Party
except to employees or contractors bound by equivalent
confidentiality obligations. The non-disclosure obligations
shall survive termination of this Agreement for five (5) years.`,

      `TERMINATION
Either Party may terminate this Agreement by providing sixty
(60) days written notice of termination to the other Party. The
Licensor may terminate this Agreement immediately upon written
notice if the Licensee breaches any payment obligation and fails
to cure within ten (10) days of written notice, or violates the
licence restrictions, or becomes insolvent or makes an assignment
for the benefit of creditors. Upon termination the Licensee
right to access the Platform shall cease immediately.

GOVERNING LAW
This Agreement shall be governed by and construed in accordance
with the laws of the State of New York without regard to its
conflict of laws principles. Any dispute shall be subject to the
exclusive jurisdiction of the courts of New York County.`,

      `LIMITATION OF LIABILITY
IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT
INCIDENTAL SPECIAL CONSEQUENTIAL OR PUNITIVE DAMAGES. THE
LICENSOR TOTAL LIABILITY ARISING OUT OF OR IN CONNECTION WITH
THIS AGREEMENT SHALL NOT EXCEED THE FEES PAID BY THE LICENSEE
IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

SIGNATURES
The Parties having read and agreed to the terms above have
executed this Agreement as of the Effective Date. Signed by
duly authorized representatives.

CloudSoft Technologies Inc:
____________________________  Date: ____________
Name: Alice Chen
Title: Chief Revenue Officer

DataVault Financial Services LLC:
____________________________  Date: ____________
Name: Robert Kumar
Title: Director of Technology

[END OF SYNTHETIC SAMPLE DOCUMENT - EDUCATIONAL DEMONSTRATION ONLY]`,
    ],
  },
];

for (const doc of documents) {
  const pdfData = buildPdf(doc.pages.map(text => ({ text })));
  const outPath = path.join(SAMPLES_DIR, doc.filename);
  fs.writeFileSync(outPath, pdfData);
  console.log(`✅ Generated: ${doc.filename} (${pdfData.length} bytes, ${doc.pages.length} pages)`);
}

console.log('\nSample PDFs are ready in the sample_documents/ directory.');
console.log('These are synthetic documents for educational demonstration only.');
