import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { addYears, getYear } from "date-fns";
import { QueenService, QueenStatus } from "src/app/queen.service";

@Component({
  selector: "app-queen-status",
  templateUrl: "./queen-status.page.html",
  styleUrls: ["./queen-status.page.scss"],
})
export class QueenStatusPage implements OnInit {
  currentStatus: QueenStatus;
  newStatus: QueenStatus;
  colonyId: string;
  maxYear = getYear(new Date());
  minYear = getYear(addYears(new Date(), -4));

  constructor(
    private route: ActivatedRoute,
    private queenService: QueenService
  ) {}

  ngOnInit() {
    this.colonyId = this.route.snapshot.params.swarmId;
    this.queenService
      .getStatus(this.colonyId)
      .subscribe((status: QueenStatus) => {
        this.currentStatus = status || {
          birthYear: getYear(new Date()),
        };
        this.newStatus = this.currentStatus;
      });
  }

  incrementBirthYear() {
    if (this.newStatus.birthYear < this.maxYear) {
      this.newStatus.birthYear += 1;
    }
  }

  decrementBirthYear() {
    if (this.newStatus.birthYear > this.minYear) {
      this.newStatus.birthYear -= 1;
    }
  }
}
