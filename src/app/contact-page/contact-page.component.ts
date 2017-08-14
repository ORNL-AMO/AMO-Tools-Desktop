import { Component, OnInit } from '@angular/core';
import { ImportExportService } from '../shared/import-export/import-export.service';
@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css']
})
export class ContactPageComponent implements OnInit {

  constructor(private importExportService: ImportExportService) { }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.importExportService.toggleDownload.next(null);
  }

  sendMail(){
    this.importExportService.openMailTo();
  }

  downloadData(){
    this.importExportService.toggleDownload.next(true);
  }

}
