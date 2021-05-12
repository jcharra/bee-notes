import { Injectable } from "@angular/core";
import { AnimationController } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class AnimationService {
  constructor(private animationCtrl: AnimationController) {}

  pulse(selector: string, iterations: number) {
    setTimeout(() => {
      const animation = this.animationCtrl
        .create()
        .addElement(document.querySelector(selector))
        .duration(1000)
        .iterations(iterations)
        .keyframes([
          { offset: 0, transform: "scale(1.0)" },
          { offset: 0.2, transform: "scale(1.3)" },
          { offset: 0.4, transform: "scale(1.0)" },
        ]);
      animation.play();
    }, 200);
  }
}
