import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCharacteristicDetailsComponent } from './load-characteristic-details.component';

describe('LoadCharacteristicDetailsComponent', () => {
  let component: LoadCharacteristicDetailsComponent;
  let fixture: ComponentFixture<LoadCharacteristicDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadCharacteristicDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCharacteristicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
