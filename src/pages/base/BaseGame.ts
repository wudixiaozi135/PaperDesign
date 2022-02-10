namespace pages
{
    export abstract class BaseGamePage extends BasePage
    {
        protected scorebarSprite: pages.ScoreBarView = null;
        protected cheerSprite: pages.CheerSprite;
        protected readySprite: ui.CircleUI;
        private playedClock: boolean = false;
        protected bgmChannel: egret.SoundChannel;

        public onAddedToStage(event: egret.Event): void
        {
            this.cheerSprite = new pages.CheerSprite;
            this.addChild(this.cheerSprite);

            this.readySprite = new ui.CircleUI();
            this.readySprite.readyRes = [
                {
                    imageRes: "3_png",
                    soundRes: "countdown_mp3"
                },
                {
                    imageRes: "2_png",
                    soundRes: "countdown_mp3"
                },
                {
                    imageRes: "1_png",
                    soundRes: "countdown_mp3"
                },
                {
                    imageRes: "go_png",
                    soundRes: "go_mp3"
                },
            ];
            this.stage.addChild(this.readySprite);

            this.addEventListener(GameEvent.GAME_START, this.onGameStart, this);
            this.addEventListener(GameEvent.GAME_STOP, this.onGameStop, this);
            this.addEventListener(GameEvent.GAME_RESUME, this.onGameResume, this);
            this.addEventListener(GameEvent.GAME_PAUSE, this.onGamePause, this);
            this.addEventListener(GameEvent.GAME_SCORE, this.onGameScore, this);
            this.addEventListener(GameEvent.GAME_DELTA_SCORE, this.onGameDeltaScore, this);
            this.addEventListener(GameEvent.GAME_COUNTDOWN, this.onGameCountdown, this);
            this.stage.addEventListener(egret.Event.RESIZE, this.onStageResize, this);
            egret.callLater(this.onStageResize, this);
        }

        protected onStageResize()
        {
            this.position = new egret.Point((this.stage.stageWidth - this.width) * .5, 0);
        }

        public removeAllEventListeners(): void
        {
            this.removeEventListener(GameEvent.GAME_START, this.onGameStart, this);
            this.removeEventListener(GameEvent.GAME_STOP, this.onGameStop, this);
            this.removeEventListener(GameEvent.GAME_RESUME, this.onGameResume, this);
            this.removeEventListener(GameEvent.GAME_PAUSE, this.onGamePause, this);
            this.removeEventListener(GameEvent.GAME_SCORE, this.onGameScore, this);
            this.removeEventListener(GameEvent.GAME_COUNTDOWN, this.onGameCountdown, this);
            this.stage && this.stage.removeEventListener(egret.Event.RESIZE, this.onStageResize, this);
        }

        protected onGameStart(event: GameEvent): void
        {

        }

        protected onGameStop(event: GameEvent): void
        {
            let self = this;
            if (self.cheerSprite)
            {
                self.cheerSprite.removeSelf();
                self.cheerSprite = null;
            }

            if (this.bgmChannel)
                this.bgmChannel.stop();
            this.playSound('win_mp3');
        }

        protected onGameResume(event: GameEvent): void
        {

        }

        protected onGamePause(event: GameEvent): void
        {

        }

        //总分
        protected onGameScore(event: GameEvent)
        {
            let score: number = event.score;
            if (this.scorebarSprite)
                this.scorebarSprite.score = score;
        }

        //单次分数
        protected onGameDeltaScore(event: GameEvent)
        {
            let score: number = event.score;
            if (this.cheerSprite) this.cheerSprite.addScore(event.score);
        }

        protected onGameCountdown(event: GameEvent)
        {
            let remaining: number = event.remaining;
            if (this.scorebarSprite)
                this.scorebarSprite.countdown = remaining;
            if (remaining <= 5000 && !this.playedClock)
            {
                this.playedClock = true;
                this.playSound('clock_mp3', 4);
            }
        }
    }
}
