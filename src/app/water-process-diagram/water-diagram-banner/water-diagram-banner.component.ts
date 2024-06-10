import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import _ from 'lodash';
import { DashboardService } from '../../dashboard/dashboard.service';
import { WaterProcessDiagramService } from '../water-process-diagram.service';
import { WaterDiagram } from '../../../process-flow-types/process-flow-types';


@Component({
  selector: 'app-water-diagram-banner',
  templateUrl: './water-diagram-banner.component.html',
  styleUrl: './water-diagram-banner.component.css'
})
export class WaterDiagramBannerComponent {
  mainTab: string;
  mainTabSub: Subscription;
  waterDiagram: WaterDiagram;
  waterDiagramSub: Subscription;
  bannerCollapsed: boolean = true;

    constructor(private waterProcessService: WaterProcessDiagramService, 
      private securityAndPrivacyService: SecurityAndPrivacyService, 
      private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.mainTabSub = this.waterProcessService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.waterDiagramSub = this.waterProcessService.selectedWaterDiagram.subscribe(val => {
      this.waterDiagram = val;
    });

  }

  ngOnDestroy() {
    this.waterDiagramSub.unsubscribe();
    this.mainTabSub.unsubscribe();
  }


  setMainTab(str: string) {
    this.waterProcessService.mainTab.next(str);
    this.collapseBanner();
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
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
