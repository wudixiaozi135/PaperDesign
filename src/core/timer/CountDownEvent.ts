namespace core
{
    export class CountdownEvent extends egret.Event
    {
        static START = "START";
        static STOP = "STOP";
        static RESET = "RESET";
        static COUNTDOWN = "COUNTDOWN";
        static PAUSE = "PAUSE";
        static RESUME = "RESUME";

        public duration: number = 0;
        public remaining: number = 0;

        public static dispatchCountdownEvent(target: egret.IEventDispatcher, type: string, bubbles?: boolean, cancelable?: boolean): boolean
        {
            if (!(target instanceof Countdown))
                throw new Error('target must be an instance of layer.timer.Countdown');
            let event: CountdownEvent = egret.Event.create(CountdownEvent, type, bubbles, cancelable);
            event.duration = target.duration;
            event.remaining = target.remaining;
            let result: boolean = target.dispatchEvent(event);
            egret.Event.release(event);
            return result;
        }
    }
}
