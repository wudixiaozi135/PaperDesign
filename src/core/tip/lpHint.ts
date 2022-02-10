namespace core {
	export interface TipType {
		type: string,
		url?: string,
		timeout: number
	}
	export interface MessageType {
		title?: string,
		content: string,
	}
	export function tip(result, message: any, tipType: TipType)
	{
		let msg: MessageType = message instanceof Object ? message : { content: message.toString()};
		switch (tipType.type) {
			case 'redirect':
				setTimeout(function () {
					self.location.href = tipType.url;
				}, tipType.timeout);
				break;
			case 'refresh':
			case 'back':
			case 'toast':
				break;
		}
		return new Promise<any>((resolve: (value?: any) => any, reject: (reason?: any) => any) => {
			let ui = new TipUI();
			if (msg.title != null)
				ui.title = msg.title;
			ui.content = msg.content;
			if (!isNaN(tipType.timeout))
				ui.timeout = tipType.timeout;
			switch (tipType.type) {
				case 'redirect':
					ui.buttons = [{
						text: 'Go',
						onClick: () => {
							ui.destroy();
							resolve();
							self.location.href = tipType.url;
						}
					}];
				break;
				case 'back':
					ui.buttons = [{
						text: '返回',
						onClick: () => {
							ui.destroy();
							resolve();
						}
					}];
				break;
			}
			ui.addToNode();
		});
	}
}