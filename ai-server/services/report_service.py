import io
import base64
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.colors import HexColor
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def generate_pdf(report_data: dict) -> str:
    """
    Generate a PDF report from analysis data.

    Args:
        report_data: dict containing:
            - patient_name: str
            - analysis_type: str
            - prediction: str
            - confidence: float
            - description: str
            - recommendation: str
            - risk_percentage: float (optional)
            - risk_level: str (optional)
            - recommendations: list (optional)

    Returns:
        Base64-encoded PDF string
    """
    if not REPORTLAB_AVAILABLE:
        return _generate_text_report(report_data)

    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Title"],
            fontSize=24,
            textColor=HexColor("#3B82F6"),
            spaceAfter=6,
        )
        subtitle_style = ParagraphStyle(
            "CustomSubtitle",
            parent=styles["Normal"],
            fontSize=10,
            textColor=HexColor("#64748b"),
            alignment=TA_CENTER,
            spaceAfter=20,
        )
        heading_style = ParagraphStyle(
            "CustomHeading",
            parent=styles["Heading2"],
            fontSize=14,
            textColor=HexColor("#1e293b"),
            spaceBefore=16,
            spaceAfter=8,
        )
        body_style = ParagraphStyle(
            "CustomBody",
            parent=styles["Normal"],
            fontSize=11,
            leading=16,
            textColor=HexColor("#334155"),
        )
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontSize=8,
            textColor=HexColor("#94a3b8"),
            spaceBefore=30,
            leading=12,
        )

        elements = []

        # Header
        elements.append(Paragraph("🏥 HealthVision AI", title_style))
        elements.append(Paragraph("AI-Powered Health Analysis Report", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=2, color=HexColor("#3B82F6")))
        elements.append(Spacer(1, 20))

        # Patient & Report Info
        patient_name = report_data.get("patient_name", "Patient")
        analysis_type = report_data.get("analysis_type", "General").upper()
        date_str = datetime.now().strftime("%B %d, %Y at %I:%M %p")

        info_data = [
            ["Patient Name:", patient_name],
            ["Analysis Type:", analysis_type],
            ["Report Date:", date_str],
            ["Report ID:", f"HV-{datetime.now().strftime('%Y%m%d%H%M%S')}"],
        ]
        info_table = Table(info_data, colWidths=[2 * inch, 4 * inch])
        info_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 11),
            ("TEXTCOLOR", (0, 0), (0, -1), HexColor("#475569")),
            ("TEXTCOLOR", (1, 0), (1, -1), HexColor("#1e293b")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 20))
        elements.append(HRFlowable(width="100%", thickness=1, color=HexColor("#e2e8f0")))

        # Results Section
        elements.append(Paragraph("Analysis Results", heading_style))

        prediction = report_data.get("prediction", "N/A")
        confidence = report_data.get("confidence", 0)
        risk_pct = report_data.get("risk_percentage")
        risk_level = report_data.get("risk_level")

        if risk_pct is not None:
            elements.append(Paragraph(f"<b>Risk Level:</b> {risk_level}", body_style))
            elements.append(Paragraph(f"<b>Risk Percentage:</b> {risk_pct}%", body_style))
        else:
            elements.append(Paragraph(f"<b>Prediction:</b> {prediction}", body_style))
            elements.append(Paragraph(f"<b>Confidence:</b> {confidence}%", body_style))

        elements.append(Spacer(1, 12))

        # Description
        description = report_data.get("description", "")
        if description:
            elements.append(Paragraph("Detailed Findings", heading_style))
            elements.append(Paragraph(description, body_style))
            elements.append(Spacer(1, 12))

        # Recommendations
        recommendation = report_data.get("recommendation", "")
        recommendations_list = report_data.get("recommendations", [])

        if recommendation or recommendations_list:
            elements.append(Paragraph("Recommendations", heading_style))
            if recommendation:
                elements.append(Paragraph(recommendation, body_style))
            for rec in recommendations_list:
                elements.append(Paragraph(f"• {rec}", body_style))
            elements.append(Spacer(1, 12))

        # Disclaimer
        elements.append(HRFlowable(width="100%", thickness=1, color=HexColor("#e2e8f0")))
        elements.append(Paragraph(
            "<b>DISCLAIMER:</b> This report is generated by HealthVision AI using artificial intelligence "
            "and is intended for informational purposes only. It is NOT a substitute for professional "
            "medical advice, diagnosis, or treatment. Always seek the advice of your physician or other "
            "qualified health provider with any questions you may have regarding a medical condition. "
            "The AI predictions should be validated by a qualified healthcare professional.",
            disclaimer_style,
        ))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(
            f"© {datetime.now().year} HealthVision AI. All rights reserved.",
            ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=HexColor("#94a3b8"), alignment=TA_CENTER),
        ))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return base64.b64encode(pdf_bytes).decode("utf-8")

    except Exception as e:
        print(f"[Report Service] PDF generation error: {e}")
        return _generate_text_report(report_data)


def _generate_text_report(report_data: dict) -> str:
    """Generate a base64-encoded text report as fallback."""
    report_text = f"""
HEALTHVISION AI - ANALYSIS REPORT
==================================
Patient: {report_data.get('patient_name', 'Patient')}
Analysis Type: {report_data.get('analysis_type', 'General')}
Date: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}

RESULTS
-------
Prediction: {report_data.get('prediction', 'N/A')}
Confidence: {report_data.get('confidence', 0)}%
Risk Level: {report_data.get('risk_level', 'N/A')}
Risk Percentage: {report_data.get('risk_percentage', 'N/A')}%

DESCRIPTION
-----------
{report_data.get('description', 'No description available.')}

RECOMMENDATIONS
---------------
{report_data.get('recommendation', '')}

DISCLAIMER
----------
This report is generated by AI and is NOT a substitute for professional medical advice.
"""
    return base64.b64encode(report_text.encode("utf-8")).decode("utf-8")
