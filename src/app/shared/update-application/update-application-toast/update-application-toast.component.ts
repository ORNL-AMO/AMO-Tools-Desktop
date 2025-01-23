import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReleaseData, ElectronService } from '../../../electron/electron.service';
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
    ]
})
export class UpdateApplicationToastComponent {
  releaseData: ReleaseData;
  toastAnimate: 'hide' | 'show' = 'hide';
  updateStatus: UpdateStatus;
  isDownloading: boolean;

  releaseDataSub: Subscription;
  electronUpdateAvailableSub: Subscription;
  updateDownloadedSub: Subscription;
  updateErrorSub: Subscription;
  showUpdateToastSub: Subscription;
  webAndPwaUpdateSub: Subscription;

  constructor(private electronService: ElectronService,
    private updateApplicationService: UpdateApplicationService,
    private serviceWorkerUpdates: SwUpdate,
  ) { }

  ngOnInit() {
    this.releaseDataSub = this.electronService.releaseData.subscribe(releaseData => {
      this.releaseData = releaseData;
    });

    this.webAndPwaUpdateSub = this.updateApplicationService.webUpdateAvailable.subscribe(webAvailable => {
      if (webAvailable) {
        this.showUpdateToast('web-available');
      }
    });

    this.showUpdateToastSub = this.updateApplicationService.showUpdateToast.subscribe(showUpdateToast => {
      if (showUpdateToast) {
        let platformAvailable: 'desktop-available' | 'web-available' = this.electronService.isElectron? 'desktop-available' : 'web-available';
        this.showUpdateToast(platformAvailable);
      }
    });

    if (this.electronService.isElectron) {
      this.electronUpdateAvailableSub = this.electronService.updateAvailable.subscribe(hasUpdate => {
        if (hasUpdate) {
          this.showUpdateToast();
        } else if (this.toastAnimate === 'show') {
          this.closeUpdateToast();
        }
      });

      this.updateDownloadedSub = this.electronService.updateDownloaded.subscribe(downloaded => {
        if (downloaded) {
          this.updateStatus = 'downloaded';
        }
      });

      this.updateErrorSub = this.electronService.updateError.subscribe(error => {
        if (error) {
          this.updateStatus = 'error';
        }
      });
    }

  }

  ngOnDestroy() {
    this.toastAnimate = 'hide';
    this.updateStatus = undefined;
    this.releaseDataSub.unsubscribe();
    this.webAndPwaUpdateSub.unsubscribe();

    if (this.electronService.isElectron) {
      this.electronUpdateAvailableSub.unsubscribe();
      this.updateDownloadedSub.unsubscribe();
      this.updateErrorSub.unsubscribe();

    }
  }


  async downloadUpdate() {
    this.updateStatus = 'downloading';
    this.electronService.sendUpdateSignal();
  }

  async quitAndInstall() {
    this.electronService.sendQuitAndInstall();
  }

  updateWeb() {
    this.serviceWorkerUpdates.activateUpdate()
        .then((success) => {
          console.log('MEASUR updated successfully')
          window.location.reload();
        })
        .catch(error => {
          console.log('error during MEASUR update')
          this.updateStatus = 'web-error';
        });
  }

  viewReleaseNotes() {
    this.updateApplicationService.showReleaseNotesModal.next(true);
  }

  showUpdateToast(platformAvailable: 'web-available' | 'desktop-available' = 'desktop-available') {
    this.updateStatus = platformAvailable;
    this.toastAnimate = 'show';
  }

  closeUpdateToast() {
    this.toastAnimate = 'hide';
    setTimeout(() => {
      // * allow animation to finish
      this.updateStatus = undefined;
    }, 2000);
  }

}

export type UpdateStatus = 'desktop-available' | 'web-available' | 'downloading' | 'downloaded' | 'error' | 'web-error' | undefined;