namespace core
{
    export class MaskUI extends BaseNode
    {
        protected maskColor: number;
        protected maskAlpha: number;

        constructor(color: number = 0x0, alpha: number = .8)
        {
            super();
            this.maskColor = color;
            this.maskAlpha = alpha;
        }

        public onAddedToStage(e: egret.Event): void
        {
            this.width = this.width > 0 ? this.width : this.stage.stageWidth;
            this.height = this.height > 0 ? this.height : this.stage.stageHeight;
            this.addEventListener(egret.Event.RESIZE, this.onResize, this);
            this.onResize();
        }

        public removeAllEventListeners(): void
        {
            this.removeEventListener(egret.Event.RESIZE, this.onResize, this);
        }

        protected onResize(event?: egret.Event)
        {
            let rect = this.rect;
            if (rect)
            {
                rect.graphics.clear();
                rect.graphics.beginFill(this.maskColor, this.maskAlpha);
                rect.graphics.drawRect(0, 0, this.width, this.height);
            }
        }
    }
}