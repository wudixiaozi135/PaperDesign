namespace core {
	export class Countdown extends egret.EventDispatcher{
		protected _duration: number = 0;
		protected _remaining: number;

		protected timer: egret.Timer;
		protected fromTime: number;
		protected paused: boolean;

		protected deferPromise: DeferredPromise;
		/**
		 *
		 * @param duration 需要倒計時的 毫秒數
		 */
		constructor(duration: number)
		{
			super();
			this._duration = duration;
			this._remaining = duration;
			this.fromTime = null;
			this.paused = false;
			this.deferPromise = null;
		}

		public get duration(): number {
			return this._duration;
		}

		public get remaining(): number {
			return this._remaining;
		}

		protected resolvePromise(): void {
			if (this.deferPromise) {
				this.deferPromise.resolve(this.remaining);
				delete this.deferPromise; //刪除 比如內存洩露
				this.deferPromise = null;
			}
		}

		protected rejectPromise(): void {
			if (this.deferPromise) {
				this.deferPromise.reject(this.remaining);
				delete this.deferPromise; //刪除 比如內存洩露
				this.deferPromise = null;
			}
		}

		protected clearTimer(): void {
			if (this.timer) {
				this.timer.stop();
				this.timer.removeEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
				delete this.timer;
				this.timer = null;
			}
		}
		/**
		 * 剩餘時間的 Promise調用辦法
		 * 無需監聽就可以在一個函數中實現倒計時的讀取和輸出
		 * @example
		 * async function some() {
		 *	let cd = new Countdown(30 * 1000); //30 seconds
		 *	cd.start(500); //500 ms per tick
		 *	while(let remaining = await cd.remainingPromise()) {
		 *		console.log(remaining);
		 *	}
		 * }
		 */
		public remainingPromise(): Promise<any> {
			if (this.deferPromise)
				return this.deferPromise.promise;
			this.deferPromise = new DeferredPromise();
			return this.deferPromise.promise;
		}

		protected onTimer(event: egret.TimerEvent): void
		{
			if (this.paused) return;

			this._remaining = this._duration - Date.now() + this.fromTime;
			if (this.remaining <= 0)
			{
				CountdownEvent.dispatchCountdownEvent(this, CountdownEvent.COMPLETE);
				this.clearTimer();
				this._remaining = 0;
			} else
				CountdownEvent.dispatchCountdownEvent(this, CountdownEvent.COUNTDOWN);

			this.resolvePromise();
		}
		/**
		 * 開始倒計時
		 * @param delay 多少毫秒回執一次
		 */
		public start(delay: number = 500): void
		{
			this.clearTimer();
			this.fromTime = Date.now();
			this._remaining = this._duration;
			this.paused = false;
			this.timer = new egret.Timer(delay, 0); //重复
			this.timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
			this.timer.start();
		}
		public reset() : void
		{
			this.clearTimer();
			this._remaining = this._duration;
			CountdownEvent.dispatchCountdownEvent(this, CountdownEvent.RESET);
		}
		/**
		 * 暫停倒計時
		 */
		public pause(): void
		{
			this.paused = true;
			if (this.timer) this.timer.reset();
			CountdownEvent.dispatchCountdownEvent(this, CountdownEvent.PAUSE);
		}
		/**
		 * 恢復倒計時
		 */
		public resume(): void
		{
			this.paused = false;
			this.fromTime = Date.now() - this._duration + this.remaining;
			if (this.timer) this.timer.start();
			CountdownEvent.dispatchCountdownEvent(this, CountdownEvent.RESUME);
		}
		/**
		 * 停止倒計時
		 */
		public stop(): void
		{
			this.clearTimer();
			this.rejectPromise();
			this.paused = false;
			this._remaining = 0;
			CountdownEvent.dispatchCountdownEvent(this, CountdownEvent.STOP);
		}
	}

}
