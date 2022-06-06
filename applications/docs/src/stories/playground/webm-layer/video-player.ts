export class VideoCollectionPlayer {
  constructor() {}

  videos: HTMLVideoElement[] = [];
  seekingVideos: {
    video: HTMLVideoElement;
    time: number;
    frameTo: number;
  }[] = [];

  frame: number = 0;
  frames: number = 22;
  duration: number = 0;

  onTimeChanged: (frame: number) => void = () => {};

  addVideo(video: HTMLVideoElement) {
    video.loop = false;
    video.autoplay = false;
    video.muted = true;

    video.play();

    video.addEventListener("canplaythrough", this._onVideoCanPlayThrought);
  }

  removeVideo(video: HTMLVideoElement) {
    video.removeEventListener("canplaythrough", this._onVideoCanPlayThrought);

    this._unsubcsribeEvents(video);
  }

  setCurrentTime = (currentFrame: number) => {
    this.frame = currentFrame;

    Promise.all(
      this.videos.map((v) => {
        return new Promise((resolve) => {
          // check if video is being seeked already
          if (this.seekingVideos.findIndex((o) => o.video === v) === -1) {
            this.seekingVideos.push({
              video: v,
              time: Date.now(),
              frameTo: this.frame,
            });

            v.currentTime = (this.frame / this.frames) * this.duration; // this triggers seeked event
          }
          resolve(true);
        });
      })
    );
  };

  _onVideoCanPlayThrought = (e) => {
    const video = e.target as HTMLVideoElement;
    video.pause();
    video.removeEventListener("canplaythrough", this._onVideoCanPlayThrought);

    if (this.videos.includes(video)) {
      return false;
    }

    this.videos.push(video);
    this._subcsribeEvents(video);
    this.duration = this.duration === 0 ? video.duration : Math.min(video.duration, this.duration);

    this.setCurrentTime(this.frame);
  };

  _onVideoSeeked = (e) => {
    const video = e.target as HTMLVideoElement;
    const index = this.seekingVideos.findIndex((o) => o.video === video);

    if (index > -1) {
      this.seekingVideos.splice(index, 1);

      if (this.seekingVideos.length === 0) {
        this.onTimeChanged(this.frame);
      }
    }
  };

  _subcsribeEvents = (video: HTMLVideoElement) => {
    video.addEventListener("seeked", this._onVideoSeeked);
  };

  _unsubcsribeEvents = (video: HTMLVideoElement) => {
    video.removeEventListener("seeked", this._onVideoSeeked);
  };

}
