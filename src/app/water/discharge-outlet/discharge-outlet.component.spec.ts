import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeOutletComponent } from './discharge-outlet.component';

describe('DischargeOutletComponent', () => {
  let component: DischargeOutletComponent;
  let fixture: ComponentFixture<DischargeOutletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DischargeOutletComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DischargeOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
