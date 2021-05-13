import { Injectable } from "@angular/core";
import { AnimationController } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class AnimationService {
  constructor(private animationCtrl: AnimationController) {}

  fadeIn(selector: string, duration: number) {
    setTimeout(() => {
      const animation = this.animationCtrl
        .create()
        .addElement(document.querySelector(selector))
        .duration(duration)
        .fromTo("opacity", "0", "1");
      animation.play();
    }, 200);
  }

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

  rotate(selector: string, iterations: number, duration: number = 10000) {
    setTimeout(() => {
      const animation = this.animationCtrl
        .create()
        .addElement(document.querySelectorAll(selector))
        .duration(duration)
        .iterations(iterations)
        .fromTo("transform", "rotate(0deg)", "rotate(360deg)");
      animation.play();
    }, 200);
  }
}
