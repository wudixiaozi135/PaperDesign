namespace ui
{
    export class CircleUI extends ReadyUI
    {
        protected circleSprite: egret.Sprite;

        public onAddedToStage(event: egret.Event): void
        {
            let radius: number = this.stage.stageHeight;
            let circlePos: egret.Point = new egret.Point(this.stage.stageWidth / 2, this.stage.stageHeight * 1.5);
            //mask
            this.addChild(new core.MaskUI(0xffffff, .5));
            this.circleSprite = new egret.Sprite;
            this.circleSprite.anchorOffsetX = radius;
            this.circleSprite.anchorOffsetY = radius;
            this.circleSprite.x = circlePos.x;
            this.circleSprite.y = circlePos.y;

            //draw
            let avg: number = 360 / this.readyRes.length;
            [...this.readyRes].reverse().forEach((v, i) =>
            {
                if (v.duration == null) v.duration = 1000;
                let bmp = new core.BitmapUI(v.imageRes);
                egret.callLater(() =>
                {
                    bmp.anchorOffsetX = bmp.width / 2;
                    bmp.anchorOffsetY = bmp.height / 2;

                    let pt = core.circlePoint(new egret.Point(radius, radius), radius, core.d2r(avg * i));
                    bmp.x = pt.x;
                    bmp.y = pt.y;

                }, this);
                bmp.rotation = avg * (i + 1);
                this.circleSprite.addChild(bmp);
            });
            this.addChild(this.circleSprite);
        }

        public onRemovedFromStage(event: egret.Event): void
        {
            this.removeAllEventListeners();
        }

        public removeAllEventListeners(): void
        {
        }

        public animating(): Promise<any>
        {
            return new Promise<any>(resolve =>
            {
                let self = this;
                if (self.readyRes.length == 0)
                {
                    self.destroy();
                    resolve();
                    return;
                }
                let tween: egret.Tween = egret.Tween.get(self.circleSprite).call(() =>
                {
                    self.playSound(self.readyRes[0].soundRes);
                }, self).wait(self.readyRes[0].duration / 2);

                let avg: number = 360 / self.readyRes.length;
                for (let i: number = 1; i < self.readyRes.length; i++)
                {
                    let res = self.readyRes[i];
                    tween = tween
                        .to({rotation: avg * i}, res.duration / 2)
                        .call(() =>
                        {
                            self.playSound(res.soundRes);
                        }, self)
                        .wait(res.duration / 2);
                }
                tween.call(() =>
                {
                    self.destroy();
                    resolve();
                }, self);
            });
        }
    }
}