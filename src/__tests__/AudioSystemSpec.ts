import { AudioPlayer, customMatchers, Game, ResourceFactory } from "./helpers";

expect.extend(customMatchers);

describe("test AudioPlayer", () => {
	it("AudioSystem#volumeの入力値チェック", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
		expect(() => {
			system.volume = NaN!;
		}).toThrowError();
		expect(() => {
			system.volume = undefined!;
		}).toThrowError();
		expect(() => {
			system.volume = null!;
		}).toThrowError();
		expect(() => {
			system.volume = "" as any;
		}).toThrowError();
		expect(() => {
			system.volume = false as any;
		}).toThrowError();
		expect(() => {
			system.volume = true as any;
		}).toThrowError();
		expect(() => {
			system.volume = 0 - 0.001;
		}).toThrowError();
		expect(() => {
			system.volume = 1 + 0.001;
		}).toThrowError();
	});

	it("AudioSystem#_destroyRequestedAssets", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
		const audio = new ResourceFactory().createAudioAsset("testId", "testAssetPath", 0, system, false, {});

		system.requestDestroy(audio);
		expect(system._destroyRequestedAssets[audio.id]).toEqual(audio);
		expect(system.getDestroyRequestedAsset(audio.id)).toEqual(audio);

		system.cancelRequestDestroy(audio);
		expect(system.getDestroyRequestedAsset(audio.id)).toBeNull();
		expect(system._destroyRequestedAssets[audio.id]).toBeUndefined();
	});

	it("AudioSystem#_setPlaybackRate", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const player1 = system.createPlayer();
		const player2 = system.createPlayer();

		expect(player1._muted).toBeFalsy();
		expect(player2._muted).toBeFalsy();

		system._setPlaybackRate(0.3);
		expect(player1._muted).toBeTruthy();
		expect(player2._muted).toBeTruthy();
	});

	it("AudioSystem#_changeMuted", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const player1 = system.createPlayer();
		const asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, system, false, {});

		expect(player1._muted).toBe(false);
		player1.play(asset);
		player1.stop();
		expect(player1._muted).toBe(false);

		player1._changeMuted(true);
		expect(player1._muted).toBe(true);
		player1.play(asset);
		player1.stop();
		expect(player1._muted).toBe(true);
	});

	it("SoundAudioSystem#_reset", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const asset = game.resourceFactory.createAudioAsset("dummy", "audio/dummy", 0, system, true, {});
		const player = system.createPlayer();

		system._setPlaybackRate(0.3);
		system.requestDestroy(asset);
		expect(system._destroyRequestedAssets.dummy).toBe(asset);

		system._reset();
		expect(player._muted).toBeTruthy();
		expect(system._destroyRequestedAssets).toEqual({});
	});

	it("MusicAudioSystem#_reset", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
		const asset = game.resourceFactory.createAudioAsset("dummy", "audio/dummy", 0, system, true, {});
		const player = system.createPlayer();

		system._setPlaybackRate(0.3);
		system.requestDestroy(asset);
		expect(player._muted).toBeTruthy();
		expect(system._destroyRequestedAssets.dummy).toBe(asset);

		system._reset();
		expect(system._destroyRequestedAssets).toEqual({});
	});

	it("MusicAudioSystem#_setPlaybackRate", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
		const player1 = system.createPlayer() as AudioPlayer;
		const asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, system, false, {});

		let playedCalled = 0;
		let stoppedCalled = 0;
		function resetCalledCount(): void {
			playedCalled = 0;
			stoppedCalled = 0;
		}

		player1.onPlay.add(() => {
			++playedCalled;
		});
		player1.onStop.add(() => {
			++stoppedCalled;
		});

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 再生速度が非等倍になったらミュートにする
		system._setPlaybackRate(0.4);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();

		// 再生速度が非等倍の状態で再生された場合、ミュートとなる
		player1.stop();
		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();

		// 再生速度が等倍再生に戻った場合、ミュートが解除される
		system._setPlaybackRate(1.0);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeFalsy();
	});

	it("SoundAudioSystem#_setPlaybackRate", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const player1 = system.createPlayer() as AudioPlayer;
		const asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, system, false, {});

		let playedCalled = 0;
		let stoppedCalled = 0;
		function resetCalledCount(): void {
			playedCalled = 0;
			stoppedCalled = 0;
		}

		player1.onPlay.add(() => {
			++playedCalled;
		});
		player1.onStop.add(() => {
			++stoppedCalled;
		});

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 再生速度が非等倍になったらミュートにする
		system._setPlaybackRate(0.6);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();
		player1.stop();

		// 再生速度が非等倍の状態で再生された場合、ミュートとなる
		const player2 = system.createPlayer() as AudioPlayer;
		resetCalledCount();
		player2.onPlay.add(() => {
			++playedCalled;
		});
		player2.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player2._muted).toBeTruthy();

		// 再生速度が等倍速度に戻っても Sound はミュートのままとなる。
		const player3 = system.createPlayer() as AudioPlayer;
		system._setPlaybackRate(0.5);
		expect(player3._muted).toBeTruthy();
		system._setPlaybackRate(1.0);
		expect(player3._muted).toBeTruthy();
	});

	it("MusicAudioSystem#_onVolumeChanged", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
		const player = system.createPlayer() as AudioPlayer;
		// systemのvolumeが変更されても、playerの音量は変わらない
		player.changeVolume(0.2);
		system.volume = 0.7;
		expect(player.volume).toBe(0.2);
		expect(system.volume).toBe(0.7);
	});

	it("SoundAudioSystem#_onVolumeChanged", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const player = system.createPlayer() as AudioPlayer;
		// systemのvolumeが変更されても、playerの音量は変わらない
		player.changeVolume(0.3);
		system.volume = 0.7;
		expect(player.volume).toBe(0.3);
		expect(system.volume).toBe(0.7);
	});
});
