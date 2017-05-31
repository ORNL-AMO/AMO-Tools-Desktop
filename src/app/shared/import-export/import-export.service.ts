import { Injectable } from '@angular/core';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { MockDirectory } from '../mocks/mock-directory';


@Injectable()
export class ImportExportService {

  constructor(private windowRefService: WindowRefService) { }

  exportData(data: JSON) {

  }


  downloadData(data: any) {
    let test = JSON.stringify(MockDirectory.assessments[0]);
    //test = 'data:text/json;charset=utf-8,' + test;
    let doc = this.windowRefService.getDoc();
   // let encodedUri = encodeURIComponent(test);
    let dlLink = doc.createElement("a");

    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(test);
    dlLink.setAttribute("href", dataStr);
    dlLink.setAttribute("download", "test.json");
    dlLink.click();
  }
}
