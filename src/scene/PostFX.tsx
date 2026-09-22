import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.95}
        luminanceSmoothing={0.15}
        intensity={0.65}
        radius={0.55}
      />
      <Vignette
        blendFunction={BlendFunction.NORMAL}
        eskil={false}
        offset={0.32}
        darkness={0.38}
      />
    </EffectComposer>
  );
}
