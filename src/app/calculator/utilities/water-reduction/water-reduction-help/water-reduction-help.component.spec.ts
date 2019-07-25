import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterReductionHelpComponent } from './water-reduction-help.component';

describe('WaterReductionHelpComponent', () => {
  let component: WaterReductionHelpComponent;
  let fixture: ComponentFixture<WaterReductionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterReductionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
