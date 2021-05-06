import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UISwarmGroup } from "src/app/pages/swarms/swarms.page";
import {
  SwarmGroupService
} from "../../services/swarm-group.service";

@Component({
  selector: "app-group-header",
  templateUrl: "./group-header.component.html",
  styleUrls: ["./group-header.component.scss"],
})
export class GroupHeaderComponent implements OnInit {
  @Input() idx: number;
  @Input() group: UISwarmGroup;
  @Output() changeEvent = new EventEmitter<void>();
  @Output() renameEvent = new EventEmitter<string>();

  constructor(private swarmGroupService: SwarmGroupService) {}

  ngOnInit() {}

  deleteGroup(gid: string) {
    this.swarmGroupService.deleteGroup(gid).subscribe(() => {
      this.changeEvent.emit();
    });
  }

  rename(gid: string) {
    this.renameEvent.emit(gid);
  }
}
