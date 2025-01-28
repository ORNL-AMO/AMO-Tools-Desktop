import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignDetailsPropertiesComponent } from './design-details-properties.component';

describe('DesignDetailsPropertiesComponent', () => {
  let component: DesignDetailsPropertiesComponent;
  let fixture: ComponentFixture<DesignDetailsPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignDetailsPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignDetailsPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
