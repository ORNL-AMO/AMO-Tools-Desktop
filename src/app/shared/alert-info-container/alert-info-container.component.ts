import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-alert-info-container',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './alert-info-container.component.html',
  styleUrl: './alert-info-container.component.css'
})
export class AlertInfoContainerComponent {
  @Input()
  header: string = '';
  @Input()
  content: string = '';
  @Input()
  navigateToLink: string = undefined;
  @Input()
  navigateToText: string = '';
  @Input()
  bootstrapLevel: string = undefined;
  @Input()
  showIcon: boolean = true;
  @Input()
  style: { [klass: string]: any };
  

  constructor(private router: Router) { }

  ngOnInit() {
    
  }

  visitLink() {
    this.router.navigate([this.navigateToLink]);
  }

}
