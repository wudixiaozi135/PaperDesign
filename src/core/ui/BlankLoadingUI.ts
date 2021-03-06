namespace core
{
    export interface ResourceConfig
    {
        resourceFile: string,
        path?: string
    }

    export interface LoadStatus
    {
        dfd: DeferredPromise;
        loaded: number;
        total: number;
    }

    export class BlankLoadingUI extends BaseNode
    {
        protected textField: egret.TextField;
        protected _configList: ResourceConfig[];
        protected _groupList: string[];
        protected _themeList: string[];
        protected status: Map<string, LoadStatus>;
        protected resURI: string;
        protected resVersion: string;

        public set configList(value: ResourceConfig[])
        {
            this._configList = value;
        }

        public get configList(): ResourceConfig[]
        {
            return this._configList;
        }

        public set themeList(value: string[])
        {
            this._themeList = value;
        }

        public get themeList(): string[]
        {
            return this._themeList;
        }

        public set groupList(value: string[])
        {
            this._groupList = value;
        }

        public get groupList(): string[]
        {
            return this._groupList;
        }

        addConfigFile(resourceFile: string, path: string)
        {
            this._configList.push({
                path: path,
                resourceFile: resourceFile
            });
            return this;
        }

        addConfigFiles(...resourceFiles)
        {
            this._configList.push(...resourceFiles);
            return this;
        }

        addGroupNames(...rest)
        {
            this._groupList.push(...rest);
            return this;
        }

        addThemeFiles(themeFile: string)
        {
            let pos = this._themeList.indexOf(themeFile);
            pos != -1 && this._themeList.push(themeFile);
            return this;
        }

        constructor(resURI: string = '', resVersion?: string)
        {
            super();
            this.resURI = resURI.length > 0 ? resURI : (window['resURI'] != undefined ? window['resURI'] : '');
            this.resVersion = resVersion ? resVersion : (window['resVersion'] != undefined ? window['resVersion'] : '1.0');
            if (this.resURI.length > 0 && this.resURI.substring(this.resURI.length - 1) != '/') this.resURI += '/';
            this._configList = [];
            this._groupList = [];
            this._themeList = [];
            this.status = new Map<string, LoadStatus>();
            RES.setMaxLoadingThread(10);
        };

        /**
         * ?????????resourceConfig???groupList????????????????????????
         * ???????????????configList/groupList???????????????load???????????????????????????
         */
        public async load()
        {
            if (this._configList.length + this._groupList.length + this._themeList.length <= 0)
            {
                throw new Error('Please set configList/groupList/themeList first.'); // runtime error
            }
            //config
            let promises: Promise<any>[] = [];
            for (let config of this._configList)
            {
                let dfd = this.loadConfig(config);
                promises.push(dfd.promise);
            }
            await Promise.all(promises); //????????????config????????????
            //theme
            promises = [];
            for (let theme of this._themeList)
            {
                let dfd = this.loadTheme(theme);
                promises.push(dfd.promise);
            }
            await Promise.all(promises); //????????????theme????????????
            //group
            promises = [];
            for (let group of this._groupList)
            {
                let dfd = this.loadGroup(group);
                promises.push(dfd.promise);
            }
            return await Promise.all(promises).then(() => this.destroy()); // ?????????????????????Group
        }

        public onAddedToStage(e: egret.Event): void
        {
            this.removeChildren();
            this.textField = new egret.TextField();
            this.textField.y = (this.stage.stageHeight - 100) / 2;
            this.textField.width = this.stage.stageWidth;
            this.textField.height = 100;
            this.textField.textAlign = egret.HorizontalAlign.CENTER;
            this.textField.verticalAlign = egret.VerticalAlign.MIDDLE;
            this.addChild(this.textField);

            this.bindEvents();
        }

        public onRemovedFromStage(e: egret.Event): void
        {
            this.status.clear();
            this._configList = [];
            this._groupList = [];
            this._themeList = [];
        }

        public removeAllEventListeners(): void
        {
            RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
            RES.removeEventListener(RES.ResourceEvent.CONFIG_LOAD_ERROR, this.onConfigError, this);

            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        }

        public bindEvents(): void
        {
            RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
            RES.addEventListener(RES.ResourceEvent.CONFIG_LOAD_ERROR, this.onConfigError, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        }

        /**
         * [setProgress description]
         * @param {number} current
         * @param {number} total
         */
        public setProgress(current: number, total: number, resource?: RES.ResourceItem): void
        {
            if (!this.textField) return;
            let percent: number = total > 0 ? current / total * 100 : 0;
            if (percent > 100) percent = 100;
            this.textField.text = "Loading..." + Math.round(percent) + '%';
        }

        protected calcTotalProgress(resource?: RES.ResourceItem)
        {
            let total: number = 0, loaded: number = 0;
            this.status.forEach(status =>
            {
                total += status.total;
                loaded += status.loaded;
            });
            this.setProgress(loaded, total, resource);
        }

        /**
         * ??????Config
         * @param {Array<string>} resourceFiles
         * @param {Function}      onComplete
         * @param {any}           thisObject
         */
        protected loadConfig(resourceConfig: ResourceConfig): DeferredPromise
        {
            var dfd = new DeferredPromise();
            let {resourceFile, path} = resourceConfig;
            // ??????????????????Map ?????????????????????????????????????????????loadConfig????????????

            if (path == undefined) path = resourceFile.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '') + '/';
            resourceFile = core.urlVersion(this.resURI + resourceFile, this.resVersion);
            path = this.resURI + path;
            this.status.set('ConfigRes', {
                dfd:dfd,
                loaded: 0,
                total: 1
            });
            RES.loadConfig(resourceFile, path);
            return dfd;
        }

        /**
         * ?????? eui???????????????
         * @param {string} themeName
         */
        protected loadTheme(themeName: string): DeferredPromise
        {
            var dfd = new DeferredPromise();
            themeName = core.urlVersion(this.resURI + themeName, this.resVersion);
            // ??????????????????Map ??????????????????????????? ??????????????????loadGroup????????????
            this.status.set('theme: ' + themeName, {
                dfd,
                loaded: 0,
                total: 1,
            });
            let theme = new eui.Theme(themeName, egret.lifecycle.stage);
            theme.once(eui.UIEvent.COMPLETE, () =>
            {
                let status = this.status.get('theme: ' + themeName);
                if (status) status.loaded = 1;
                this.calcTotalProgress();
                dfd.resolve();
            }, this);
            return dfd;
        }

        /**
         * ??????Group??????
         * @param {string}   groupName
         * @param {Function} onComplete
         * @param {any}      thisObject
         */
        protected loadGroup(groupName: string): DeferredPromise
        {
            var dfd = new DeferredPromise();
            // ??????????????????Map ??????????????????????????? ??????????????????loadGroup????????????
            this.status.set(groupName, {
                dfd,
                loaded: 0,
                total: RES.getGroupByName(groupName).length,
            });
            RES.loadGroup(groupName);
            return dfd;
        };

        protected onConfigError(event: RES.ResourceEvent): void
        {
            //?????????????????????????????????????????????config????????????????????????process?????????
            let status = this.status.get("ConfigRes");
            if (status)
            {
                status.loaded = 0;
                status.dfd.reject("ConfigRes");
            }
        }

        protected onConfigComplete(event: RES.ResourceEvent): void
        {
            //??????????????????????????????config????????????process???????????????load
            let status = this.status.get("ConfigRes");
            if (status)
            {
                status.loaded = 1;
                status.dfd.resolve("ConfigRes");
            }
        }

        //group
        protected onResourceLoadComplete(event: RES.ResourceEvent): void
        {
            if (DEBUG) console.warn("Group:" + event.groupName + " loaded successful.");

            if (this.status.has(event.groupName))
            {
                if (DEBUG) console.warn("Group:" + event.groupName + " resolved.");

                let status = this.status.get(event.groupName);
                status.dfd.resolve(event.groupName);
                status.loaded = status.total;
            }
        };

        protected onItemLoadError(event: RES.ResourceEvent): void
        {
            if (DEBUG) console.log("Url:" + event.resItem.url + " has failed to load");
            //Config ??????
            if (event.groupName == "RES__CONFIG")
            {
                let name = 'config: ' + (event.resItem && event.resItem.name ? event.resItem.name : '');
                if (this.status.has(name))
                {
                    let status = this.status.get(name);
                    status.loaded = 0;
                    status.dfd.reject(event.resItem.name);
                }
            }

            //?????? Group ?????????????????????
        };

        protected onResourceLoadError(event: RES.ResourceEvent): void
        {
            if (DEBUG) console.warn("Group:" + event.groupName + " has failed to load");
            //???????????????????????????
            //Ignore the loading failed projects
            RES.ResourceEvent.dispatchEvent(event.target, RES.ResourceEvent.GROUP_COMPLETE, false, event.groupName);
        }

        protected onResourceProgress(event: RES.ResourceEvent): void
        {
            let name: string = event.groupName;
            if (this.status.has(name))
            {
                let status = this.status.get(name);
                status.loaded = event.itemsLoaded;
            }
            this.calcTotalProgress(event.resItem);
        };
    }
}
