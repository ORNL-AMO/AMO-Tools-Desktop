import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Fan203Inputs } from '../shared/models/fans';

declare var fanAddon: any; 

@Injectable()
export class FsatService {


  mainTab:BehaviorSubject<string>
  stepTab: BehaviorSubject<string>;
  constructor() { 
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.stepTab = new BehaviorSubject<string>('system-basics');
  }

  test(){
    console.log(fanAddon);
  }

  fan203(input: Fan203Inputs){
    return fanAddon.fan203(input);
  }
}
