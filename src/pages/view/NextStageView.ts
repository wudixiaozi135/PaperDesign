namespace pages
{
    export class NextStageSprite extends core.BaseNode
    {
        private score: number;
        private nextStageCallback: Function;

        constructor(score: number = 0, nextStageCallback: Function)
        {
            super();
            this.score = score;
            this.nextStageCallback = nextStageCallback;
        }

        public onAddedToStage(event: egret.Event): void
        {
            let bgSprite: core.BitmapUI = new core.BitmapUI('next-stage_png');
            bgSprite.x = 108;
            bgSprite.y = 457;
            this.addChild(bgSprite);

            let scoreField: egret.TextField = new egret.TextField;
            scoreField.name = 'score';
            scoreField.fontFamily = "Microsoft Yahei";
            scoreField.bold = true;
            scoreField.x = 406;
            scoreField.y = 685;
            scoreField.width = 129;
            scoreField.height = 39;

            scoreField.size = 35;
            scoreField.text = this.score + "";
            scoreField.textColor = 0x0;
            scoreField.verticalAlign = egret.VerticalAlign.MIDDLE;
            scoreField.textAlign = egret.HorizontalAlign.CENTER;
            this.addChild(scoreField);


            let buttonSprite = new core.BlankButtonUI("click_mp3");
            buttonSprite.x = 250;
            buttonSprite.y = 835;
            buttonSprite.width = 250;
            buttonSprite.height = 76;
            buttonSprite.once(egret.TouchEvent.TOUCH_TAP, () =>
            {
                this.nextStageCallback.call(this.parent, this.score);
            }, this);
            this.addChild(buttonSprite);
        }

        public onRemovedFromStage(event: egret.Event): void
        {
            this.removeAllEventListeners();
        }

        public removeAllEventListeners(): void
        {

        }
    }
}
