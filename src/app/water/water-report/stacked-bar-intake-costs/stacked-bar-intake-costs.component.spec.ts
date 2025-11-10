import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedBarIntakeCostsComponent } from './stacked-bar-intake-costs.component';

describe('StackedBarIntakeCostsComponent', () => {
  let component: StackedBarIntakeCostsComponent;
  let fixture: ComponentFixture<StackedBarIntakeCostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackedBarIntakeCostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackedBarIntakeCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
