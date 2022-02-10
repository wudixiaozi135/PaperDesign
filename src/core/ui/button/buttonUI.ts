namespace core {
	export class ButtonUI extends BaseNode {

		protected bmpRes: string;
		protected soundRes: string;
		constructor(bmpRes: string, soundRes?: string) {
			super();
			this.bmpRes = bmpRes;
			this.soundRes = soundRes;
		}

		public onAddedToStage(e: egret.Event): void {
			this.addChild(new BitmapUI(this.bmpRes));
			this.touchEnabled = true;
			this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		}

		public removeAllEventListeners(): void {
			this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		}

		protected onTap(event: egret.TouchEvent) {
			if (this.soundRes) {
				let sound: egret.Sound = RES.getRes(this.soundRes);
				if (sound) sound.play(0, 1);
			}
		}

	}
}