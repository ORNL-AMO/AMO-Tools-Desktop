import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ToolsService } from '../tools.service';
import { CsvToJsonService } from '../../../shared/helper-services/csv-to-json.service';

@Component({
  selector: 'app-add-data-set',
  templateUrl: './add-data-set.component.html',
  styleUrls: ['./add-data-set.component.css']
})
export class AddDataSetComponent implements OnInit {

  @ViewChild('addDataSetModal', { static: false }) public addDataSetModal: ModalDirective;
  importInProgress: boolean = false;
  fileReference: any;
  validFile: boolean;
  importJson: any = null;
  constructor(private toolsService: ToolsService, private csvToJsonService: CsvToJsonService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showAddDataSetModal();
  }

  //  CREATE ASSESSMENT MODAL
  showAddDataSetModal() {
    this.addDataSetModal.show();
  }

  hideAddDataSetModal() {
    this.addDataSetModal.hide();
    this.addDataSetModal.onHidden.subscribe(() => {
      this.toolsService.showAddDataSet.next(false);
    })
  }

  setImportFile($event) {
    if ($event.target.files) {
      if ($event.target.files.length !== 0) {
        let regex = /.csv$/;
        if (regex.test($event.target.files[0].name)) {
          this.fileReference = $event;
          this.validFile = true;
        } else {
          let fr: FileReader = new FileReader();
          fr.readAsText($event.target.files[0]);
          fr.onloadend = (e) => {
            try {
              // console.log(fr.result);
              this.importJson = JSON.parse(JSON.stringify(fr.result));
              this.validFile = true;
            } catch (err) {
              this.validFile = false;
            }
          };
        }
      }
    }
  }

  importFile() {
    if (!this.importJson) {
      let fr: FileReader = new FileReader();
      fr.readAsText(this.fileReference.target.files[0]);
      fr.onloadend = (e) => {
        // console.log(fr.result);
        this.importJson = JSON.parse(JSON.stringify(fr.result));
        this.runImport(this.importJson)
      };
    }
    else {
      this.runImport(this.importJson);
    }
  }

  runImport(data: string) {
    
    this.csvToJsonService.parseCSV(data);
    //   let importData: ImportExportData = JSON.parse(data);
    //   if (importData.origin === "AMO-TOOLS-DESKTOP") {
    //     this.importInProgress = true;
    //     let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    //     this.importService.importData(importData, directoryId);
    //     setTimeout(() => {
    //       this.hideImportModal();
    //       this.importInProgress = false;
    //       this.dashboardService.updateDashboardData.next(true);
    //     }, 1500);
    //   }
    //   else {
    //     this.validFile = false;
    //     this.dashboardService.dashboardToastMessage.next('INVALID FILE');
    //   }
    // }
  }
}
