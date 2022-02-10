namespace pages
{
    export class GamePage extends BaseGamePage
    {
        private gameBg: core.BitmapUI;
        private stageId: number = 0;

        constructor(gameStage: number = 1)
        {
            super();
            this.stageId = gameStage;
            this.preLoad();
        }

        protected get groupList(): string[]
        {
            let stageId = this.getCycleStageId();
            return ["page-game" + stageId];
        }

        public nextPage()
        {
            this.destroy();
            new GamePage(++Global.stageId);
        }

        public onAddedToStage(event: egret.Event): void
        {
            super.onAddedToStage(event);
            let self = this;
            let stage = self.stage;
            let stageW = stage.stageWidth;
            let stageH = stage.stageHeight;
            self.width = stageW;
            self.height = stageH;

            //背景UI
            let bgSprite = new core.BitmapUI('bg_png');
            self.addChild(bgSprite);
            bgSprite.horizontalCenter = 0;
            bgSprite.height = stageH;
            self.gameBg = bgSprite;

            let cycleStageId = self.getCycleStageId();
            let frameImg = new core.BitmapUI(`game${cycleStageId}_frame_png`);
            frameImg.scale9Grid = new egret.Rectangle(269, 272, 164, 151);
            frameImg.height = stageH - 150;
            frameImg.width = 720;
            self.addChild(frameImg);
            frameImg.horizontalCenter = 0;
            frameImg.top = 80;

            //得分
            self.scorebarSprite = new pages.ScoreBarView();
            self.scorebarSprite.stageNumber = self.stageId;
            self.addChild(self.scorebarSprite);
            self.scorebarSprite.top = 10;
            self.scorebarSprite.horizontalCenter = 0;

            //游戏主画布
            let gameUI = new ui.GameUI(60);
            //障碍物
            gameUI.blocks = Global.blockMap[cycleStageId] || [];
            gameUI.width = 700;
            gameUI.height = stageH - 200;

            self.addChild(gameUI);
            gameUI.top = 100;
            gameUI.horizontalCenter = 0;
            self.readySprite.animating().then(() =>
            {
                gameUI.start();
            }).catch(err =>
            {
            });
        }

        protected onGameStart(event: GameEvent): void
        {
            super.onGameStart(event);
            this.bgmChannel = this.playSound(`stage-${this.getCycleStageId()}_mp3`);
        }

        getCycleStageId()
        {
            let stageId = this.stageId % 4;
            if (stageId == 0)
            {
                stageId = 2;
            }
            return stageId;
        }

        protected onGameStop(event: GameEvent): void
        {
            super.onGameStop(event);
            Global.score += event.score;
            let nextStageSprite: NextStageSprite = new NextStageSprite(Global.score, this.nextPage);
            nextStageSprite.width = 750;
            this.addChild(nextStageSprite);
            nextStageSprite.horizontalCenter = 0;
            nextStageSprite.top = -150;
        }
    }
}
