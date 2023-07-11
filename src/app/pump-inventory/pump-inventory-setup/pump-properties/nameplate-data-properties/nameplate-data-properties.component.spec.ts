import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameplateDataPropertiesComponent } from './nameplate-data-properties.component';

describe('NameplateDataPropertiesComponent', () => {
  let component: NameplateDataPropertiesComponent;
  let fixture: ComponentFixture<NameplateDataPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameplateDataPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameplateDataPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
