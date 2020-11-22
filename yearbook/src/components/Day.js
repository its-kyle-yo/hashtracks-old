import React, { Component } from "react";
import { FireStore } from "./Firebase";
import { If, Then, Else } from "react-if";

const getSinglePost = obj => {
  const first = Object.keys(obj)[0];
  return obj[first];
};
class Day extends Component {
  static contextType = FireStore;
  videoRef = React.createRef();
  state = {
    playing: false,
    post: null,
    media: null
  };

  play = async () => {
    if (!this.state.playing) {
      try {
        if (!!this.refs.videoRef) {
          await this.refs.videoRef.play();
          this.setState({ playing: true });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  pause = async () => {
    if (this.state.playing) {
      try {
        if (!!this.refs.videoRef) {
          await this.refs.videoRef.pause();
          this.setState({ playing: false });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  render() {
    const { post, date } = this.props;
    // Currently a bit hacky. Multiple posts can appear on a single
    // day until filtering is implemented.
    const featuredPost = getSinglePost(post);
    console.log(featuredPost, date);
    return (
      <li className="day" onMouseEnter={this.play} onMouseLeave={this.pause}>
        <div className="overlay">
          <div className="date">{date}</div>
          <div className="content">
            {(() => {
              if (!!featuredPost.extended_entities) {
                const { extended_entities } = featuredPost;
                if (!!extended_entities.media) {
                  const data = extended_entities.media[0];
                  if (data.type != "photo") {
                    const { video_info, media_url_https } = data;
                    return (
                      <video
                        ref="videoRef"
                        loop
                        src={video_info.variants[0].url}
                        poster={media_url_https}
                        type="video/mp4"
                      >
                        <img src={media_url_https} />
                      </video>
                    );
                  }
                }
              } else {
                if (!!featuredPost.entities) {
                  const { entities } = featuredPost;
                  if (!!entities.media) {
                    const { media_url_https } = entities.media[0];
                    return <img src={media_url_https} />;
                  }
                }
                return <div className="no-submission">{featuredPost.text}</div>;
              }
            })()}
          </div>
          <div className="hashtag">
            <a href="#">
              <div className="hashtag-content">#HelloWorld</div>
            </a>
          </div>
        </div>
      </li>
    );
  }
}

export default Day;

// return (
// <li className="day" onMouseEnter={this.play} onMouseLeave={this.pause}>
//   <div className="overlay">
//     <div className="date">{date}</div>
//     <div className="content">
//       <video
//         ref="videoRef"
//         loop
//         src="https://video.twimg.com/tweet_video/D97WVccXsAAYyV2.mp4"
//         poster="http://pbs.twimg.com/tweet_video_thumb/D97WVccXsAAYyV2.jpg"
//         type="video/mp4"
//       >
//         <img src="http://pbs.twimg.com/tweet_video_thumb/D97WVccXsAAYyV2.jpg" />
//       </video>
//     </div>
//     <div className="hashtag">
//       <a href="#">
//         <div className="hashtag-content">#HelloWorld</div>
//       </a>
//     </div>
//   </div>
// </li>
// );
