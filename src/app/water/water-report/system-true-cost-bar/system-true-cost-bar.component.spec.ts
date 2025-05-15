import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemTrueCostBarComponent } from './system-true-cost-bar.component';

describe('SystemTrueCostBarComponent', () => {
  let component: SystemTrueCostBarComponent;
  let fixture: ComponentFixture<SystemTrueCostBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemTrueCostBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemTrueCostBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
