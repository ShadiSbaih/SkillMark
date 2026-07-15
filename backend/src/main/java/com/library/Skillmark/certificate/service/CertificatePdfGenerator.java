package com.library.Skillmark.certificate.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.library.Skillmark.certificate.entity.Certificate;
import com.library.Skillmark.certificate.repository.CertificateRepository;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.storage.service.StorageService;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class CertificatePdfGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM d, yyyy").withZone(ZoneId.systemDefault());

    private final CertificateRepository certificateRepository;
    private final StorageService storageService;
    private final String verifyBaseUrl;

    public CertificatePdfGenerator(CertificateRepository certificateRepository,
                                   StorageService storageService,
                                   @Value("${app.certificate-verify-base-url:}") String verifyBaseUrl) {
        this.certificateRepository = certificateRepository;
        this.storageService = storageService;
        this.verifyBaseUrl = verifyBaseUrl;
    }

    @Async
    public void generateAsync(java.util.UUID certificateId) {
        generateAndUpload(certificateId);
    }

    @Transactional
    public void generateAndUpload(java.util.UUID certificateId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new NotFoundException("Certificate not found"));
        byte[] qrBytes = generateQrCode(certificate.getVerificationCode());
        byte[] pdfBytes = generatePdf(certificate, qrBytes);

        String pdfKey = "certificates/" + certificate.getId() + "/certificate.pdf";
        String qrKey = "certificates/" + certificate.getId() + "/qr.png";

        String pdfUrl = storageService.uploadBytes(pdfKey, pdfBytes, "application/pdf");
        String qrUrl = storageService.uploadBytes(qrKey, qrBytes, "image/png");

        certificate.setPdfUrl(pdfUrl);
        certificate.setPdfObjectKey(pdfKey);
        certificate.setQrCodeUrl(qrUrl);
        certificate.setQrCodeObjectKey(qrKey);
    }

    private byte[] generateQrCode(String verificationCode) {
        try {
            String url = buildVerificationUrl(verificationCode);
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(url, BarcodeFormat.QR_CODE, 200, 200);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            return pngOutputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    private String buildVerificationUrl(String verificationCode) {
        String base = (verifyBaseUrl == null || verifyBaseUrl.isBlank()) ? "https://verify.skillmark.app" : verifyBaseUrl.replaceAll("/+$", "");
        return base + "/" + verificationCode;
    }

    private byte[] generatePdf(Certificate certificate, byte[] qrBytes) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 42);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 18);
            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 36);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 16);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            Paragraph title = new Paragraph("Certificate of Completion", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(24);
            document.add(title);

            Paragraph presentedTo = new Paragraph("This certificate is proudly presented to", subtitleFont);
            presentedTo.setAlignment(Element.ALIGN_CENTER);
            presentedTo.setSpacingAfter(16);
            document.add(presentedTo);

            Paragraph recipient = new Paragraph(certificate.getParticipantNameSnapshot(), nameFont);
            recipient.setAlignment(Element.ALIGN_CENTER);
            recipient.setSpacingAfter(24);
            document.add(recipient);

            Paragraph program = new Paragraph("For successfully completing the program:", bodyFont);
            program.setAlignment(Element.ALIGN_CENTER);
            program.setSpacingAfter(8);
            document.add(program);

            Paragraph programTitle = new Paragraph(certificate.getProgramTitleSnapshot(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20));
            programTitle.setAlignment(Element.ALIGN_CENTER);
            programTitle.setSpacingAfter(8);
            document.add(programTitle);

            Paragraph quiz = new Paragraph("Including the final assessment: " + certificate.getQuizTitleSnapshot(), bodyFont);
            quiz.setAlignment(Element.ALIGN_CENTER);
            quiz.setSpacingAfter(24);
            document.add(quiz);

            PdfPTable scoreTable = new PdfPTable(1);
            scoreTable.setWidthPercentage(40);
            scoreTable.setHorizontalAlignment(Element.ALIGN_CENTER);
            PdfPCell scoreCell = new PdfPCell(new Phrase("Final Score: " + certificate.getAttempt().getScorePercentage().toPlainString() + "%", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22)));
            scoreCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            scoreCell.setPadding(12);
            scoreCell.setBorderWidth(1);
            scoreTable.addCell(scoreCell);
            document.add(scoreTable);

            Image qrImage = Image.getInstance(qrBytes);
            qrImage.setAlignment(Element.ALIGN_CENTER);
            qrImage.scaleToFit(120, 120);
            qrImage.setSpacingBefore(24);
            document.add(qrImage);

            Paragraph verify = new Paragraph("Scan to verify credential", smallFont);
            verify.setAlignment(Element.ALIGN_CENTER);
            verify.setSpacingAfter(8);
            document.add(verify);

            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(70);
            detailsTable.setHorizontalAlignment(Element.ALIGN_CENTER);
            detailsTable.setSpacingBefore(16);

            addDetailCell(detailsTable, "Certificate ID", certificate.getCertificateNumber(), smallFont);
            addDetailCell(detailsTable, "Issued On", DATE_FORMATTER.format(certificate.getIssuedAt()), smallFont);
            addDetailCell(detailsTable, "Organization", certificate.getOrganizationNameSnapshot(), smallFont);
            if (certificate.getOwnerNameSnapshot() != null) {
                addDetailCell(detailsTable, "Owner", certificate.getOwnerNameSnapshot(), smallFont);
            }

            document.add(detailsTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate certificate PDF", e);
        }
    }

    private void addDetailCell(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label + ":", font));
        labelCell.setBorder(0);
        labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBorder(0);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }
}
