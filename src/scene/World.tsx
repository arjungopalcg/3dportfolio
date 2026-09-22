import { PLACES } from "../data/places";
import { PlaceMarker } from "./Place";
import { Player } from "./Player";
import { Lighting } from "./Lighting";
import { AmbientLife } from "./AmbientLife";
import { Road } from "./Road";
import { River, riverCrossingPoint } from "./River";
import { Mountains } from "./Mountains";
import { Streetlights } from "./Streetlights";
import { Toon } from "./Toon";
import { Model } from "./kit/Model";
import { forest } from "./kit/paths";

const GROUND_SIZE = 320;
const [bridgeX, bridgeZ] = riverCrossingPoint();

export function World() {
  return (
    <>
      <Lighting />
      <Ground />
      <Mountains />
      <Road />
      <River />
      <Model
        url={forest("bridge")}
        position={[bridgeX + 11, 0, bridgeZ + 2]}
        rotation={[0, 0.9, 0]}
        scale={4.6}
      />
      <Streetlights />
      {PLACES.map((p) => (
        <PlaceMarker key={p.id} place={p} />
      ))}
      <AmbientLife />
      <Player startYaw={1} />
    </>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, 0, 10]} receiveShadow>
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      <Toon color="#8fae6f" />
    </mesh>
  );
}
