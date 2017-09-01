import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FurnacesComponent } from './furnaces.component';

describe('FurnacesComponent', () => {
  let component: FurnacesComponent;
  let fixture: ComponentFixture<FurnacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FurnacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FurnacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
