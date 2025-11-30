import { component$, Slot } from "@builder.io/qwik";
import ParticlesBackground from "../components/ReactBits/particles";
import Navbar from "../components/layout/navbar";
export default component$(() => {
  return (
    <>
      <div class="basics-background">
        <ParticlesBackground
          particleColors={["#ffffff", "#d7fee5"]}
          particleCount={200}
          particleSpread={10}
          speed={0.0375}
          sizeRandomness={0.5}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      <header>
        <Navbar />
      </header>

      <main>
        <Slot />
      </main>
    </>
  );
});
