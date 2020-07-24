import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCharacteristicDataComponent } from './load-characteristic-data.component';

describe('LoadCharacteristicDataComponent', () => {
  let component: LoadCharacteristicDataComponent;
  let fixture: ComponentFixture<LoadCharacteristicDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadCharacteristicDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCharacteristicDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
