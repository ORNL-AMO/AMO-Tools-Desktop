import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterReductionCardComponent } from './water-reduction-card.component';

describe('WaterReductionCardComponent', () => {
  let component: WaterReductionCardComponent;
  let fixture: ComponentFixture<WaterReductionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterReductionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterReductionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
