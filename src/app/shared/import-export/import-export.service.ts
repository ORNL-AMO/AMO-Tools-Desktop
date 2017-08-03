import { Injectable } from '@angular/core';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { MockDirectory } from '../mocks/mock-directory';
declare var screenshot;
declare var electron;
import { ElectronService } from 'ngx-electron';
@Injectable()
export class ImportExportService {
  callback: any = this.downloadData;
  constructor(private windowRefService: WindowRefService, private electronService: ElectronService) { }

  test() {
    // console.log(electron);
    // console.log(this.electronService.desktopCapturer);
    // this.electronService.desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
    //   sources.forEach(source => {
    //     if(source.name == "AMOToolsDesktop"){
    //       let tmp = source.thumbnail.toJPEG(100);
          
    //       debugger
    //     }
    //   })
    // });
  }

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
    this.electronService.desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
      sources.forEach(source => {
        if(source.name == "AMOToolsDesktop"){
          let tmp = source.thumbnail.toJPEG(100000);
          let dataUrl = source.thumbnail.toDataURL();
          let test2 = source.thumbnail.getBitmap();
          let data = this.encode(test2);
          debugger
          this.downloadImage(data);
        }
      })
    });
  }


  encode(input) {
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

  // handleStream(stream) {
  //   debugger
  //   // let document = this.windowRefService.getDoc();
  //   // Create hidden video tag
  //   var video = window.document.createElement('video');
  //   video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
  //   // Event connected to stream
  //   video.onloadedmetadata = function () {
  //     // Set video ORIGINAL height (screenshot)
  //     video.style.height = stream.videoHeight + 'px'; // videoHeight
  //     video.style.width = stream.videoWidth + 'px'; // videoWidth

  //     // Create canvas
  //     var canvas = window.document.createElement('canvas');
  //     canvas.width = stream.videoWidth;
  //     canvas.height = stream.videoHeight;
  //     var ctx = canvas.getContext('2d');
  //     // Draw video on canvas
  //     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);


  //     let tmp = canvas.toDataURL('image/jpg');
  //     debugger
  //     // Remove hidden video tag
  //     video.remove();
  //     try {
  //       // Destroy connect to stream
  //       stream.getTracks()[0].stop();
  //     } catch (e) { }
  //   }
  // };
  // getSources() {
  //   this.electronService.desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
  //     if (error) throw error;
  //     // console.log(sources);
  //     for (let i = 0; i < sources.length; ++i) {
  //       console.log(sources);
  //       // Filter: main screen
  //       if (sources[i].name === "Entire screen") {
  //         navigator.getUserMedia({
  //           audio: false,
  //           video: {
  //             width: { min: 1280 },
  //             height: { min: 720 }
  //           }
  //         }, this.handleStream, this.handleError);

  //         return;
  //       }
  //     }
  //   });
  // }

  // handleError(err) {
  //   console.log(err)
  // }


  fullscreenScreenshot(callback, imageFormat) {
    var _this1 = this;
    this.callback = callback;
    imageFormat = imageFormat || 'image/jpeg';

    let handleStream = (stream) => {
      // Create hidden video tag
      debugger
      var video = document.createElement('video');
      video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
      // Event connected to stream
      video.onloadedmetadata = function () {
      debugger
        // Set video ORIGINAL height (screenshot)
        video.style.height = stream.videoHeight + 'px'; // videoHeight
        video.style.width = stream.videoWidth + 'px'; // videoWidth

        // Create canvas
        var canvas = document.createElement('canvas');
        canvas.width = stream.videoWidth;
        canvas.height = stream.videoHeight;
        var ctx = canvas.getContext('2d');
        // Draw video on canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (_this1.callback) {
          // Save screenshot to base64
          _this1.callback(canvas.toDataURL(imageFormat));
        } else {
          console.log('Need callback!');
        }

        // Remove hidden video tag
        video.remove();
        try {
          // Destroy connect to stream
          stream.getTracks()[0].stop();
        } catch (e) { }
      }
      debugger
      video.src = URL.createObjectURL(stream);
      document.body.appendChild(video);
    };

    let handleError = function (e) {
      console.log(e);
    };

    // Filter only screen type
    this.electronService.desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
      if (error) throw error;
      // console.log(sources);
      for (let i = 0; i < sources.length; ++i) {
        console.log(sources);
        // Filter: main screen
        if (sources[i].name === "Entire screen") {
          navigator.getUserMedia({
            audio: false,
            video: {
              width: { min: 1280 },
              height: { min: 720 }
            }
          }, handleStream, handleError);

          return;
        }
      }
    });
  }
}
