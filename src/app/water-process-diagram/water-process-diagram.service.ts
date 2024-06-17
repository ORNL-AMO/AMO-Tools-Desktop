import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { ParentContainerDimensions, WaterDiagram, WaterDiagramOption } from '../../process-flow-types/shared-process-flow-types';
import { WaterProcessIdbService } from '../indexedDb/water-process-idb.service';
import * as _ from 'lodash';
import { getNameDateString, getNewIdString } from '../shared/helperFunctions';

@Injectable({
  providedIn: 'root'
})
export class WaterProcessDiagramService {
  mainTab: BehaviorSubject<string>;
  selectedWaterDiagram: BehaviorSubject<WaterDiagram>;
  allDiagrams: BehaviorSubject<WaterDiagram[]>;
  parentContainer: BehaviorSubject<ParentContainerDimensions>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;

  constructor(private waterDiagramIdbService: WaterProcessIdbService) { 
    this.mainTab = new BehaviorSubject<string>('setup');
    this.selectedWaterDiagram = new BehaviorSubject<WaterDiagram>(undefined);
    this.parentContainer = new BehaviorSubject<ParentContainerDimensions>(undefined);
    this.allDiagrams = new BehaviorSubject<WaterDiagram[]>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.settings = new BehaviorSubject<Settings>(undefined);
    // this.focusedField = new BehaviorSubject<string>('default');
  }

  async setWaterDiagrams() {
    let allDiagrams: Array<WaterDiagram> = await firstValueFrom(this.waterDiagramIdbService.getAllDiagrams());
    this.allDiagrams.next(allDiagrams);
  }

  setSelectedDiagram(id: number) {
    let selectedDiagram = this.waterDiagramIdbService.findById(id, this.allDiagrams.getValue());
    this.selectedWaterDiagram.next(selectedDiagram);
  }
  
  async createWaterDiagram() {
    let newWaterDiagram = await firstValueFrom(this.waterDiagramIdbService.addWithObservable(this.getDefaultWaterDiagram()));
    this.selectedWaterDiagram.next(newWaterDiagram);
  }

  getDefaultWaterDiagram(): WaterDiagram {
    let currentDate = new Date();
    let defaultName = getNewIdString();
    // let defaultName = `Water Diagram ${getNameDateString(currentDate)}`;
    return {
      modifiedDate: new Date(),
      name: 'Water_Diagram_' + String(defaultName).slice(0,2),
      isValid: true,
      // todo will we need dir id?
      // directoryId: 1,
      flowDiagramData: {
        nodes: [],
        edges: []
      }
    }
  }

  async updateWaterDiagram(waterDiagram: WaterDiagram) {
    await firstValueFrom(this.waterDiagramIdbService.updateWithObservable(waterDiagram));
    await this.setWaterDiagrams();
  }
  
}
