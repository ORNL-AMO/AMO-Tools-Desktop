import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterReductionComponent } from './water-reduction.component';

describe('WaterReductionComponent', () => {
  let component: WaterReductionComponent;
  let fixture: ComponentFixture<WaterReductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterReductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterReductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
