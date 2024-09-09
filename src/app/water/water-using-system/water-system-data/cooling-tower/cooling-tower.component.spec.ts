import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerComponent } from './cooling-tower.component';

describe('CoolingTowerComponent', () => {
  let component: CoolingTowerComponent;
  let fixture: ComponentFixture<CoolingTowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoolingTowerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoolingTowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
