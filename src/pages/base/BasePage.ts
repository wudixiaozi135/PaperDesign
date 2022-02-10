namespace pages
{
    export abstract class BasePage extends core.BaseNode
    {
        public constructor()
        {
            super();
        }

        preLoad(): Promise<any>
        {
            return this.loading(this.groupList);
        }

        protected abstract get groupList(): string[];

        public abstract nextPage();

        public onRemovedFromStage(event: egret.Event): void
        {
            this.removeAllEventListeners();
            this.groupList.forEach(v => RES.destroyRes(v));
        }

        public async loading(groupList: string[], configList: core.ResourceConfig[] = []): Promise<any>
        {
            let loadingView = new core.BlankLoadingUI();
            loadingView.addGroupNames(...groupList)
                .addConfigFiles(...configList)
                .addToNode(this.stage)
            try
            {
                await loadingView.load()
                loadingView.destroy();
                // 等待load结束，将本page加入到stage中
                this.addToNode();
            } catch (error)
            {
                alert('无法读取：' + error);
            }
        }
    }
}
