import { Injectable } from '@angular/core';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { MockDirectory } from '../mocks/mock-directory';


@Injectable()
export class ImportExportService {

  constructor(private windowRefService: WindowRefService) { }
  
  downloadData(data: any) {
    data.push({origin: 'AMO-TOOLS-DESKTOP'});
    let stringifyData = JSON.stringify(data);
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    dlLink.setAttribute("href", dataStr);
    dlLink.setAttribute("download", "exportData.json");
    dlLink.click();
  }
}
