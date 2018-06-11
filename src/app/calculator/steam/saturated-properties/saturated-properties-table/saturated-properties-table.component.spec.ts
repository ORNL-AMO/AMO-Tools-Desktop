import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturatedPropertiesTableComponent } from './saturated-properties-table.component';

describe('SaturatedPropertiesTableComponent', () => {
  let component: SaturatedPropertiesTableComponent;
  let fixture: ComponentFixture<SaturatedPropertiesTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaturatedPropertiesTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturatedPropertiesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
