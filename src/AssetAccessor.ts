import { AudioAsset, ImageAsset, ScriptAsset, TextAsset, VectorImageAsset } from "@akashic/pdi-types";
import { AssetManager } from "./AssetManager";

/**
 * アセットへのアクセスを提供するアクセッサ群。
 *
 * 実態は `AssetManager` のいくつかのメソッドに対するラッパーである。
 * このクラスにより、パス・アセットID・パターン・フィルタから、対応する読み込み済みアセットを取得できる。
 *
 * 通常、ゲーム開発者はこのクラスのオブジェクトを生成する必要はない。
 * `g.Scene#asset` に代入されている値を利用すればよい。
 */
export class AssetAccessor {
	private _assetManager: AssetManager;

	/**
	 * `AssetAccessor` のインスタンスを生成する。
	 *
	 * @param ラップする `AssetManager`
	 */
	constructor(assetManager: AssetManager) {
		this._assetManager = assetManager;
	}

	/**
	 * パスから読み込み済みの画像アセットを取得する。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該の画像アセットが読み込まれていない場合、エラー。
	 *
	 * @param path 取得する画像アセットのパス
	 */
	getImage(path: string): ImageAsset {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "image") as ImageAsset;
	}

	/**
	 * パスから読み込み済みのオーディオアセットを取得する。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * さらにオーディオアセットに限り、拡張子を省いたものでなければならない。(e.g. `"/audio/bgm01"`)
	 *
	 * 当該のオーディオアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 取得するオーディオアセットのパス
	 */
	getAudio(path: string): AudioAsset {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "audio") as AudioAsset;
	}

	/**
	 * パスから読み込み済みのスクリプトアセットを取得する。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のスクリプトアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 取得するスクリプトアセットのパス
	 */
	getScript(path: string): ScriptAsset {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "script") as ScriptAsset;
	}

	/**
	 * パスから読み込み済みのテキストアセットを取得する。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 取得するテキストアセットのパス
	 */
	getText(path: string): TextAsset {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "text") as TextAsset;
	}

	/**
	 * パスから読み込み済みのテキストアセットを取得し、その内容の文字列を返す。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 内容の文字列を取得するテキストアセットのパス
	 */
	getTextContent(path: string): string {
		return this.getText(path).data;
	}

	/**
	 * パスから読み込み済みのテキストアセットを取得し、その内容をJSONとしてパースした値を返す。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 内容のJSONを取得するテキストアセットのパス
	 */
	getJSONContent(path: string): any {
		return JSON.parse(this.getTextContent(path));
	}

	/**
	 * パスから読み込み済みのベクタ画像アセットを取得する。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のベクタ画像アセットが読み込まれていない場合、エラー。
	 *
	 * @param path 取得する画像アセットのパス
	 */
	getVectorImage(path: string): VectorImageAsset {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "vector-image") as VectorImageAsset;
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全画像アセットを取得する。
	 *
	 * ここでパスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスである。
	 *
	 * パターンは、パス文字列、またはパス中に0個以上の `**`, `*`, `?` を含む文字列である。
	 * ここで `**` は0個以上の任意のディレクトリを、 `*` は0個以上の `/` でない文字を、
	 * `?` は1個の `/` でない文字を表す。 (e.g. "/images/monsters??/*.png")
	 *
	 * フィルタは、パスを受け取ってbooleanを返す関数である。
	 * フィルタを与えた場合、読み込み済みの全アセットのうち、フィルタが偽でない値を返したものを返す。
	 *
	 * @param patternOrFilter 取得する画像アセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllImages(patternOrFilter?: string | ((path: string) => boolean)): ImageAsset[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "image") as ImageAsset[];
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全オーディオアセットを取得する。
	 * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 * ただしオーディオアセットに限り、拡張子を省いたものでなければならない。(e.g. `"/audio/bgm*"`)
	 *
	 * @param patternOrFilter 取得するオーディオアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllAudios(patternOrFilter?: string | ((path: string) => boolean)): AudioAsset[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "audio") as AudioAsset[];
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全スクリプトアセットを取得する。
	 * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 *
	 * @param patternOrFilter 取得するスクリプトアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllScripts(patternOrFilter?: string | ((path: string) => boolean)): ScriptAsset[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "script") as ScriptAsset[];
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全テキストアセットを取得する。
	 * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 *
	 * @param patternOrFilter 取得するテキストアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllTexts(patternOrFilter?: string | ((path: string) => boolean)): TextAsset[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "text") as TextAsset[];
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全ベクタ画像アセットを取得する。
	 * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 *
	 * @param patternOrFilter 取得するベクタ画像アセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllVectorImages(patternOrFilter?: string | ((path: string) => boolean)): VectorImageAsset[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "vector-image") as VectorImageAsset[];
	}

	/**
	 * アセットIDから読み込み済みの画像アセットを取得する。
	 * 当該の画像アセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 取得する画像アセットのID
	 */
	getImageById(assetId: string): ImageAsset {
		return this._assetManager.peekLiveAssetById(assetId, "image") as ImageAsset;
	}

	/**
	 * アセットIDから読み込み済みのオーディオアセットを取得する。
	 * 当該のオーディオアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 取得するオーディオアセットのID
	 */
	getAudioById(assetId: string): AudioAsset {
		return this._assetManager.peekLiveAssetById(assetId, "audio") as AudioAsset;
	}

	/**
	 * アセットIDから読み込み済みのスクリプトアセットを取得する。
	 * 当該のスクリプトアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 取得するスクリプトアセットのID
	 */
	getScriptById(assetId: string): ScriptAsset {
		return this._assetManager.peekLiveAssetById(assetId, "script") as ScriptAsset;
	}

	/**
	 * アセットIDから読み込み済みのテキストアセットを取得する。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 取得するテキストアセットのID
	 */
	getTextById(assetId: string): TextAsset {
		return this._assetManager.peekLiveAssetById(assetId, "text") as TextAsset;
	}

	/**
	 * アセットIDから読み込み済みのテキストアセットを取得し、その内容の文字列を返す。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 内容の文字列を取得するテキストアセットのID
	 */
	getTextContentById(assetId: string): string {
		return this.getTextById(assetId).data;
	}

	/**
	 * アセットIDから読み込み済みのテキストアセットを取得し、その内容をJSONとしてパースして返す。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 内容のJSONを取得するテキストアセットのID
	 */
	getJSONContentById(assetId: string): any {
		return JSON.parse(this.getTextById(assetId).data);
	}

	/**
	 * アセットIDから読み込み済みのベクタ画像アセットを取得する。
	 * 当該のベクタ画像アセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 取得するベクタ画像アセットのID
	 */
	getVectorImageById(assetId: string): VectorImageAsset {
		return this._assetManager.peekLiveAssetById(assetId, "vector-image") as VectorImageAsset;
	}
}
