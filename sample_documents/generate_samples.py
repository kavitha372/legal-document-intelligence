#!/usr/bin/env python3
"""
Generate synthetic sample legal PDFs for demonstration.
These are fictional documents for educational purposes only.
Run: python generate_samples.py
Requires: pip install reportlab
"""

import sys

def check_reportlab():
    try:
        from reportlab.lib.pagesizes import A4
        return True
    except ImportError:
        return False

def generate_with_reportlab():
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import cm
    from reportlab.lib import colors

    styles = getSampleStyleSheet()
    heading = ParagraphStyle('heading', parent=styles['Heading2'], spaceAfter=8)
    body = ParagraphStyle('body', parent=styles['Normal'], spaceAfter=6, leading=16)
    small = ParagraphStyle('small', parent=styles['Normal'], fontSize=8, textColor=colors.grey)

    # -------------------------------------------------------
    # Document 1: Service Agreement
    # -------------------------------------------------------
    doc1_content = [
        Paragraph("SAMPLE SERVICE AGREEMENT", styles['Title']),
        Paragraph("[SYNTHETIC EDUCATIONAL DOCUMENT — NOT A REAL LEGAL AGREEMENT]", small),
        Spacer(1, 0.4*cm),

        Paragraph("PARTIES", heading),
        Paragraph(
            "This Service Agreement (the \"Agreement\") is entered into as of January 15, 2026 "
            "(the \"Effective Date\") between TechServe Solutions Ltd., a company incorporated under "
            "the laws of England and Wales, with registered office at 100 Innovation Drive, London "
            "(the \"Provider\"), and Acme Manufacturing Corp., a corporation organized under the laws "
            "of Delaware, USA, with principal offices at 500 Industry Road, Newark, NJ (the \"Client\"). "
            "Together the Provider and the Client are referred to as the \"Parties\".",
            body),

        Paragraph("TERM AND DURATION", heading),
        Paragraph(
            "This Agreement shall commence on the Effective Date and shall continue for an initial term "
            "of twelve (12) months (the \"Initial Term\"), unless earlier terminated in accordance with "
            "the termination provisions set forth herein. Upon expiration of the Initial Term, this "
            "Agreement shall automatically renew for successive one-year periods unless either Party "
            "provides written notice of non-renewal at least sixty (60) days prior to the end of the "
            "then-current term.",
            body),

        Paragraph("SERVICES", heading),
        Paragraph(
            "The Provider agrees to provide cloud infrastructure management, software development, "
            "and technical support services as further described in Schedule A attached hereto. "
            "The Provider shall deliver the services with reasonable care and skill, consistent with "
            "industry standards applicable to the provision of such services.",
            body),

        Paragraph("FEES AND PAYMENT", heading),
        Paragraph(
            "In consideration for the Services, the Client shall pay the Provider a monthly retainer "
            "of USD 15,000, payable within thirty (30) days of invoice date. Late payments shall accrue "
            "interest at the rate of 1.5% per month. All fees are exclusive of applicable taxes.",
            body),

        Paragraph("CONFIDENTIALITY", heading),
        Paragraph(
            "Each Party agrees to keep strictly confidential all Confidential Information of the other "
            "Party disclosed under or in connection with this Agreement. \"Confidential Information\" means "
            "any non-public information, including but not limited to trade secrets, business plans, "
            "technical data, customer lists, and financial information. The receiving Party shall not "
            "disclose such Confidential Information to any third party without prior written consent. "
            "This confidentiality obligation shall survive the termination of this Agreement for a period "
            "of three (3) years. Each Party shall implement reasonable technical and organisational "
            "measures to protect the other Party's Confidential Information from unauthorized access "
            "or non-disclosure.",
            body),

        Paragraph("INTELLECTUAL PROPERTY", heading),
        Paragraph(
            "All pre-existing intellectual property of each Party shall remain the exclusive property "
            "of that Party. Any work product specifically created by the Provider for the Client under "
            "this Agreement (\"Deliverables\") shall be owned by the Client upon full payment of all "
            "fees due. The Provider grants the Client a non-exclusive licence to use any Provider tools "
            "or methodologies incorporated in the Deliverables.",
            body),

        Paragraph("TERMINATION", heading),
        Paragraph(
            "Either Party may terminate this Agreement upon sixty (60) days written notice of termination "
            "to the other Party. Either Party may terminate this Agreement immediately upon written notice "
            "if the other Party: (a) commits a material breach of this Agreement and fails to remedy such "
            "breach within thirty (30) days of receiving written notice specifying the breach; (b) becomes "
            "insolvent or enters into administration, receivership, or any analogous insolvency proceeding; "
            "or (c) ceases to carry on business. Upon termination or expiry, all outstanding fees shall "
            "become immediately due and payable, and each Party shall return or destroy the other Party's "
            "Confidential Information.",
            body),

        Paragraph("LIMITATION OF LIABILITY", heading),
        Paragraph(
            "To the maximum extent permitted by applicable law, neither Party shall be liable to the other "
            "for any indirect, incidental, special, consequential, or punitive damages arising out of or "
            "in connection with this Agreement. Each Party's total aggregate liability shall not exceed "
            "the total fees paid or payable in the twelve (12) months preceding the claim.",
            body),

        Paragraph("INDEMNIFICATION", heading),
        Paragraph(
            "Each Party (the \"Indemnifying Party\") shall indemnify, defend, and hold harmless the other "
            "Party from and against any third-party claims, damages, liabilities, costs, and expenses "
            "(including reasonable legal fees) arising from the Indemnifying Party's breach of this "
            "Agreement or its negligent or wrongful acts.",
            body),

        Paragraph("GOVERNING LAW AND JURISDICTION", heading),
        Paragraph(
            "This Agreement shall be governed by and construed in accordance with the laws of England "
            "and Wales, without regard to its conflict of law provisions. Any dispute arising out of or "
            "in connection with this Agreement shall be subject to the exclusive jurisdiction of the "
            "courts of England and Wales.",
            body),

        Paragraph("ENTIRE AGREEMENT", heading),
        Paragraph(
            "This Agreement, together with all Schedules attached hereto, constitutes the entire agreement "
            "between the Parties with respect to its subject matter and supersedes all prior negotiations, "
            "representations, warranties, and understandings.",
            body),

        Spacer(1, 1*cm),
        Paragraph("SIGNATURES", heading),
        Paragraph(
            "IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.",
            body),
        Spacer(1, 0.5*cm),
        Paragraph(
            "For and on behalf of TechServe Solutions Ltd.:  ____________________________  Date: ____________\n"
            "Name: Jane Smith    Title: Chief Executive Officer",
            body),
        Spacer(1, 0.5*cm),
        Paragraph(
            "For and on behalf of Acme Manufacturing Corp.:  ____________________________  Date: ____________\n"
            "Name: John Doe    Title: Vice President, Operations",
            body),
        Spacer(1, 0.5*cm),
        Paragraph("[END OF SYNTHETIC SAMPLE DOCUMENT]", small),
    ]

    doc1 = SimpleDocTemplate("sample_service_agreement.pdf", pagesize=A4,
                              rightMargin=2.5*cm, leftMargin=2.5*cm,
                              topMargin=2.5*cm, bottomMargin=2.5*cm)
    doc1.build(doc1_content)
    print("Created: sample_service_agreement.pdf")

    # -------------------------------------------------------
    # Document 2: Software Subscription Agreement
    # -------------------------------------------------------
    doc2_content = [
        Paragraph("SAMPLE SOFTWARE SUBSCRIPTION AGREEMENT", styles['Title']),
        Paragraph("[SYNTHETIC EDUCATIONAL DOCUMENT — NOT A REAL LEGAL AGREEMENT]", small),
        Spacer(1, 0.4*cm),

        Paragraph("PARTIES AND RECITALS", heading),
        Paragraph(
            "This Software Subscription Agreement (the \"Agreement\") is entered into and dated as of "
            "March 1, 2026 (\"Effective Date\") between CloudSoft Technologies Inc., a corporation "
            "organized under the laws of California (\"Licensor\"), and DataVault Financial Services LLC, "
            "a limited liability company organized under the laws of New York (\"Licensee\"). "
            "Licensor and Licensee are each individually referred to as a \"Party\" and collectively "
            "as the \"Parties\". The Licensor desires to provide access to its proprietary software "
            "platform, and the Licensee desires to subscribe to such platform, on the terms set forth herein.",
            body),

        Paragraph("SUBSCRIPTION AND LICENSE", heading),
        Paragraph(
            "Subject to the terms and conditions of this Agreement and timely payment of all subscription "
            "fees, the Licensor hereby grants the Licensee a limited, non-exclusive, non-transferable, "
            "revocable licence to access and use the CloudSoft Analytics Platform (the \"Platform\") "
            "solely for the Licensee's internal business purposes during the Subscription Term. "
            "The Licensee shall not sublicence, resell, copy, modify, or create derivative works of "
            "the Platform.",
            body),

        Paragraph("SUBSCRIPTION TERM AND RENEWAL", heading),
        Paragraph(
            "The initial subscription term shall commence on the Effective Date and expire on February 28, 2027 "
            "(the \"Initial Subscription Term\"). The commencement date for each subsequent renewal term "
            "shall be the day following expiration of the prior term. This Agreement shall automatically "
            "renew for successive one-year periods unless either Party provides written notice of "
            "non-renewal at least ninety (90) days before the end of the then-current term. The Licensor "
            "reserves the right to increase subscription fees at renewal with sixty (60) days prior written notice.",
            body),

        Paragraph("SUBSCRIPTION FEES AND PAYMENT TERMS", heading),
        Paragraph(
            "The Licensee shall pay the Licensor an annual subscription fee of USD 48,000, payable in "
            "advance on or before the first day of each subscription year. Overdue amounts shall accrue "
            "interest at the rate of 2% per month. All fees are non-refundable unless otherwise expressly "
            "stated. Licensor may suspend access to the Platform if fees remain unpaid for more than "
            "fifteen (15) days after the due date.",
            body),

        Paragraph("CONFIDENTIAL INFORMATION AND NON-DISCLOSURE", heading),
        Paragraph(
            "The Parties acknowledge that in the course of this Agreement each may disclose confidential "
            "and proprietary information to the other. Each Party agrees to: (i) hold the other Party's "
            "Confidential Information in strict confidence; (ii) not to use such Confidential Information "
            "except as necessary to perform its obligations under this Agreement; and (iii) not to disclose "
            "such Confidential Information to any third party without the prior written consent of the "
            "disclosing Party, except to employees or contractors who have a need to know and are bound "
            "by confidentiality obligations no less restrictive than those herein. The non-disclosure "
            "obligations shall survive termination of this Agreement for five (5) years.",
            body),

        Paragraph("DATA PROTECTION", heading),
        Paragraph(
            "Each Party shall comply with all applicable data protection and privacy laws, including "
            "the General Data Protection Regulation (GDPR) where applicable. The Licensor shall process "
            "personal data only as a data processor acting on behalf of the Licensee as data controller, "
            "and shall implement appropriate technical and organisational measures to protect personal data.",
            body),

        Paragraph("WARRANTIES AND DISCLAIMERS", heading),
        Paragraph(
            "The Licensor warrants that the Platform will perform materially in accordance with its "
            "documentation. EXCEPT AS EXPRESSLY SET FORTH HEREIN, THE PLATFORM IS PROVIDED \"AS IS\" "
            "AND THE LICENSOR DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES "
            "OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.",
            body),

        Paragraph("TERMINATION", heading),
        Paragraph(
            "Either Party may terminate this Agreement by providing sixty (60) days written notice "
            "of termination to the other Party. The Licensor may terminate this Agreement immediately "
            "upon written notice if the Licensee: (a) breaches any payment obligation and fails to "
            "cure within ten (10) days of written notice; (b) violates the licence restrictions in "
            "Section 2; (c) becomes insolvent or makes an assignment for the benefit of creditors; "
            "or (d) engages in any activity that could harm the Licensor's reputation or intellectual "
            "property. Upon termination, the Licensee's right to access the Platform shall cease immediately.",
            body),

        Paragraph("LIMITATION OF LIABILITY", heading),
        Paragraph(
            "IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, "
            "CONSEQUENTIAL, OR PUNITIVE DAMAGES. THE LICENSOR'S TOTAL LIABILITY ARISING OUT OF "
            "OR IN CONNECTION WITH THIS AGREEMENT SHALL NOT EXCEED THE FEES PAID BY THE LICENSEE "
            "IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.",
            body),

        Paragraph("GOVERNING LAW", heading),
        Paragraph(
            "This Agreement shall be governed by and construed in accordance with the laws of the "
            "State of New York, without regard to its conflict of laws principles. Any dispute shall "
            "be subject to the exclusive jurisdiction of the state and federal courts located in "
            "New York County, New York.",
            body),

        Paragraph("GENERAL PROVISIONS", heading),
        Paragraph(
            "This Agreement constitutes the entire agreement between the Parties and supersedes all "
            "prior or contemporaneous agreements. If any provision is found unenforceable, the remaining "
            "provisions shall remain in full force. Neither Party may assign this Agreement without "
            "the prior written consent of the other Party.",
            body),

        Spacer(1, 1*cm),
        Paragraph("EXECUTION AND SIGNATURES", heading),
        Paragraph(
            "The Parties, having read and agreed to the terms above, have executed this Agreement "
            "as of the Effective Date. Signed by duly authorized representatives.",
            body),
        Spacer(1, 0.5*cm),
        Paragraph(
            "CloudSoft Technologies Inc.:  ____________________________  Date: ____________\n"
            "Name: Alice Chen    Title: Chief Revenue Officer",
            body),
        Spacer(1, 0.5*cm),
        Paragraph(
            "DataVault Financial Services LLC:  ____________________________  Date: ____________\n"
            "Name: Robert Kumar    Title: Director of Technology",
            body),
        Spacer(1, 0.5*cm),
        Paragraph("[END OF SYNTHETIC SAMPLE DOCUMENT]", small),
    ]

    doc2 = SimpleDocTemplate("sample_software_subscription_agreement.pdf", pagesize=A4,
                              rightMargin=2.5*cm, leftMargin=2.5*cm,
                              topMargin=2.5*cm, bottomMargin=2.5*cm)
    doc2.build(doc2_content)
    print("Created: sample_software_subscription_agreement.pdf")

if __name__ == '__main__':
    if not check_reportlab():
        print("reportlab is not installed. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'reportlab'])
    generate_with_reportlab()
    print("\nSample PDFs generated successfully.")
    print("These are synthetic documents for educational/demo purposes only.")
