import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntGaugeComponent } from './treasure-hunt-gauge.component';

describe('TreasureHuntGaugeComponent', () => {
  let component: TreasureHuntGaugeComponent;
  let fixture: ComponentFixture<TreasureHuntGaugeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntGaugeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
