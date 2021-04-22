import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  SwarmGroup,
  SwarmGroupService,
} from "src/app/services/swarm-group.service";

@Component({
  selector: "app-group-action-bar",
  templateUrl: "./group-action-bar.component.html",
  styleUrls: ["./group-action-bar.component.scss"],
})
export class GroupActionBarComponent implements OnInit {
  @Input() group: SwarmGroup;
  @Output() addSwarmEvent = new EventEmitter<string>();

  constructor(private groupService: SwarmGroupService) {}

  ngOnInit() {}

  addNewSwarm() {
    this.addSwarmEvent.emit(this.group.id);
  }

  setLocation() {
    this.groupService.setLocation(this.group.id);
  }
}
