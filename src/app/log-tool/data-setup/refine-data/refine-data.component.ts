import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolDbService } from '../../log-tool-db.service';

@Component({
  selector: 'app-refine-data',
  templateUrl: './refine-data.component.html',
  styleUrls: ['./refine-data.component.css']
})
export class RefineDataComponent implements OnInit {
  
  constructor(private logToolDbService: LogToolDbService,
    private logToolDataService: LogToolDataService) { }

  ngOnInit() {
    let isFileDataImported: boolean = this.logToolDataService.explorerData.getValue().fileData.length !== 0;
    if (!isFileDataImported) {
      this.parseFileDataAndSave();
    }
  }
  
  ngOnDestroy(){
  }
  
  parseFileDataAndSave() {
    this.logToolDataService.setLoadingSpinner(true, 'Parsing file data...')
    this.logToolDataService.importFileData();
    this.logToolDbService.saveData();
    this.logToolDataService.setLoadingSpinner(false);
  }

}