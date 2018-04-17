import { Injectable } from '@angular/core';
import { WindowRefService } from '../../indexedDb/window-ref.service';
declare var screenshot;
declare var electron;
import { ElectronService } from 'ngx-electron';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { DirectoryDbRef, Directory } from '../models/directory';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ImportExportService {

  exportData: Array<any>;
  allDirectories: Directory;
  selectedItems: Array<any>;

  toggleDownload: BehaviorSubject<boolean>;

  constructor(private windowRefService: WindowRefService, private electronService: ElectronService, private indexedDbService: IndexedDbService) {
    this.toggleDownload = new BehaviorSubject<boolean>(null);
   }

  test() { }

  downloadData(data: any) {
    data.push({ origin: 'AMO-TOOLS-DESKTOP' });
    let stringifyData = JSON.stringify(data);
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    dlLink.setAttribute("href", dataStr);
    const date = new Date();
    const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
    dlLink.setAttribute('download', 'ExportedData_' + dateStr + '.json');
    dlLink.click();
  }

  downloadImage(data: any) {
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let newDataStr = data.replace(/^data:image\/[^;]/, 'data:application/octet-stream')
    dlLink.setAttribute("href", newDataStr);
    dlLink.setAttribute("download", "exportData.png");
    dlLink.click()
  }

  openMailTo() {
    let subject = "AMO Tools Feedback";
    let bodyMsg = "We appreciate your feedback. Please attach any screen shots or your current data set that you would like us to review.";
    let mailToString: string = 'mailto:accawigk@ornl.gov?subject='+subject+'&body='+bodyMsg;
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    dlLink.setAttribute("href", mailToString);
    dlLink.click()
  }

  takeScreenShot() {
    this.electronService.desktopCapturer.getSources({ types: ['window', 'screen'], thumbnailSize: { width: 1400, height: 1000 } }, (error, sources) => {
      sources.forEach(source => {
        if (source.name == "AMOToolsDesktop") {
          let dataUrl = source.thumbnail.toDataURL();
          this.downloadImage(dataUrl);
        }
      })
    });
  }

  createFile(dataUrl) {
    let doc = this.windowRefService.getDoc();
    var blob = this.dataURItoBlob(dataUrl);
    var fd = new FormData();
    fd.append("file", blob, "screenshot.png");
  }

  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  srcToFile(src, fileName, mimeType) {
    return (fetch(src)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], fileName, { type: mimeType }); })
    );
  }


  //EXPORT DATA FUNCTIONS
  initAllDirectories(): Promise<any> {
    return new Promise((resolve, reject) => {
      // this.indexedDbService.getDirectory(1).then(
      //   results => {
      //     if (results) {
      //       this.allDirectories = this.populateDirectories(results);
      //       resolve(this.allDirectories);
      //     }
      //   })
    })
  }


  populateDirectories(directoryRef: DirectoryDbRef): Directory {
    let tmpDirectory: Directory = {
      name: directoryRef.name,
      createdDate: directoryRef.createdDate,
      modifiedDate: directoryRef.modifiedDate,
      id: directoryRef.id,
      collapsed: false,
      parentDirectoryId: directoryRef.parentDirectoryId
    }
    // this.indexedDbService.getDirectoryAssessments(directoryRef.id).then(
    //   results => {
    //     tmpDirectory.assessments = results;
    //   }
    // );

    // this.indexedDbService.getChildrenDirectories(directoryRef.id).then(
    //   results => {
    //     tmpDirectory.subDirectory = results;
    //   }
    // )
    return tmpDirectory;
  }

  getSelected(dir: Directory) {
    // if (dir.assessments) {
    //   dir.assessments.forEach(
    //     assessment => {
    //        let assessmentDir;
    //       if (dir.id != this.allDirectories.id) {
    //         assessmentDir = dir;
    //       }
    //       if (this.allDirectories.id == dir.id) {
    //         this.selectedItems.push({ assessment: assessment, directory: this.allDirectories.id });
    //       } else if (dir.id != this.allDirectories.id) {
    //         this.selectedItems.push({ assessment: assessment, directory: assessmentDir });
    //       }
    //     }
    //   )
    // } else {
    //   this.indexedDbService.getDirectoryAssessments(dir.id).then(
    //     resultAssessments => {
    //       if (resultAssessments.length != 0) {
    //         resultAssessments.forEach(assessment => { this.selectedItems.push({ assessment: assessment, directory: dir }) })
    //       }
    //     }
    //   )
    // }
    // this.indexedDbService.getChildrenDirectories(dir.id).then(
    //   resultDir => {
    //     if (resultDir.length != 0) {
    //       resultDir.forEach(dir => this.getSelected(dir));
    //     }
    //   }
    // )
  }



  getAssessmentSettings(item: any) {
    //check for assessment settings
    // this.indexedDbService.getAssessmentSettings(item.assessment.id).then(
    //   results => {
    //     if (results.length != 0) {
    //       this.exportData.push({ assessment: item.assessment, settings: results[0], directory: item.directory });
    //     } else {
    //       //no assessment settings, find dir settings being usd
    //       this.getParentDirSettingsThenResults(item.assessment.directoryId, item);
    //     }
    //   }
    // )
  }

  getParentDirSettingsThenResults(parentDirectoryId: number, item: any) {
    //get parent directory
    // this.indexedDbService.getDirectory(parentDirectoryId).then(
    //   results => {
    //     let parentDirectory = results;
    //     //get parent directory settings
    //     this.indexedDbService.getDirectorySettings(parentDirectory.id).then(
    //       results => {
    //         if (results.length != 0) {
    //           this.exportData.push({ assessment: item.assessment, settings: results[0], directory: item.directory });
    //         } else {
    //           //no settings try again with parents parent directory
    //           this.getParentDirSettingsThenResults(parentDirectory.parentDirectoryId, item)
    //         }
    //       })
    //   }
    // )
  }

}

