import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-update-toast',
  templateUrl: './update-toast.component.html',
  styleUrls: ['./update-toast.component.css'],
  animations: [
    trigger('toast', [
      state('show', style({
        top: '20px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ])
  ]
})
export class UpdateToastComponent implements OnInit {

  showToast: string = 'hide';
  showReleaseNotesCard: string = 'hide';
  destroyToast: boolean = false;
  destroyReleaseNotesCard: boolean = false;
  releaseNotes: string;
  releaseName: string;
  downloadingUpdate: boolean = false;
  updateDownloaded: boolean = false;
  version: string;
  constructor(private electronService: ElectronService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.electronService.ipcRenderer.once('release-info', (event, info) => {
      console.log(info);
      this.releaseName = info.releaseName;
      this.releaseNotes = info.releaseNotes.substring(info.releaseNotes.indexOf('</h1>') + 5);
      this.version = info.version;
      setTimeout(() => {
        this.showToast = 'show';
      }, 500);
    })

    this.electronService.ipcRenderer.once('update-downloaded', (event, args) => {
      this.updateDownloaded = true;
      this.cd.detectChanges();
    })
  }

  closeToast() {
    this.showToast = 'hide';
    this.cd.detectChanges();
    setTimeout(() => {
      this.destroyToast = true;
      // this.emitCloseToast.emit(true);
    }, 500);
  }

  viewReleaseNotes() {
    this.destroyReleaseNotesCard = false;
    this.showReleaseNotesCard = 'show';
    this.cd.detectChanges();
  }

  closeReleaseNotes() {
    this.showReleaseNotesCard = 'hide';
    this.cd.detectChanges();
    setTimeout(() => {
      this.destroyReleaseNotesCard = true;
      // this.emitCloseToast.emit(true);
    }, 500);
  }

  updateNow() {
    this.downloadingUpdate = true;
    this.cd.detectChanges();
    this.electronService.ipcRenderer.send('update', null);
  }

  quitAndInstall(){
    this.electronService.ipcRenderer.send('quit-and-install');
  }
}
