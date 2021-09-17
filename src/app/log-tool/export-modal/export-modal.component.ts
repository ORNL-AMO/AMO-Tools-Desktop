import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { LogToolService } from '../log-tool.service';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.css']
})
export class ExportModalComponent implements OnInit {
  
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;


  exportData: boolean = false;
  constructor(private logToolService: LogToolService) { }

  ngOnInit(){
  }

  ngAfterViewInit() {
    this.showExportModal();
  }

  showExportModal() {
    this.exportModal.show();
  }

  closeExportData(){
    this.exportModal.hide()
    this.exportModal.onHidden.subscribe(val => {
      this.logToolService.openExportData.next(false);
    });
  }

  getExportData(){
    this.exportData = true;

  }

}
