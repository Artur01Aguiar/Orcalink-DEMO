import { Composition } from "remotion";
import { Teste } from "./Teste";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "./config";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Teste"
        component={Teste}
        durationInFrames={5 * VIDEO_FPS}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
