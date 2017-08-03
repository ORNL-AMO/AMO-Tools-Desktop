import { Injectable } from '@angular/core';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { MockDirectory } from '../mocks/mock-directory';
declare var screenshot;

@Injectable()
export class ImportExportService {

  constructor(private windowRefService: WindowRefService) { }

  downloadData(data: any) {
    data.push({ origin: 'AMO-TOOLS-DESKTOP' });
    let stringifyData = JSON.stringify(data);
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    dlLink.setAttribute("href", dataStr);
    dlLink.setAttribute("download", "exportData.json");
    dlLink.click();
  }

  downloadImage(data: any) {
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:image/png;base64,' + encodeURIComponent(data);
    dlLink.setAttribute("href", dataStr);
    dlLink.setAttribute("download", "exportData.jpg");
    dlLink.click()
  }

   takeScreenShot() {
    let doc = this.windowRefService.getDoc();
    screenshot().then((img) => {
      this.downloadImage(this.encode(img));
    })
  }


 encode (input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                  keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}
}
