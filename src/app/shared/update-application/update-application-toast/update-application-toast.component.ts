import { Component } from '@angular/core';
import { combineLatestWith, Observable, Subscription } from 'rxjs';
import { ReleaseData, ElectronService, DownloadProgress } from '../../../electron/electron.service';
import { UpdateApplicationService } from '../update-application.service';
import { SwUpdate } from '@angular/service-worker';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-update-application-toast',
    templateUrl: './update-application-toast.component.html',
    styleUrl: './update-application-toast.component.css',
    animations: [
        trigger('toastAnimate', [
            state('show', style({ top: '0px' })),
            state('hide', style({ top: '-300px' })),
            transition('hide => show', animate('.5s ease')),
            transition('show => hide', animate('.5s ease'))
        ])
    ],
    standalone: false
})
export class UpdateApplicationToastComponent {
  releaseData: ReleaseData;
  toastAnimate: 'hide' | 'show' = 'hide';
  updateStatus: UpdateStatus;
  updateError: string;
  isDownloading: boolean;

  electronUpdateAvailableSub: Subscription;
  updateDownloadedSub: Subscription;
  updateErrorSub: Subscription;
  showUpdateToastSub: Subscription;
  webAndPwaUpdateSub: Subscription;
  downloadProgressSub: Subscription;
  progress: DownloadProgress;

  constructor(private electronService: ElectronService,
    private updateApplicationService: UpdateApplicationService,
    private serviceWorkerUpdates: SwUpdate,
  ) { }

  ngOnInit() {
    this.webAndPwaUpdateSub = this.updateApplicationService.webUpdateAvailable.subscribe(webAvailable => {
      if (webAvailable) {
        console.log('web update available - show update toast');
        this.showUpdateToast('web-available');
      }
    });

    this.showUpdateToastSub = this.updateApplicationService.showUpdateToast.subscribe(showUpdateToast => {
      if (showUpdateToast) {
        let platformAvailable: 'desktop-available' | 'web-available' = this.electronService.isElectron? 'desktop-available' : 'web-available';
        console.log(`${platformAvailable} update available - show update toast`);
        this.showUpdateToast(platformAvailable);
      }
    });

    if (this.electronService.isElectron) {
      let isUpdateAvailable: Observable<any> = this.electronService.updateAvailable
      .pipe(
        combineLatestWith(this.electronService.releaseData)
      );

    this.electronUpdateAvailableSub = isUpdateAvailable.subscribe(([hasUpdate, releaseData]) => {
        if (hasUpdate && releaseData) {
          this.releaseData = releaseData;
          this.showUpdateToast();
        } else if (this.toastAnimate === 'show') {
          this.closeUpdateToast();
        }
    }); 

      this.updateDownloadedSub = this.electronService.updateDownloaded.subscribe(downloaded => {
        if (downloaded) {
          this.updateStatus = 'downloaded';
          console.log('updateDownloaded updateStatus', this.updateStatus);
        }
      });   
      this.updateErrorSub = this.electronService.updateError.subscribe(error => {
        if (error) {
          this.updateError = error;
          this.updateStatus = 'error';
          console.log('updateError updateStatus', this.updateStatus);
        } 
      });
      
      this.downloadProgressSub = this.electronService.downloadProgress.subscribe(progress => {
        if (progress) {
          this.progress = progress;
        }
      });
    }
  }

  ngOnDestroy() {
    this.toastAnimate = 'hide';
    this.updateStatus = undefined;
    this.webAndPwaUpdateSub.unsubscribe();
    this.showUpdateToastSub.unsubscribe();

    if (this.electronService.isElectron) {
      this.electronUpdateAvailableSub.unsubscribe();
      this.updateDownloadedSub.unsubscribe();
      this.updateErrorSub.unsubscribe();
      this.downloadProgressSub.unsubscribe();
    }
  }

  downloadUpdate() {
    this.updateStatus = 'downloading';
    console.log('downloadUpdate updateStatus', this.updateStatus);
    this.electronService.sendUpdateSignal();
  }

  quitAndInstall() {
    this.electronService.sendQuitAndInstall();
  }

  updateWeb() {
    this.serviceWorkerUpdates.activateUpdate()
        .then((success) => {
          console.log('MEASUR Web updated successfully')
          window.location.reload();
        })
        .catch(error => {
          console.log('error during MEASUR Web update')
          this.updateStatus = 'web-error';
          console.log('updateWeb updateStatus', this.updateStatus);
        });
  }

  viewReleaseNotes() {
    this.updateApplicationService.showReleaseNotesModal.next(true);
  }

  showUpdateToast(platformAvailable: 'web-available' | 'desktop-available' = 'desktop-available') {
    this.updateStatus = platformAvailable;
    console.log('showUpdateToast updateStatus', this.updateStatus);
    this.toastAnimate = 'show';
  }

  closeUpdateToast() {
    this.toastAnimate = 'hide';
    setTimeout(() => {
      // * allow animation to finish
      this.updateStatus = undefined;
      console.log('closeUpdateToast updateStatus', this.updateStatus);
    }, 550);
  }

}

export type UpdateStatus = 'desktop-available' | 'web-available' | 'downloading' | 'downloaded' | 'error' | 'web-error' | undefined;