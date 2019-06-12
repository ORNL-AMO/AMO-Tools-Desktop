import { Component, OnInit } from '@angular/core';
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
  showReleaseNotesCard: string = 'show';
  destroyToast: boolean = false;
  destroyReleaseNotesCard: boolean = false;
  releaseNotes: string;
  releaseName: string;
  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    this.electronService.ipcRenderer.once('release-info', (event, info) => {
      this.releaseName = info.releaseName;
      this.releaseNotes = info.releaseNotes;
      console.log(info);
      setTimeout(() => {
        this.showToast = 'show';
      }, 500);
    })
  }

  closeToast() {
    this.showToast = 'hide';
    setTimeout(() => {
      this.destroyToast = true;
      // this.emitCloseToast.emit(true);
    }, 500);
  }

  viewReleaseNotes() {
    this.showReleaseNotesCard = 'show';
  }

  closeReleaseNotes() {
    this.showReleaseNotesCard = 'hide';
    setTimeout(() => {
      this.destroyReleaseNotesCard = true;
      // this.emitCloseToast.emit(true);
    }, 500);
  }

  updateNow() {

  }
}
