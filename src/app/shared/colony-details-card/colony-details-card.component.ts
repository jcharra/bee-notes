import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { getYear } from "date-fns";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  QueenService,
  QueenStatus,
  Race,
} from "src/app/services/queen.service";
import { Swarm } from "src/app/types/Swarm";

@Component({
  selector: "colony-details-card",
  templateUrl: "./colony-details-card.component.html",
  styleUrls: ["./colony-details-card.component.scss"],
})
export class ColonyDetailsCardComponent implements OnInit {
  @Input() swarm: Swarm;
  queenStatus$: Observable<QueenStatus>;

  constructor(private queenService: QueenService, private router: Router) {}

  ngOnInit() {
    this.queenStatus$ = this.queenService.getStatus(this.swarm.id).pipe(
      map((s: QueenStatus) => {
        return s || { birthYear: getYear(new Date()), race: Race.UNKNOWN };
      })
    );
  }

  editColonyData() {
    this.router.navigateByUrl(`/swarms/edit/${this.swarm.id}`);
  }
}
