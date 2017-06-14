import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatStorageHelpComponent } from './heat-storage-help.component';

describe('HeatStorageHelpComponent', () => {
  let component: HeatStorageHelpComponent;
  let fixture: ComponentFixture<HeatStorageHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatStorageHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatStorageHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
