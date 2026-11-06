"use client";

import { useEffect, useRef } from "react";
import styles from "./BattleArtwork.module.css";

export type BattleScene = "ulduar" | "factions";
const dimensions = { ulduar: [8588, 5430, 0], factions: [3840, 2160, 570] } as const;

// The original illustrations remain intact. The faction composition is framed below
// its expansion wordmark; no generated pixels or character replacements are used.
export function BattleArtwork({ scene }: { scene: BattleScene }) {
  const host = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const [width, height, top] = dimensions[scene];
  useEffect(() => {
    const element = host.current;
    const mount = surface.current;
    if (!element || !mount) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, near = false, visible = false, loading = false;
    let release: (() => void) | undefined;
    let syncRenderer: (() => void) | undefined;
    const start = async () => {
      if (disposed || loading || release || !near || reduced.matches) return;
      loading = true;
      let cleanup: (() => void) | undefined;
      try {
        const T = await import("three");
        if (disposed || reduced.matches) return;
        const renderer = new T.WebGLRenderer({ alpha: false, antialias: false, powerPreference: "low-power" });
        cleanup=()=>{renderer.dispose();renderer.forceContextLoss();};
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        const art = new T.TextureLoader();
        const texture = await art.loadAsync(`/warcraft/battle-scenes/${scene}-${innerWidth < 700 ? 960 : 1920}.webp`);
        if(disposed||reduced.matches){texture.dispose();cleanup();return;}
        texture.colorSpace = T.SRGBColorSpace;
        const geometry = new T.PlaneGeometry(2, 2);
        const uniforms = {
          uArt: { value: texture }, uTime: { value: 0 },
          uPointer: { value: new T.Vector2() }, uCover: { value: new T.Vector2(1, 1) },
          uCrop: { value: (height - top) / height }, uKind: { value: scene === "ulduar" ? 0 : 1 },
        };
        const material = new T.ShaderMaterial({ uniforms,
          vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
          fragmentShader: `
            uniform sampler2D uArt; uniform float uTime,uKind,uCrop;
            uniform vec2 uPointer,uCover; varying vec2 vUv;
            float bell(vec2 uv,vec2 center,vec2 radius){vec2 p=(uv-center)/radius;return exp(-dot(p,p)*2.);}
            void main(){
              vec2 uv=(vUv-.5)*uCover+.5;
              float t=uTime+uKind*3.7;
              float depth;
              if(uKind<.5){
                depth=.18+.62*bell(uv,vec2(.41,.36),vec2(.62,.58));
                depth+=.37*bell(uv,vec2(.88,.58),vec2(.24,.55));
                depth+=.28*(1.-smoothstep(.04,.23,uv.y));
              }else{
                depth=.12+.75*smoothstep(.12,.38,abs(uv.x-.5));
              }
              vec2 camera=vec2(sin(t*.44)*.021,cos(t*.31)*.012)+uPointer*vec2(.012,.008);
              uv=.5+(uv-.5)*.92+camera*(.18+depth);
              if(uKind<.5){
                // Localized water displacement; the architecture and raiders stay rigid.
                float water=bell(uv,vec2(.35,.12),vec2(.37,.12));
                uv.x+=sin(uv.y*45.+t*1.8)*.0025*water;
                uv.y+=cos(uv.x*36.+t*1.4)*.0015*water;
                float tentacle=bell(uv,vec2(.70,.76),vec2(.16,.26));
                uv.x+=sin(t*.9)*.004*tentacle;
              }
              vec4 col=texture2D(uArt,vec2(uv.x,uv.y*uCrop));
              if(uKind<.5){
                float rune=bell(uv,vec2(.44,.75),vec2(.18,.18));
                float pulse=pow(max(0.,sin(t*1.6)),10.);
                col.rgb+=vec3(.055,.035,.10)*rune*pulse;
                float water=bell(uv,vec2(.35,.15),vec2(.4,.17));
                col.rgb+=vec3(.005,.025,.035)*water*(.5+.5*sin(t*1.8));
              }else{
                float sunlight=bell(uv,vec2(.52,.52),vec2(.23,.75));
                col.rgb+=vec3(.045,.027,.008)*sunlight*(.5+.5*sin(t*.9));
                // Fine drifting embers in the distant battle, behind both characters.
                for(int i=0;i<9;i++){
                  float f=float(i);
                  vec2 spark=vec2(.41+fract(f*.618)*.2,fract(f*.317+t*(.023+f*.001)));
                  spark.x+=sin(t*.4+f)*.013;
                  float light=bell(uv,spark,vec2(.0017,.003));
                  col.rgb+=vec3(.55,.25,.055)*light*sunlight;
                }
              }
              gl_FragColor=col;
              #include <colorspace_fragment>
            }`,
        });
        const stage = new T.Scene();
        stage.add(new T.Mesh(geometry, material));
        const camera = new T.Camera();
        let frame = 0, last = 0, elapsed = 0, lost = false, steps = 0;
        const target = new T.Vector2();
        const paint = () => renderer.render(stage, camera);
        const resize = () => {
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          renderer.setSize(rect.width, rect.height);
          const aspect = rect.width / rect.height, imageAspect = width / (height - top);
          uniforms.uCover.value.set(Math.min(1, aspect / imageAspect), Math.min(1, imageAspect / aspect));
          paint();
        };
        const tick = (now: number) => {
          frame = requestAnimationFrame(tick);
          if (now-last < 1000/30) return;
          elapsed += last ? Math.min(.1,(now-last)/1000) : 0; last=now;
          uniforms.uTime.value=elapsed;
          uniforms.uPointer.value.lerp(target,.06);
          paint();
          if (++steps % 30 === 0) element.dataset.motionFrame=String(steps);
        };
        syncRenderer = () => {
          cancelAnimationFrame(frame); last=0;
          const active=visible&&!document.hidden&&!reduced.matches&&!lost;
          element.dataset.active=String(active);
          if(active) frame=requestAnimationFrame(tick);
        };
        const move = (event: PointerEvent) => {
          if(event.pointerType!=="mouse") return;
          const rect=element.getBoundingClientRect();
          target.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
        };
        const leave=()=>target.set(0,0);
        const onLost=(event: Event)=>{event.preventDefault();lost=true;element.dataset.renderer="fallback";syncRenderer?.();};
        const onRestored=()=>{lost=false;resize();element.dataset.renderer="webgl";syncRenderer?.();};
        const sizing=new ResizeObserver(resize);
        cleanup=()=>{
          cancelAnimationFrame(frame); sizing.disconnect();
          element.removeEventListener("pointermove",move); element.removeEventListener("pointerleave",leave);
          renderer.domElement.removeEventListener("webglcontextlost",onLost);
          renderer.domElement.removeEventListener("webglcontextrestored",onRestored);
          geometry.dispose();material.dispose();texture.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
        };
        if(disposed||reduced.matches){cleanup();return;}
        mount.appendChild(renderer.domElement);
        element.addEventListener("pointermove",move,{passive:true});element.addEventListener("pointerleave",leave);
        renderer.domElement.addEventListener("webglcontextlost",onLost);renderer.domElement.addEventListener("webglcontextrestored",onRestored);
        sizing.observe(element); resize();
        element.dataset.renderer="webgl";
        release=cleanup;syncRenderer();
      }catch{
        cleanup?.();
        element.dataset.renderer="fallback";
      }finally{loading=false;}
    };
    const sync=()=>{element.dataset.active=String(visible&&!document.hidden&&!reduced.matches);syncRenderer?.();void start();};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.01});
    const warmup=new IntersectionObserver(([entry])=>{near=entry.isIntersecting;sync();},{rootMargin:"400px"});
    observer.observe(element);warmup.observe(element);
    reduced.addEventListener("change",sync);document.addEventListener("visibilitychange",sync);
    return()=>{disposed=true;observer.disconnect();warmup.disconnect();release?.();reduced.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync);};
  },[scene,width,height,top]);
  return <div ref={host} className={styles.root} data-battle-scene={scene} aria-hidden="true">
    <svg className={styles.still} viewBox={`0 ${top} ${width} ${height-top}`} preserveAspectRatio="xMidYMid slice" focusable="false">
      <image href={`/warcraft/battle-scenes/${scene}-1920.webp`} width={width} height={height}/>
    </svg>
    <div ref={surface} className={styles.canvas}/><span className={styles.edge}/>
  </div>;
}
