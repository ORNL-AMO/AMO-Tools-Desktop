import { NgModule } from '@angular/core';
import { ExportButtonComponent } from './components/export-button/export-button.component';
import { PdfReportService } from './services/pdf-report.service';

@NgModule({
  imports: [ExportButtonComponent],
  exports: [ExportButtonComponent],
  providers: [PdfReportService],
})
export class ReportBuilderModule {}
