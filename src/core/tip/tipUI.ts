namespace core {

	export interface TipOptionsInterface {
		textColor:number;
		fontFamily:string;
		backgoundColor:number;
		title:string;
		content:string;
		timeout:number;
		buttons:Array<TipButtonInterface>;
		width:number;
		height:number;
	}

	export interface TipButtonInterface {
		text: string;
		textColor?:number;
		onClick?: Function;
	}

	export class TipUI extends BaseNode {

		protected tipSprite: egret.Sprite;
		protected options: TipOptionsInterface;
		protected titleHeight:number = 70;
		protected readonly contentPadding:number = 15;
		protected readonly buttonMaxHeight:number = 75;
		protected interval:number;
		protected deltaPoint:egret.Point;

		public get textColor():number {
			return this.options.textColor;
		}
		public set textColor(value:number) {
			this.options.textColor = value >= 0 && value <= 0xffffff ? value : 0x0;
		}
		public get fontFamily():string {
			return this.options.fontFamily || 'Microsoft Yahei';
		}
		public set fontFamily(value:string) {
			this.options.fontFamily = value;
		}
		public get backgoundColor():number {
			return this.options.backgoundColor;
		}
		public set backgoundColor(value:number) {
			this.options.backgoundColor = value >= 0 && value <= 0xffffff ? value : 0xffffff;
		}
		public get title():string {
			return this.options.title;
		}
		public set title(value:string) {
			this.options.title = value;
		}
		public get content():string {
			return this.options.content;
		}
		public set content(value:string) {
			this.options.content = value;
		}
		public get timeout():number {
			return this.options.timeout === Infinity && this.options.buttons.length <= 0 ? 1500 : this.options.timeout;
		}
		public set timeout(value:number) {
			this.options.timeout = value > 0 ? value : 0;
		}
		public get buttons():Array<TipButtonInterface> {
			return this.options.buttons;
		}
		public set buttons(value:Array<TipButtonInterface>) {
			this.options.buttons = value;
		}
		public get clientWidth():number {
			return this.options.width <= 0 || this.options.width > this.stage.stageWidth ? this.stage.stageWidth * 0.75 : this.options.width;
		}
		public set clientWidth(value:number) {
			this.options.width = value;
		}
		public get clientHeight():number {
			return this.options.height <= 0 || this.options.height < this.titleHeight + this.buttonMaxHeight ? this.stage.stageHeight * 0.9 : this.options.height;
		}
		public set clientHeight(value:number) {
			this.options.height = value;
		}

		constructor() {
			super();
			this.options = {
				textColor: 0x0,
				fontFamily: 'Microsoft Yahei',
				backgoundColor: 0xffffff,
				title: '',
				content: '',
				timeout: Infinity,
				buttons: [],
				width: 0,
				height: 0
			};
		}

		public onAddedToStage(e: egret.Event) : void {
			this.removeChildren();
			//黑色遮罩
			this.addChild(new MaskUI(0x0, .25));
			//主容器
			this.tipSprite = new egret.Sprite;
			this.addChild(this.tipSprite);

			this.renderClient();
			this.bindEvents();
			this.timeoutDisappear();
		}

		protected renderClient() : void
		{
			this.removeAllEventListeners();
			this.tipSprite.removeChildren();
			this.tipSprite.graphics.clear();

			if (this.title.length <= 0)
				this.titleHeight = 0;

			let parser: egret.HtmlTextParser = new egret.HtmlTextParser();

			const buttonHeight:number = this.buttons.length > 0 ? this.buttonMaxHeight : 0,
				contentMaxHeight:number = this.clientHeight - this.titleHeight - buttonHeight;
			let contentField: egret.TextField = new egret.TextField;
			contentField.textColor = this.textColor;
			contentField.fontFamily = this.fontFamily;
			contentField.size = 24;
			contentField.textFlow = parser.parse(this.content);
			contentField.textAlign = egret.HorizontalAlign.LEFT;
			contentField.verticalAlign = egret.VerticalAlign.TOP;
			contentField.width = this.clientWidth - this.contentPadding * 2; //自动计算高度

			//限制content的高度
			if (contentField.height < 150) contentField.height = 150;
			if (contentField.height > contentMaxHeight - this.contentPadding * 2) contentField.height = contentMaxHeight - this.contentPadding * 2;

			//内容
			let contentSprite:egret.Sprite = new egret.Sprite;
			contentSprite.name = 'content';
			contentField.x = this.contentPadding; //左边距
			contentField.y = this.contentPadding; //上边距
			contentSprite.x = 0;
			contentSprite.y = this.titleHeight;
			contentSprite.height = contentField.height + this.contentPadding * 2;
			contentSprite.addChild(contentField);

			//重新计算实际高度
			this.clientHeight = this.titleHeight + buttonHeight + contentSprite.height;

			//白色底色
			let tipSprite:egret.Sprite = this.tipSprite;
			tipSprite.graphics.beginFill(this.backgoundColor, 0.95);
			tipSprite.graphics.drawRoundRect(0, 0, this.clientWidth, this.clientHeight, 50);
			tipSprite.graphics.endFill();

			//标题栏
			let titleField:egret.TextField = new egret.TextField;
			titleField.textColor = this.textColor;
			titleField.fontFamily = this.fontFamily;
			titleField.size = 35;
			titleField.textFlow = parser.parse(this.title);
			titleField.textAlign = egret.HorizontalAlign.CENTER;
			titleField.verticalAlign = egret.VerticalAlign.MIDDLE;
			titleField.x = this.contentPadding;
			titleField.y = 0;
			titleField.width = tipSprite.width - this.contentPadding * 2;
			titleField.height = this.titleHeight;

			let titleSprite:egret.Sprite = new egret.Sprite;
			titleSprite.name = 'title';
			titleSprite.x = 0;
			titleSprite.y = 0;
			titleSprite.width = tipSprite.width;
			titleSprite.height = this.titleHeight;
			//title border
			titleSprite.graphics.lineStyle(1, 0xcccccc);
			titleSprite.graphics.moveTo(0, titleSprite.height - 1);
			titleSprite.graphics.lineTo(titleSprite.width, titleSprite.height - 1);
			titleSprite.addChild(titleField);

			//按钮
			let buttonsSprite = new egret.Sprite;
			buttonsSprite.name = 'buttons';
			if (this.buttons.length > 0) {
				buttonsSprite.x = 0;
				buttonsSprite.y = tipSprite.height - this.buttonMaxHeight;
				buttonsSprite.width = this.clientWidth;
				buttonsSprite.height = this.buttonMaxHeight;
				let cellWidth:number = buttonsSprite.width / this.buttons.length;
				//draw top border
				buttonsSprite.graphics.lineStyle(1, 0xcccccc);
				buttonsSprite.graphics.moveTo(0, 0);
				buttonsSprite.graphics.lineTo(buttonsSprite.width, 0);
				//draw button's border
				for (let i:number = 1; i < this.buttons.length; i++) {
					buttonsSprite.graphics.moveTo(cellWidth * i, 0);
					buttonsSprite.graphics.lineTo(cellWidth * i, buttonsSprite.height);
				}
				for (let i = 0; i < this.buttons.length; i++) {
					let btn:egret.TextField = new egret.TextField;
					btn.name = 'button-' + i;
					btn.x = cellWidth * i;
					btn.y = 1;
					btn.fontFamily = this.fontFamily;
					btn.width = cellWidth;
					btn.height = buttonsSprite.height;
					btn.textColor = this.buttons[i].textColor || this.textColor;
					btn.textAlign = egret.HorizontalAlign.CENTER;
					btn.verticalAlign = egret.VerticalAlign.MIDDLE;
					btn.textFlow = parser.parse(this.buttons[i].text);

					buttonsSprite.addChild(btn);
				}
			}

			tipSprite.addChild(contentSprite);
			tipSprite.addChild(titleSprite);
			tipSprite.addChild(buttonsSprite);

			tipSprite.x = (this.stage.stageWidth - tipSprite.width) / 2;
			tipSprite.y = (this.stage.stageHeight - tipSprite.height) / 2;
			this.addChild(tipSprite);
		}

		protected timeoutDisappear(): void {
			if (this.interval)
				clearTimeout(this.interval);

			if (this.timeout != Infinity && this.timeout > 0)
				this.interval = setTimeout(() => {
					this.destroy();
				}, this.timeout);
		}

		protected bindEvents() : void
		{
			let titleSprite:egret.Sprite = this.tipSprite.getChildByName('title') as egret.Sprite;
			if (titleSprite) {
				//title touch
				titleSprite.touchEnabled = true;
				titleSprite.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
				titleSprite.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
				titleSprite.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchEnd, this);
				titleSprite.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
			}

			let buttonsSprite:egret.Sprite = this.tipSprite.getChildByName('buttons') as egret.Sprite;
			if (!buttonsSprite) return;
			for (let i:number = 0; i < buttonsSprite.numChildren; ++i) {
				let btn:egret.Sprite = buttonsSprite.getChildAt(i) as egret.Sprite;
				btn.touchEnabled = true;
				btn.once(egret.TouchEvent.TOUCH_TAP, this.onClick, this);
			}
		}

		public removeAllEventListeners() : void
		{
			let titleSprite:egret.Sprite = this.tipSprite.getChildByName('title') as egret.Sprite;
			if (titleSprite) {
				titleSprite.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
				titleSprite.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
				titleSprite.removeEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchEnd, this);
				titleSprite.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
			}

			let buttonsSprite:egret.Sprite = this.tipSprite.getChildByName('buttons') as egret.Sprite;
			if (buttonsSprite)
			{
				for (let i:number = 0; i < buttonsSprite.numChildren; ++i) {
					let btn:egret.Sprite = buttonsSprite.getChildAt(i) as egret.Sprite;
					btn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this);
				}
			}
		}

		protected onClick(e: egret.Event): void {
			e.stopPropagation();
			let btn:egret.Sprite = e.currentTarget as egret.Sprite;
			let buttonsSprite:egret.Sprite = this.tipSprite.getChildByName('buttons') as egret.Sprite;
			if (!buttonsSprite || !this.buttons) return;
			let i:number = buttonsSprite.getChildIndex(btn);
			if (this.buttons[i].onClick instanceof Function)
				this.buttons[i].onClick.call(this, e);
		}

		protected onTouchBegin(e: egret.TouchEvent): void {
			this.deltaPoint = new egret.Point(e.stageX - this.tipSprite.x, e.stageY - this.tipSprite.y);
		}

		protected onTouchEnd(e: egret.TouchEvent): void {
			this.deltaPoint = null;
		}

		protected onTouchMove(e: egret.TouchEvent): void {
			let x:number = e.stageX - this.deltaPoint.x;
			let y:number = e.stageY - this.deltaPoint.y;

			if (x < 0) x = 0;
			else if (x + this.tipSprite.width > this.stage.stageWidth) x = this.stage.stageWidth - this.tipSprite.width;

			if (y < 0) y = 0;
			else if (y + this.tipSprite.height > this.stage.stageHeight) y = this.stage.stageHeight - this.tipSprite.height;

			this.tipSprite.x = x;
			this.tipSprite.y = y;

		}
	}
}
