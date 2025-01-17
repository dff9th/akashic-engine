import { OperationPluginViewInfo } from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";
import { Game } from "./Game";
import { InternalOperationPluginInfo } from "./InternalOperationPluginInfo";
import { OperationPlugin } from "./OperationPlugin";
import { InternalOperationPluginOperation, OperationPluginOperation } from "./OperationPluginOperation";
import { OperationPluginStatic } from "./OperationPluginStatic";

/**
 * 操作プラグインからの通知をハンドルするクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 * @ignore
 */
class OperationHandler {
	private _code: number;
	private _handler: (op: InternalOperationPluginOperation) => void;
	private _handlerOwner: any;

	constructor(code: number, owner: any, handler: (op: InternalOperationPluginOperation) => void) {
		this._code = code;
		this._handler = handler;
		this._handlerOwner = owner;
	}

	onOperation(op: OperationPluginOperation | (number | string)[]): void {
		let iop: InternalOperationPluginOperation;
		if (op instanceof Array) {
			iop = { _code: this._code, data: <(number | string)[]>op };
		} else {
			iop = <InternalOperationPluginOperation>op;
			iop._code = this._code;
		}
		this._handler.call(this._handlerOwner, iop);
	}
}

/**
 * 操作プラグインを管理するクラス。
 * 通常は game.json の `operationPlugins` フィールドを基に自動的に初期化される他、
 * ゲーム開発者は本クラスを用いて直接操作プラグインを登録することもできる。
 * 詳細は `this.register()` のコメントを参照。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することない。
 */
export class OperationPluginManager {
	/**
	 * 操作プラグインの操作を通知する `Trigger` 。
	 */
	onOperate: Trigger<InternalOperationPluginOperation>;
	/**
	 * 操作プラグインの操作を通知する `Trigger` 。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onOperate` を利用すること。
	 */
	operated: Trigger<InternalOperationPluginOperation>;

	/**
	 * ロードしている操作プラグインを保持するオブジェクト。
	 */
	plugins: { [key: number]: OperationPlugin };

	private _game: Game;
	private _viewInfo: OperationPluginViewInfo | null;
	private _infos: InternalOperationPluginInfo[];
	private _initialized: boolean;

	constructor(game: Game, viewInfo: OperationPluginViewInfo | null, infos: InternalOperationPluginInfo[]) {
		this.onOperate = new Trigger<InternalOperationPluginOperation>();
		this.operated = this.onOperate;
		this.plugins = {};
		this._game = game;
		this._viewInfo = viewInfo;
		this._infos = infos;
		this._initialized = false;
	}

	/**
	 * 初期化する。
	 * このメソッドの呼び出しは、`this.game._loaded` のfire後でなければならない。
	 */
	initialize(): void {
		if (!this._initialized) {
			this._initialized = true;
			this._loadOperationPlugins();
		}
		this._doAutoStart();
	}

	/**
	 * 操作プラグインを手動で登録する。
	 * このメソッドを利用する場合、game.json の `operationPlugins` フィールドから該当の定義を省略する必要がある。
	 * 登録後、ゲーム開発者自身で `OperationPluginManager#start()` を呼び出さなければならない点に注意。
	 * @param pluginClass new 可能な操作プラグインの実態
	 * @param code 操作プラグインの識別コード
	 * @param option 操作プラグインのコンストラクタに渡すパラメータ
	 */
	register(pluginClass: OperationPluginStatic, code: number, option?: any): void {
		this._infos[code] = {
			code,
			_plugin: this._instantiateOperationPlugin(pluginClass, code, option)
		};
	}

	/**
	 * 対象の操作プラグインを開始する。
	 * @param code 操作プラグインの識別コード
	 */
	start(code: number): void {
		const info = this._infos[code];
		if (!info || !info._plugin) return;
		info._plugin.start();
	}

	/**
	 * 対象の操作プラグインを終了する。
	 * @param code 操作プラグインの識別コード
	 */
	stop(code: number): void {
		const info = this._infos[code];
		if (!info || !info._plugin) return;
		info._plugin.stop();
	}

	destroy(): void {
		this.stopAll();
		this.onOperate.destroy();
		this.onOperate = undefined!;
		this.operated = undefined!;
		this.plugins = undefined!;
		this._game = undefined!;
		this._viewInfo = undefined!;
		this._infos = undefined!;
	}

	stopAll(): void {
		if (!this._initialized) return;
		for (let i = 0; i < this._infos.length; ++i) {
			const info = this._infos[i];
			if (info._plugin) info._plugin.stop();
		}
	}

	private _doAutoStart(): void {
		for (let i = 0; i < this._infos.length; ++i) {
			const info = this._infos[i];
			if (!info.manualStart && info._plugin) info._plugin.start();
		}
	}

	private _loadOperationPlugins(): void {
		for (let i = 0; i < this._infos.length; ++i) {
			const info = this._infos[i];
			if (!info.script) continue;
			const pluginClass = this._game._moduleManager._require(info.script);
			info._plugin = this._instantiateOperationPlugin(pluginClass, info.code, info.option);
		}
	}

	private _instantiateOperationPlugin(pluginClass: OperationPluginStatic, code: number, option?: any): OperationPlugin | undefined {
		if (!pluginClass.isSupported()) {
			return;
		}
		if (this.plugins[code]) {
			throw new Error(`Plugin#code conflicted for code: ${code}`);
		}
		if (this._infos[code]) {
			throw new Error(`this plugin (code: ${code}) is already defined in game.json`);
		}
		const plugin = new pluginClass(this._game, this._viewInfo, option);
		this.plugins[code] = plugin;
		const handler = new OperationHandler(code, this.onOperate, this.onOperate.fire);
		plugin.operationTrigger.add(handler.onOperation, handler);
		return plugin;
	}
}
