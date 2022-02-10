namespace core
{
    //主题适配
    export class ThemeAdapter implements eui.IThemeAdapter
    {
        /**
         * 解析主题
         * @param url 待解析的主题url
         * @param compFunc 解析完成回调函数，示例：compFunc(e:egret.Event):void;
         * @param errorFunc 解析失败回调函数，示例：errorFunc():void;
         * @param thisObject 回调的this引用
         */
        public getTheme(url: string, compFunc: Function, errorFunc: Function, thisObject: any): void
        {
            function onGetRes(e: string): void
            {
                compFunc.call(thisObject, e);
            }

            function onError(e: RES.ResourceEvent): void
            {
                if (e.resItem.url == url)
                {
                    RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, onError, null);
                    errorFunc.call(thisObject);
                }
            }

            RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, onError, null);
            RES.getResByUrl(url, onGetRes, this, RES.ResourceItem.TYPE_TEXT);
        }
    }


    //资源适配
    export class AssetAdapter implements eui.IAssetAdapter
    {
        /**
         * @language zh_CN
         * 解析素材
         * @param source 待解析的新素材标识符
         * @param compFunc 解析完成回调函数，示例：callBack(content:any,source:string):void;
         * @param thisObject callBack的 this 引用
         */
        public getAsset(source: string, compFunc: Function, thisObject: any): void
        {
            function onGetRes(data: any): void
            {
                compFunc.call(thisObject, data, source);
            }

            if (RES.hasRes(source))
            {
                let data = RES.getRes(source);
                if (data)
                {
                    onGetRes(data);
                } else
                {
                    RES.getResAsync(source, onGetRes, this);
                }
            } else
            {
                RES.getResByUrl(source, onGetRes, this, RES.ResourceItem.TYPE_IMAGE);
            }
        }
    }

    //注册EUI适配
    export function registerEUI()
    {
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());
    }
}