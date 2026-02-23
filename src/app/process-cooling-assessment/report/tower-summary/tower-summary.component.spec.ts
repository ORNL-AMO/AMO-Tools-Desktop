import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TowerSummaryComponent } from './tower-summary.component';

describe('TowerSummaryComponent', () => {
  let component: TowerSummaryComponent;
  let fixture: ComponentFixture<TowerSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TowerSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TowerSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
