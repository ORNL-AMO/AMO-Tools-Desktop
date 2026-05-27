import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Subscription } from 'rxjs';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
import { DashboardService } from '../dashboard.service';
import { environment } from '../../../environments/environment';
import { ExportService } from '../../shared/import-export/export.service';
import { UpdateApplicationService } from '../../shared/update-application/update-application.service';
import { EmailListSubscribeService } from '../../shared/subscribe-toast/email-list-subscribe.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent implements OnInit {
  @Output('openModal')
  openModal = new EventEmitter<boolean>();

  versionNum: any;
  showModal: boolean;
  updateDashboardDataSub: Subscription;
  rootDirectory: Directory;
  selectedDirectoryId: number;
  selectedDirectoryIdSub: Subscription;
  showNewDropdown: boolean = false;
  isSidebarCollapsed: boolean = false;
  collapseSidebarSub: Subscription;

  collapsedXWidth: number = 48;
  expandedXWidth: number = 350;
  showSubscribeLink: boolean;
  isEmailSubscriberSub: Subscription;

  helpFlyoutActive = false;
  helpFlyoutTop = 0;
  helpFlyoutLeft = 0;
  private helpHideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private directoryDbService: DirectoryDbService,
    private exportService: ExportService,
    private updateApplicationService: UpdateApplicationService,
    private emailSubscribeService: EmailListSubscribeService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
    private elRef: ElementRef
  ) { }

  ngOnInit() {
    this.versionNum = environment.version;

    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(_ => {
      this.rootDirectory = this.directoryDbService.getById(1);
      this.rootDirectory.collapsed = false;
    });

    this.selectedDirectoryIdSub = this.directoryDashboardService.selectedDirectoryId.subscribe(val => {
      this.selectedDirectoryId = val;
    });

    this.isEmailSubscriberSub = this.emailSubscribeService.isSubscribed.subscribe((isSubscribed: boolean) => {
      this.showSubscribeLink = !isSubscribed;
    });

    this.collapseSidebarSub = this.dashboardService.collapseSidebar.subscribe(shouldCollapse => {
      if (shouldCollapse !== undefined) {
        this.collapseSidebar(shouldCollapse);
      }
    });

    this.initSidebarView();
  }

  ngOnDestroy() {
    this.updateDashboardDataSub.unsubscribe();
    this.selectedDirectoryIdSub.unsubscribe();
    this.collapseSidebarSub.unsubscribe();
    this.isEmailSubscriberSub.unsubscribe();
    if (this.helpHideTimer) clearTimeout(this.helpHideTimer);
  }

  onHelpEnter(event: MouseEvent) {
    if (this.helpHideTimer) { clearTimeout(this.helpHideTimer); this.helpHideTimer = null; }
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.helpFlyoutTop = rect.top;
    this.helpFlyoutLeft = rect.right;
    this.helpFlyoutActive = true;
    this.cd.detectChanges();
    this.clampHelpFlyout();
  }

  private clampHelpFlyout() {
    const flyout = this.elRef.nativeElement.querySelector('.help-flyout') as HTMLElement;
    if (!flyout) return;
    const pad = 8;
    const maxTop = window.innerHeight - flyout.offsetHeight - pad;
    if (this.helpFlyoutTop > maxTop) {
      this.helpFlyoutTop = Math.max(pad, maxTop);
    }
  }

  onHelpLeave() {
    if (this.helpHideTimer) { clearTimeout(this.helpHideTimer); this.helpHideTimer = null; }
    this.helpHideTimer = setTimeout(() => { this.helpFlyoutActive = false; }, 300);
  }

  onHelpFlyoutEnter() {
    if (this.helpHideTimer) { clearTimeout(this.helpHideTimer); this.helpHideTimer = null; }
  }

  onHelpFlyoutLeave() {
    if (this.helpHideTimer) { clearTimeout(this.helpHideTimer); this.helpHideTimer = null; }
    this.helpHideTimer = setTimeout(() => { this.helpFlyoutActive = false; }, 300);
  }

  onHelpFocusIn(event: FocusEvent) {
    if (this.helpHideTimer) { clearTimeout(this.helpHideTimer); this.helpHideTimer = null; }
    if (this.helpFlyoutActive) return;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.helpFlyoutTop = rect.top;
    this.helpFlyoutLeft = rect.right;
    this.helpFlyoutActive = true;
    this.cd.detectChanges();
    this.clampHelpFlyout();
  }

  onHelpFocusOut(event: FocusEvent) {
    const group = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as Node | null;
    if (!relatedTarget || !group.contains(relatedTarget)) {
      if (this.helpHideTimer) { clearTimeout(this.helpHideTimer); this.helpHideTimer = null; }
      this.helpHideTimer = setTimeout(() => { this.helpFlyoutActive = false; }, 300);
    }
  }

  onHelpEscapeKey() {
    this.helpFlyoutActive = false;
  }

  downloadData() {
    this.exportService.exportAll = true;
    this.directoryDashboardService.showExportModal.next(true);
  }

  showCreateAssessment() {
    this.directoryDashboardService.createFolder.next(false);
    this.dashboardService.showCreateInventory.next(undefined);
    this.showNewDropdown = false;
    this.dashboardService.createAssessment.next(true);
  }

  showCreateInventory() {
    this.dashboardService.createAssessment.next(false);
    this.directoryDashboardService.createFolder.next(false);
    this.showNewDropdown = false;
    this.dashboardService.showCreateInventory.next('motorInventory');
  }

  showCreateDiagram() {
    this.dashboardService.createAssessment.next(false);
    this.directoryDashboardService.createFolder.next(false);
    this.dashboardService.showCreateInventory.next(undefined);
    this.showNewDropdown = false;
    this.dashboardService.showCreateDiagram.next(true);
  }

  showCreateFolder() {
    this.dashboardService.createAssessment.next(false);
    this.dashboardService.showCreateInventory.next(undefined);
    this.showNewDropdown = false;
    this.directoryDashboardService.createFolder.next(true);
  }

  showSubscribeModal() {
    this.emailSubscribeService.showModal.next(true);
  }

  initSidebarView() {
    let totalScreenWidth: number = this.dashboardService.totalScreenWidth.getValue();
    if (totalScreenWidth < 1024) {
      this.dashboardService.sidebarX.next(this.collapsedXWidth);
      this.isSidebarCollapsed = true;
      this.cd.detectChanges();
    }
  }

  navigateWithSidebarOptions(url: string, shouldCollapse?: boolean) {
    this.dashboardService.navigateWithSidebarOptions(url, { shouldCollapse: shouldCollapse });
  }

  collapseSidebar(isNavigationCollapse?: boolean) {
    if (isNavigationCollapse !== undefined) {
      this.isSidebarCollapsed = isNavigationCollapse;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    const totalScreenWidth: number = this.dashboardService.totalScreenWidth.getValue();
    this.expandedXWidth = totalScreenWidth < 1024 ? totalScreenWidth : 320;

    this.dashboardService.sidebarX.next(
      this.isSidebarCollapsed ? this.collapsedXWidth : this.expandedXWidth
    );
    window.dispatchEvent(new Event('resize'));
  }

  openVersionModal() {
    this.updateApplicationService.showReleaseNotesModal.next(true);
  }

  toggleNewDropdown() {
    this.showNewDropdown = !this.showNewDropdown;
  }
}
