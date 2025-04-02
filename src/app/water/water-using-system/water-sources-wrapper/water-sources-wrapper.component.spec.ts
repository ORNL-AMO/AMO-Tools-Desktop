import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterSourcesWrapperComponent } from './water-sources-wrapper.component';

describe('WaterSourcesWrapperComponent', () => {
  let component: WaterSourcesWrapperComponent;
  let fixture: ComponentFixture<WaterSourcesWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterSourcesWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterSourcesWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
