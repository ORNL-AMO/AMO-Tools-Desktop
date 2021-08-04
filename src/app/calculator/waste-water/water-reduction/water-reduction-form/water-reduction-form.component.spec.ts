import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterReductionFormComponent } from './water-reduction-form.component';

describe('WaterReductionFormComponent', () => {
  let component: WaterReductionFormComponent;
  let fixture: ComponentFixture<WaterReductionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterReductionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterReductionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
