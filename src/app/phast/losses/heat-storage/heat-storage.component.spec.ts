import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatStorageComponent } from './heat-storage.component';

describe('HeatStorageComponent', () => {
  let component: HeatStorageComponent;
  let fixture: ComponentFixture<HeatStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
