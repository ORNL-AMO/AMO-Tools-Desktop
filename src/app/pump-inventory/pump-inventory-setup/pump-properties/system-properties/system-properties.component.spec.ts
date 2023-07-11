import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemPropertiesComponent } from './system-properties.component';

describe('SystemPropertiesComponent', () => {
  let component: SystemPropertiesComponent;
  let fixture: ComponentFixture<SystemPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
