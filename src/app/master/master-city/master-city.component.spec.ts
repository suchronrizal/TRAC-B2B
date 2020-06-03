import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterCityComponent } from './master-city.component';

describe('MasterCityComponent', () => {
  let component: MasterCityComponent;
  let fixture: ComponentFixture<MasterCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterCityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
