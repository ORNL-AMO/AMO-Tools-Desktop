import { Component, OnInit } from '@angular/core';
import { ImportExportService } from '../shared/import-export/import-export.service';
import { ExportService } from '../shared/import-export/export.service';
@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css']
})
export class ContactPageComponent implements OnInit {

  constructor(private importExportService: ImportExportService, private exportService: ExportService) { }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.exportService.exportAllClick.next(null);
  }

  sendMail(){
    this.importExportService.openMailTo();
  }

  downloadData(){
    this.exportService.exportAllClick.next(true);
  }

}
