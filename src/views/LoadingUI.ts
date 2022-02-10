namespace ui
{
    export class LoadingUI extends core.BlankLoadingUI
    {
        public onAddedToStage(e: egret.Event): void
        {
            super.onAddedToStage(e);
            let logo = new core.BitmapUI('logo_png');
            let self = this;
            egret.callLater(() =>
            {
                logo.x = this.stage.stageWidth / 2 - logo.width / 2;
                logo.y = this.stage.stageHeight / 2 - logo.height / 2 - 50;
                self.textField.y = logo.y + logo.height + 20
            }, self);
            self.addChild(logo);
        }
    }
}