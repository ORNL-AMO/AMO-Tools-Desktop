import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerBasinComponent } from './cooling-tower-basin.component';

describe('CoolingTowerBasinComponent', () => {
  let component: CoolingTowerBasinComponent;
  let fixture: ComponentFixture<CoolingTowerBasinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingTowerBasinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerBasinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
