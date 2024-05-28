import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { WaterProcess } from '../../process-flow-types/process-flow-types';

@Injectable({
  providedIn: 'root'
})
export class WaterProcessDiagramService {
  mainTab: BehaviorSubject<string>;
  waterProcess: BehaviorSubject<WaterProcess>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;

  constructor() { 
    this.mainTab = new BehaviorSubject<string>('setup');
    let waterProcess: WaterProcess = this.getDefaultWaterProcess();
    this.waterProcess = new BehaviorSubject<WaterProcess>(waterProcess);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.settings = new BehaviorSubject<Settings>(undefined);
    // this.focusedField = new BehaviorSubject<string>('default');

  }

  getDefaultWaterProcess(): WaterProcess {
    return {
      id: 1,
      name: 'test',
      isValid: true,
      directoryId: 1

    }
  }
}
