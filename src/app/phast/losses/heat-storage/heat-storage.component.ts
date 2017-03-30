import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { HeatStorageService } from './heat-storage.service';
import { PhastService } from '../../phast.service';

@Component({
  selector: 'app-heat-storage',
  templateUrl: './heat-storage.component.html',
  styleUrls: ['./heat-storage.component.css']
})
export class HeatStorageComponent implements OnInit {
  heatStorage: Array<any>;

  constructor(private heatStorageService: HeatStorageService, private phastService: PhastService) { }

  ngOnInit(){
    if(!this.heatStorage){
      this.heatStorage = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.heatStorageService.initForm();
    let tmpName = 'Loss #' + (this.heatStorage.length + 1);
    this.heatStorage.push({ 
      form: tmpForm, 
      name: tmpName
    });
  }

  removeLoss(str: string) {
    this.heatStorage = _.remove(this.heatStorage, loss => {
      return loss.name != str;
    });
    this.renameLoss();
  }

  renameLoss() {
    let index = 1;
    this.heatStorage.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(){
    //TODO call phast service to calculate heatLoss
  }

}
