import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SwarmEditPage } from './swarm-edit.page';

describe('SwarmEditPage', () => {
  let component: SwarmEditPage;
  let fixture: ComponentFixture<SwarmEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwarmEditPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SwarmEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
