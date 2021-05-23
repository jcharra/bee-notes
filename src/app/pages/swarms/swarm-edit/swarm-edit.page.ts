import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { addYears, getYear } from "date-fns";
import { Race } from "src/app/services/queen.service";
import { SwarmService } from "src/app/services/swarm.service";

@Component({
  selector: "app-swarm-edit",
  templateUrl: "./swarm-edit.page.html",
  styleUrls: ["./swarm-edit.page.scss"],
})
export class SwarmEditPage implements OnInit {
  swarmId: string;
  colonyForm: FormGroup;
  races = [];
  maxYear = getYear(new Date());
  minYear = getYear(addYears(new Date(), -4));

  constructor(
    private swarmService: SwarmService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) {
    this.races = Object.keys(Race);
  }

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;

    this.colonyForm = this.formBuilder.group({
      name: [null, Validators.required],
      race: [Race.UNKNOWN],
      birthYear: [getYear(new Date())],
      isLayer: [false],
      ancestor: [null],
    });
  }

  changeBirthYear(diff: number) {
    const newVal = this.colonyForm.controls.birthYear.value + diff;
    if (newVal <= this.maxYear && newVal >= this.minYear) {
      this.colonyForm.controls.birthYear.setValue(newVal);
    }
  }
}
