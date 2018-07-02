import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleTooltipComponent } from './simple-tooltip.component';

describe('SimpleTooltipComponent', () => {
  let component: SimpleTooltipComponent;
  let fixture: ComponentFixture<SimpleTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
