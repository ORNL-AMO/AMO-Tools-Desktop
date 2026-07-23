import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import _ from 'lodash';
import { DashboardService } from '../../dashboard/dashboard.service';
import { WaterProcessDiagramService } from '../water-process-diagram.service';
import { Diagram } from '../../shared/models/diagram';


@Component({
  selector: 'app-water-diagram-banner',
  standalone: false,
  templateUrl: './water-diagram-banner.component.html',
  styleUrl: './water-diagram-banner.component.css'
})
export class WaterDiagramBannerComponent {
  @Input()
  diagram: Diagram;
  
  mainTab: string;
  mainTabSub: Subscription;
  bannerCollapsed: boolean = true;

    constructor(private waterProcessService: WaterProcessDiagramService,
      private modalDialogService: ModalDialogService,
      private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.mainTabSub = this.waterProcessService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
  }


  setMainTab(str: string) {
    this.waterProcessService.mainTab.next(str);
    this.collapseBanner();
  }

  showSecurityAndPrivacyModal() {
    this.modalDialogService.openModal<SecurityAndPrivacyItemComponent, undefined>(
      SecurityAndPrivacyItemComponent,
    );
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back(){
    if (this.mainTab == 'diagram') {
      this.waterProcessService.mainTab.next('setup');    
    } 
  }

  continue(){
    if (this.mainTab == 'setup') {
      this.waterProcessService.mainTab.next('setup');    
    } 
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

}
