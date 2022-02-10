class Main extends eui.UILayer
{
    protected createChildren(): void
    {
        super.createChildren();
        let self = this;
        egret.lifecycle.addLifecycleListener((context) =>
        {
            context.onUpdate = () =>
            {
            }
        });

        egret.lifecycle.onPause = () =>
        {
            // egret.ticker.pause();
        }

        egret.lifecycle.onResume = () =>
        {
            egret.ticker.resume();
        }
        core.registerEUI();
        self.runGame().catch(e =>
        {
            console.error("runGameError", e);
        });

        if (!egret.Capabilities.isMobile)
        {
            self.stage.orientation = egret.OrientationMode.AUTO;
            self.stage.scaleMode = egret.StageScaleMode.FIXED_HEIGHT;
        } else if (egret.Capabilities.boundingClientWidth / egret.Capabilities.boundingClientHeight < 750 / 1206)
        {
            //显示区域宽高比 < 设计尺寸宽高比
            self.stage.scaleMode = egret.StageScaleMode.FIXED_WIDTH;
        } else
        {
            self.stage.scaleMode = egret.StageScaleMode.FIXED_HEIGHT;
        }
    }

    private async loadResource()
    {
        const blankLoadingView = new core.BlankLoadingUI();
        blankLoadingView.addConfigFile("resource/default.res.json", "resource/")
            .addGroupNames('preload')
            .addToNode(this.stage);
        await blankLoadingView.load();

        const loadingView: ui.LoadingUI = new ui.LoadingUI();
        loadingView.addThemeFiles('resource/default.thm.json')
            .addGroupNames("game", "fonts", "character", "sound", "crush", "countdown")
            .addToNode(this.stage);
        await loadingView.load();
    }

    //运行游戏
    private async runGame()
    {
        //加载资源
        await this.loadResource();
        new pages.GamePage()
    }
}