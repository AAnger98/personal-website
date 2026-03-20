import { useState } from 'react';
import { logEvent } from '../../lib/telemetry';
import type { Reflection } from './StrengthsFlow';

interface Props {
  selectedWords: string[];
  reflections: Record<string, Reflection>;
  pitch: string;
  onComplete: () => void;
  onBack: () => void;
}

function generatePdf(
  selectedWords: string[],
  reflections: Record<string, Reflection>,
  pitch: string,
  onError: (msg: string) => void
) {
  import('jspdf')
    .then(({ jsPDF }) => {
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const margin = 72;
      const pageWidth = 612;
      const usableWidth = pageWidth - margin * 2;
      let y = margin;

      const addLine = (text: string, size: number, isBold = false) => {
        doc.setFontSize(size);
        if (isBold) doc.setFont('helvetica', 'bold');
        else doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(text, usableWidth);
        lines.forEach((line: string) => {
          if (y > 720) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += size * 1.5;
        });
        y += 4;
      };

      doc.setTextColor(40, 40, 40);
      addLine('My Top Strengths', 24, true);
      y += 12;

      doc.setDrawColor(180, 150, 50);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      selectedWords.forEach((word, i) => {
        addLine(`${i + 1}. ${word}`, 14, true);
        const r = reflections[word];
        if (r?.why?.trim()) {
          addLine(`Why: ${r.why.trim()}`, 11);
        }
        if (r?.moment?.trim()) {
          addLine(`Moment: ${r.moment.trim()}`, 11);
        }
        y += 8;
      });

      y += 8;
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      if (pitch.trim()) {
        addLine('My Elevator Pitch', 14, true);
        addLine(pitch.trim(), 11);
        y += 8;
      }

      doc.line(margin, y, pageWidth - margin, y);
      y += 20;
      doc.setTextColor(100, 100, 100);
      addLine('Practice this pitch daily. Refine it over time.', 10, true);

      doc.save('my-strengths.pdf');
      logEvent('strengths_pdf_downloaded');
    })
    .catch(() => {
      onError('PDF generation failed. Try downloading again or use Print instead.');
    });
}

function triggerPrint() {
  window.print();
  logEvent('strengths_pdf_printed');
}

export default function PdfDownloadStep({ selectedWords, reflections, pitch, onComplete, onBack }: Props) {
  const [pdfError, setPdfError] = useState('');

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">STEP 4 OF 5</span>
          <h1 className="sw-title">Your Strengths Summary</h1>
          <p className="sw-desc">Download or print your personalized strengths PDF.</p>
        </div>
      </div>

      <div className="spdf-preview">
        <h2 className="spdf-section-title">Your Top 5 Strengths</h2>
        <ol className="spdf-words-list">
          {selectedWords.map(word => (
            <li key={word} className="spdf-word">{word}</li>
          ))}
        </ol>

        {pitch.trim() && (
          <>
            <h2 className="spdf-section-title">Your Elevator Pitch</h2>
            <p className="spdf-pitch">{pitch}</p>
          </>
        )}
      </div>

      {pdfError && <p className="spdf-error">{pdfError}</p>}

      <div className="spdf-actions">
        <button
          className="sw-btn sw-btn--primary"
          onClick={() => generatePdf(selectedWords, reflections, pitch, setPdfError)}
          type="button"
        >
          ↓ DOWNLOAD PDF
        </button>
        <button
          className="sw-btn sw-btn--ghost"
          onClick={triggerPrint}
          type="button"
        >
          ⎙ PRINT
        </button>
      </div>

      <div className="sw-footer sw-footer--with-back">
        <button className="sw-btn sw-btn--ghost" onClick={onBack} type="button">
          ← BACK
        </button>
        <button className="sw-btn" onClick={onComplete} type="button">
          CONTINUE →
        </button>
      </div>
    </div>
  );
}
