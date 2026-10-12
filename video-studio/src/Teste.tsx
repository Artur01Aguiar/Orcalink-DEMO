import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WORD = "FUNCIONOU";

export const Teste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glow = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 45%, #2b1055, #0b0b14 70%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex" }}>
        {WORD.split("").map((letter, i) => {
          const enter = spring({
            frame: frame - i * 3,
            fps,
            config: { damping: 12, stiffness: 120 },
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: "Arial Black, Helvetica, sans-serif",
                fontWeight: 900,
                fontSize: 150,
                color: "white",
                opacity: enter,
                transform: `translateY(${(1 - enter) * 300}px) scale(${0.5 + enter * 0.5})`,
                textShadow: `0 0 ${40 * glow}px rgba(170, 120, 255, ${glow})`,
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
