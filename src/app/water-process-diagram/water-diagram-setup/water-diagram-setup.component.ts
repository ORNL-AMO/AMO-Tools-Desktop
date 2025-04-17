import { Component } from '@angular/core';
import { WaterProcessDiagramService } from '../water-process-diagram.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { WaterDiagramOption, WaterDiagram } from 'process-flow-lib';


@Component({
  selector: 'app-water-diagram-setup',
  standalone: false,
  templateUrl: './water-diagram-setup.component.html',
  styleUrl: './water-diagram-setup.component.css'
})
export class WaterDiagramSetupComponent {
  allWaterDiagramsSub: Subscription;
  mainTabSubscription: Subscription;
  selectedDiagramSubscription: Subscription;
  
  waterDiagramOptions: Array<WaterDiagramOption>;
  selectedWaterDiagram: WaterDiagram;


  constructor(private waterProcessDiagramService: WaterProcessDiagramService) { }

  ngOnInit() {
    
    // this.allWaterDiagramsSub = this.waterProcessDiagramService.allDiagrams.subscribe((allDiagrams: WaterDiagram[]) => {
    //   if (allDiagrams && allDiagrams.length > 0) {
    //     this.getWaterDiagramSelectOptions();
    //   }
    // });

    // this.selectedDiagramSubscription = this.waterProcessDiagramService.selectedWaterDiagram.subscribe((selectedWaterDiagram: WaterDiagram) => {
    //   if (selectedWaterDiagram) {
    //     this.selectedWaterDiagram = selectedWaterDiagram;
    //   } 
    // });

    // this.mainTabSubscription = this.waterProcessDiagramService.mainTab.subscribe((mainTab: string) => {
    //   this.getWaterDiagramSelectOptions();
    // });

  }

  ngOnDestroy() {
    // this.allWaterDiagramsSub.unsubscribe();
    // this.selectedDiagramSubscription.unsubscribe();
    // this.mainTabSubscription.unsubscribe();
  }

  getWaterDiagramSelectOptions() {
    // let allDiagrams: WaterDiagram[] = this.waterProcessDiagramService.allDiagrams.getValue()
    // allDiagrams = (_.orderBy(allDiagrams, 'modifiedDate', 'desc'));
    // this.waterDiagramOptions = allDiagrams.map(diagram => {
    //   let diagramOption: WaterDiagramOption = {
    //     display: diagram.name,
    //     id: diagram.id,
    //   }
    //   return diagramOption;
    // });

    // if (!this.selectedWaterDiagram && this.waterDiagramOptions && this.waterDiagramOptions.length > 0) {
    //   this.waterProcessDiagramService.setSelectedDiagram(this.waterDiagramOptions[0].id);
    // }
  }

  // async createDiagram() {
  //   await this.waterProcessDiagramService.createWaterDiagram();
  //   this.waterProcessDiagramService.mainTab.next('diagram');
  // }


  // async selectedDiagram(option: WaterDiagramOption) {
  //   await this.waterProcessDiagramService.setSelectedDiagram(option.id);
  //   this.waterProcessDiagramService.mainTab.next('diagram');
  // }
}
