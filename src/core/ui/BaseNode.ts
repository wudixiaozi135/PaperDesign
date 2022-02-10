namespace core
{
    //基础节点
    export abstract class BaseNode extends eui.Component
    {
        rect: egret.Shape;

        constructor()
        {
            super();
            let rect = new egret.Shape();
            let self = this;
            self.rect = rect;
            self.addChildAt(rect, 0);
            rect.touchEnabled = false;
            self.once(egret.Event.ADDED_TO_STAGE, self.onAddedToStage, self);
            self.once(egret.Event.REMOVED_FROM_STAGE, self.removeAllEventListeners, self);
            self.once(egret.Event.REMOVED_FROM_STAGE, self.onRemovedFromStage, self);
        }

        //播放音效
        playSound(soundName: string, loop: number = 1): egret.SoundChannel
        {
            return SoundUtils.play(soundName, loop);
        }

        /**
         * get position
         */
        public get position()
        {
            return new egret.Point(this.x, this.y);
        }

        /**
         * set position
         */
        public set position(value: egret.Point)
        {
            this.x = value.x;
            this.y = value.y;
        }

        //不传父节点，默认添加到舞台
        public addToNode(node?: egret.DisplayObjectContainer): BaseNode
        {
            node = node || egret.lifecycle.stage;
            node && node.addChild(this);
            return this;
        }

        public destroy(): void
        {
            this.removeSelf();
        }

        removeSelf()
        {
            this.parent && this.parent.removeChild(this);
        }

        public abstract onAddedToStage(e: egret.Event): void;

        public onRemovedFromStage(e: egret.Event): void
        {
            // 非必要
        }

        public removeAllEventListeners(): void
        {
            // 非必要
        }
    }
}