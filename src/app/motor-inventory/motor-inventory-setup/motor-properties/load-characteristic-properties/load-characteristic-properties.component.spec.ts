import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCharacteristicPropertiesComponent } from './load-characteristic-properties.component';

describe('LoadCharacteristicPropertiesComponent', () => {
  let component: LoadCharacteristicPropertiesComponent;
  let fixture: ComponentFixture<LoadCharacteristicPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadCharacteristicPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCharacteristicPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
