import { Trigger } from "../Trigger";
import { AudioAssetLike } from "./AudioAssetLike";

export interface AudioPlayerEvent {
	player: AudioPlayerLike;
	audio: AudioAssetLike;
}

/**
 * サウンド再生を行うインターフェース。
 *
 * 本クラスのインスタンスは、 `AudioSystem#createPlayer()` によって明示的に、
 * または `AudioAsset#play()` によって暗黙的に生成される。
 * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
 */
export interface AudioPlayerLike {
	/**
	 * 再生中のオーディオアセット。
	 * 再生中のものがない場合、 `undefined` 。
	 */
	currentAudio: AudioAssetLike;

	/**
	 * `play()` が呼び出された時に通知される `Trigger` 。
	 */
	played: Trigger<AudioPlayerEvent>;

	/**
	 * `stop()` が呼び出された時に通知される `Trigger` 。
	 */
	stopped: Trigger<AudioPlayerEvent>;

	/**
	 * 音量。
	 *
	 * 0 (無音) 以上 1.0 (最大) 以下の数値である。
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更してはならない。
	 * 音量を変更したい場合、  `changeVolume()` メソッドを用いること。
	 */
	volume: number;

	/**
	 * ミュート中か否か。
	 * @private
	 */
	_muted: boolean;

	/**
	 * 再生速度の倍率。
	 * @private
	 */
	_playbackRate: number;

	/**
	 * `AudioAsset` を再生する。
	 *
	 * 再生後、 `this.played` がfireされる。
	 * @param audio 再生するオーディオアセット
	 */
	play(audio: AudioAssetLike): void;

	/**
	 * 再生を停止する。
	 *
	 * 停止後、 `this.stopped` がfireされる。
	 * 再生中でない場合、何もしない(`stopped` もfireされない)。
	 */
	stop(): void;

	/**
	 * 音声の終了を検知できるか否か。
	 * 通常、ゲーム開発者がこのメソッドを利用する必要はない。
	 */
	canHandleStopped(): boolean;

	/**
	 * 音量を変更する。
	 *
	 * @param volume 音量。0以上1.0以下でなければならない
	 */
	// エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
	// `_changeMuted()` などと同様、このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
	// オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	changeVolume(volume: number): void;

	/**
	 * ミュート状態を変更する。
	 *
	 * エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
	 * このメソッドをオーバーライドして実際にミュート状態を変更する処理を行うこと。
	 * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	 *
	 * @param muted ミュート状態にするか否か
	 * @private
	 */
	_changeMuted(muted: boolean): void;

	/**
	 * 再生速度を変更する。
	 *
	 * エンジンユーザが `AudioPlayer` の派生クラスを実装し、
	 * かつ `this._supportsPlaybackRate()` をオーバライドして真を返すようにするならば、
	 * このメソッドもオーバーライドして実際に再生速度を変更する処理を行うこと。
	 * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	 *
	 * @param rate 再生速度の倍率。0以上でなければならない。1.0で等倍である。
	 * @private
	 */
	_changePlaybackRate(rate: number): void;

	/**
	 * 再生速度の変更に対応するか否か。
	 *
	 * エンジンユーザが `AudioPlayer` の派生クラスを実装し、
	 * 再生速度の変更に対応する場合、このメソッドをオーバーライドして真を返さねばならない。
	 * その場合 `_changePlaybackRate()` もオーバーライドし、実際の再生速度変更処理を実装しなければならない。
	 *
	 * なおここで「再生速度の変更に対応する」は、任意の速度で実際に再生できることを意味しない。
	 * 実装は等倍速 (再生速度1.0) で実際に再生できなければならない。
	 * しかしそれ以外の再生速度が指定された場合、実装はまるで音量がゼロであるかのように振舞ってもよい。
	 *
	 * このメソッドが偽を返す場合、エンジンは音声の非等倍速度再生に対するデフォルトの処理を実行する。
	 * @private
	 */
	_supportsPlaybackRate(): boolean;

	/**
	 * 音量の変更を通知する。
	 * @deprecated このメソッドは実験的に導入されたが、利用されていない。将来的に削除される。
	 */
	_onVolumeChanged(): void;
}