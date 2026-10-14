# PowerShell script to generate minimal valid text-based PDFs without any external tools
# These are synthetic educational sample documents

function Write-MinimalPdf {
    param([string]$OutputPath, [string]$Title, [string[]]$Pages)

    $objects = @()
    $offsets = @()
    $content = ""

    # Helper to add an object
    function AddObject([string]$data) {
        $script:objectNum++
        $script:offsets += $script:content.Length
        $script:content += "$($script:objectNum) 0 obj`n$data`nendobj`n"
        return $script:objectNum
    }

    $script:objectNum = 0
    $script:offsets = @()
    $script:content = "%PDF-1.4`n"

    # Add pages
    $pageIds = @()
    $streamIds = @()

    foreach ($pageText in $Pages) {
        # Encode text for PDF stream (escape parentheses and backslashes)
        $lines = $pageText -split "`n"
        $streamContent = "BT`n/F1 10 Tf`n50 750 Td`n12 TL`n"
        foreach ($line in $lines) {
            $escaped = $line -replace '\\', '\\\\' -replace '\(', '\(' -replace '\)', '\)'
            $streamContent += "($escaped) Tj T*`n"
        }
        $streamContent += "ET"
        $streamBytes = [System.Text.Encoding]::Latin1.GetBytes($streamContent)
        $streamLen = $streamBytes.Length

        $streamId = AddObject("<< /Length $streamLen >>`nstream`n$streamContent`nendstream")
        $streamIds += $streamId

        $pageId = AddObject("<< /Type /Page /Parent 3 0 R /Contents $streamId 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 595 842] >>")
        $pageIds += $pageId
    }

    # Page tree (object 3)
    $kidsStr = ($pageIds | ForEach-Object { "$_ 0 R" }) -join " "
    $pageCount = $pageIds.Count
    $pageTreeId = AddObject("<< /Type /Pages /Kids [$kidsStr] /Count $pageCount >>")

    # Catalog (object 2 - but we'll note it's actually added after)
    $catalogId = AddObject("<< /Type /Catalog /Pages $pageTreeId 0 R >>")

    # Info
    $infoId = AddObject("<< /Title ($Title) /Creator (Legal Document Intelligence Demo) /Producer (Wipro CPPE Sample Generator) >>")

    # Cross-reference table
    $xrefOffset = $script:content.Length
    $objCount = $script:objectNum + 1
    $xref = "xref`n0 $objCount`n0000000000 65535 f `n"
    foreach ($off in $script:offsets) {
        $xref += "{0:D10} 00000 n `n" -f $off
    }

    $script:content += $xref
    $script:content += "trailer`n<< /Size $objCount /Root $catalogId 0 R /Info $infoId 0 R >>`n"
    $script:content += "startxref`n$xrefOffset`n%%EOF"

    [System.IO.File]::WriteAllText($OutputPath, $script:content, [System.Text.Encoding]::Latin1)
    Write-Host "Created: $OutputPath"
}

$docDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- Document 1: Service Agreement ---
$pages1 = @(
"SAMPLE SERVICE AGREEMENT
[SYNTHETIC EDUCATIONAL DOCUMENT - NOT A REAL LEGAL AGREEMENT]

PARTIES
This Service Agreement (the Agreement) is entered into as of January 15, 2026
(the Effective Date) between TechServe Solutions Ltd., a company incorporated
under the laws of England and Wales (the Provider), and Acme Manufacturing
Corp., a corporation organized under the laws of Delaware, USA (the Client).
Together the Provider and the Client are referred to as the Parties.",

"TERM AND DURATION
This Agreement shall commence on the Effective Date and continue for an initial
term of twelve (12) months (the Initial Term). Upon expiration of the Initial
Term, this Agreement shall automatically renew for successive one-year periods
unless either Party provides written notice of non-renewal at least sixty (60)
days prior to the end of the then-current term.

SERVICES
The Provider agrees to provide cloud infrastructure management, software
development, and technical support services. The Provider shall deliver the
services with reasonable care and skill, consistent with industry standards.",

"CONFIDENTIALITY
Each Party agrees to keep strictly confidential all Confidential Information of
the other Party disclosed under this Agreement. Confidential Information means
any non-public information including trade secrets, business plans, technical
data, and financial information. The receiving Party shall not disclose such
Confidential Information to any third party without prior written consent.
This non-disclosure confidentiality obligation shall survive termination of
this Agreement for a period of three (3) years.",

"TERMINATION
Either Party may terminate this Agreement upon sixty (60) days written notice
of termination to the other Party. Either Party may terminate this Agreement
immediately upon written notice if the other Party commits a material breach
and fails to remedy such breach within thirty (30) days of receiving written
notice specifying the breach, or becomes insolvent or enters administration.

GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by and construed in accordance with the laws
of England and Wales. Any dispute shall be subject to the exclusive jurisdiction
of the courts of England and Wales.",

"LIMITATION OF LIABILITY
Neither Party shall be liable for any indirect, incidental, special,
consequential, or punitive damages. Each Party's total aggregate liability
shall not exceed the total fees paid in the twelve (12) months preceding the claim.

SIGNATURES
IN WITNESS WHEREOF, the Parties have executed this Agreement as of the
Effective Date. Signed by duly authorized representatives:

For TechServe Solutions Ltd.:  ____________________  Date: __________
Name: Jane Smith, Chief Executive Officer

For Acme Manufacturing Corp.:  ____________________  Date: __________
Name: John Doe, Vice President Operations

[END OF SYNTHETIC SAMPLE DOCUMENT - FOR EDUCATIONAL DEMONSTRATION ONLY]"
)

Write-MinimalPdf -OutputPath "$docDir\sample_service_agreement.pdf" -Title "Sample Service Agreement" -Pages $pages1

# --- Document 2: Software Subscription Agreement ---
$pages2 = @(
"SAMPLE SOFTWARE SUBSCRIPTION AGREEMENT
[SYNTHETIC EDUCATIONAL DOCUMENT - NOT A REAL LEGAL AGREEMENT]

PARTIES AND RECITALS
This Software Subscription Agreement (the Agreement) is entered into as of
March 1, 2026 (Effective Date) between CloudSoft Technologies Inc., a
corporation organized under the laws of California (Licensor), and DataVault
Financial Services LLC, a limited liability company organized under the laws
of New York (Licensee). The Parties are entering this Agreement to govern
access to the Licensor's proprietary software platform.",

"SUBSCRIPTION AND LICENSE
Subject to the terms of this Agreement and timely payment of all subscription
fees, the Licensor grants the Licensee a limited, non-exclusive, non-transferable
revocable licence to access and use the CloudSoft Analytics Platform (Platform)
solely for the Licensee's internal business purposes during the Subscription Term.

SUBSCRIPTION TERM AND RENEWAL
The initial subscription term shall commence on the Effective Date and expire
on February 28, 2027 (Initial Subscription Term). The commencement date of
each subsequent renewal term shall be the day following expiration of the prior
term. This Agreement shall automatically renew for successive one-year periods
unless either Party provides written notice of non-renewal at least ninety (90)
days before the end of the then-current term.",

"CONFIDENTIAL INFORMATION AND NON-DISCLOSURE
The Parties acknowledge that each may disclose confidential and proprietary
information to the other. Each Party agrees to hold the other Party's
Confidential Information in strict confidence, not to use Confidential
Information except as necessary to perform obligations under this Agreement,
and not to disclose Confidential Information to any third party without prior
written consent. The non-disclosure obligations shall survive termination
of this Agreement for five (5) years.",

"TERMINATION
Either Party may terminate this Agreement by providing sixty (60) days written
notice of termination to the other Party. The Licensor may terminate this
Agreement immediately if the Licensee breaches any payment obligation and
fails to cure within ten (10) days of written notice, or violates the licence
restrictions, or becomes insolvent.

GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws
of the State of New York. Any dispute shall be subject to the exclusive
jurisdiction of the state and federal courts located in New York County.",

"LIMITATION OF LIABILITY
IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. THE LICENSOR'S TOTAL LIABILITY
SHALL NOT EXCEED THE FEES PAID IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

SIGNATURES
The Parties, having read and agreed to the terms, have executed this Agreement
as of the Effective Date. Signed by duly authorized representatives:

CloudSoft Technologies Inc.:  ____________________  Date: __________
Name: Alice Chen, Chief Revenue Officer

DataVault Financial Services LLC:  ____________________  Date: __________
Name: Robert Kumar, Director of Technology

[END OF SYNTHETIC SAMPLE DOCUMENT - FOR EDUCATIONAL DEMONSTRATION ONLY]"
)

Write-MinimalPdf -OutputPath "$docDir\sample_software_subscription_agreement.pdf" -Title "Sample Software Subscription Agreement" -Pages $pages2

Write-Host ""
Write-Host "Both sample PDFs have been created successfully."
Write-Host "These are synthetic educational documents for the CPPE demo only."
