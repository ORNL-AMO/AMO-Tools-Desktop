import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../log-tool.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrls: ['./system-setup.component.css']
})
export class SystemSetupComponent implements OnInit {

  isModalOpen: boolean;
  isModalOpenSub: Subscription;
  constructor(private logToolService: LogToolService) { }

  ngOnInit() {
    this.isModalOpenSub = this.logToolService.isModalOpen.subscribe(val =>{ 
      this.isModalOpen = val;
    })
  }

  ngOnDestroy(){
    this.isModalOpenSub.unsubscribe();
  }

}
