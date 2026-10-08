import { useEffect, useRef } from "react";

/**
 * Mariposas procedurales (WebGL) en el color de marca.
 * Salen desde las esquinas inferiores, vuelan en horizontal y regresan.
 * Loop exacto: el tiempo se envuelve en 8π (periodo común de todas las frecuencias).
 */

const CFG = {
  NUM: 4,
  NUM_MOBILE: 3,
  CAM_Z: 16,          // mayor = mariposas más pequeñas
  SPEED: 1,
  GAIN: 1.1,
  COL_A: "#93A3D8",   // color de marca
  COL_B: "#93A3D8",   // mismo tono: ala sólida
  VEIN: "#212121",    // detalles: borde, nervaduras y puntos
  SCALE: 0.7,
  SCALE_MOB: 1,
  DPR_MAX: 1.5,
  DPR_MAX_MOB: 2.5,
  FBM_OCT: 5,
};

const LOOP = 8 * Math.PI;

function hex(h: string) {
  const n = h.replace("#", "");
  const c = [0, 2, 4].map((k) => parseInt(n.substr(k, 2), 16) / 255);
  return c.map((v) => v * v); // a lineal (el shader aplica sqrt al final)
}

const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";

const fs = (nb: number) => `
precision highp float;
#define NB ${nb}
#define OCT ${CFG.FBM_OCT}
uniform vec2 uRes; uniform float uTime; uniform float uCam,uGain;
uniform vec3 uColA,uColB,uVein;

float hash(float n){return fract(sin(n)*43758.5453123);}
float noise(vec2 x){vec2 p=floor(x);vec2 f=fract(x);f=f*f*(3.0-2.0*f);float n=p.x+p.y*157.0;
 return mix(mix(hash(n),hash(n+1.0),f.x),mix(hash(n+157.0),hash(n+158.0),f.x),f.y);}
float fbm2(vec2 p){float f=0.0,x;for(int i=1;i<=OCT;++i){x=exp2(float(i));f+=(noise(p*x)-0.5)/x;}return f;}
float sq(float x){return x*x;}
vec2 rot(float a,vec2 v){return vec2(cos(a)*v.x+sin(a)*v.y,cos(a)*v.y-sin(a)*v.x);}
mat3 rX(float a){return mat3(1.0,0.0,0.0,0.0,cos(a),-sin(a),0.0,sin(a),cos(a));}

vec3 w0n(int i){
 if(i<1)return vec3(-0.23,0.0,1.0); if(i<2)return vec3(-0.7,0.25,1.0);
 if(i<3)return vec3(-0.4,0.8,1.0);  if(i<4)return vec3(-0.8,0.24,1.3);
 if(i<5)return vec3(-0.8,0.84,0.6); if(i<6)return vec3(-0.9,0.4,1.2);
 if(i<7)return vec3(-1.04,0.6,1.2); return vec3(-0.1,-0.1,1.0);}
vec3 w1n(int i){
 if(i<1)return vec3(0.1,0.3,1.0);   if(i<2)return vec3(-0.3,0.4,1.0);
 if(i<3)return vec3(-0.3,0.2,1.0);  if(i<4)return vec3(-0.25,-0.1,1.0);
 if(i<5)return vec3(-0.2,-0.25,1.0);if(i<6)return vec3(-0.05,-0.5,1.0);
 return vec3(0.5,-0.2,1.0);}
vec3 w0t(int i){return (w0n(i)+vec3(-0.7,-0.05,0.0))*vec3(vec2(1.2,1.0)*0.7,1.0);}
vec3 w1t(int i){return (w1n(i)+vec3(-0.7,-0.05,0.0))*vec3(vec2(1.2,1.0)*0.7,1.0);}

vec3 wing0Tex(vec2 p){
 p=rot(-0.7,p+vec2(0.3,0.0));
 int cn=0; float cnd=1e3;
 for(int i=0;i<8;i+=1){float d=distance(p,w0t(i).xy); if(d<cnd){cnd=d;cn=i;}}
 float s=0.04+pow(max(0.0,-p.y*0.4),1.3)+pow(max(0.0,-p.x-1.0),1.3)*0.1;
 s+=0.2*(1.0-smoothstep(0.0,0.4,distance(p,vec2(-1.2,0.2))))+0.2*(1.0-smoothstep(0.0,0.3,distance(p,vec2(-1.0,0.5))));
 float c=0.0;
 for(int j=0;j<8;j+=1){ if(j==cn) continue;
   vec3 n0=w0t(cn); vec3 n1=w0t(j); vec2 nd=n1.xy-n0.xy;
   float d=dot(p-(n0.xy+nd*0.5),normalize(nd))+s*n0.z; c+=sq(max(0.0,d)); }
 float p0=sq(max(0.0,dot(p-vec2(-0.5,0.0),normalize(vec2(1.0,-0.9)))));
 c+=sq(max(0.0,(distance(p+vec2(0.6,1.45),vec2(0.0))-2.0+s)))+p0+sq(max(0.0,dot(p-vec2(-0.6,-0.2),normalize(vec2(-0.3,-0.9)))));
 float c2=sq(max(0.0,(distance(p+vec2(0.6,1.55),vec2(0.0))-2.0)))+p0+sq(max(0.0,dot(p-vec2(-0.6,-0.2),normalize(vec2(-0.3,-0.9)))-0.1));
 vec2 xa=vec2(-1.7,0.0),xb=vec2(-0.8,-0.3); vec2 xs=vec2(0.6,1.0);
 vec2 u=mix(xa,xb,floor(clamp(dot(p-xa,xb-xa)/dot(xb-xa,xb-xa),0.0,1.0)*5.0+0.5)/5.0);
 float x=max(1.0-smoothstep(0.06,0.07,distance(p,vec2(-1.2,0.3))),1.0-smoothstep(0.02,0.025,length((p-u)*xs)));
 return vec3(1.0-smoothstep(s-0.015,s-0.009,sqrt(c)),1.0-smoothstep(0.1,0.106,sqrt(c2)-0.03),x);}

vec3 wing1Tex(vec2 p){
 p=p+vec2(0.0,0.16);
 int cn=0; float cnd=1e3;
 for(int i=0;i<7;i+=1){float d=distance(p,w1t(i).xy); if(d<cnd){cnd=d;cn=i;}}
 float s=0.04+pow(max(0.0,-p.y*0.4),1.3)+pow(max(0.0,-p.x-1.0),1.3)*0.1;
 float c=0.0;
 for(int j=0;j<7;j+=1){ if(j==cn) continue;
   vec3 n0=w1t(cn); vec3 n1=w1t(j); vec2 nd=n1.xy-n0.xy;
   float d=dot(p-(n0.xy+nd*0.5),normalize(nd))+s*n0.z; c+=sq(max(0.0,d)); }
 float p0=sq(max(0.0,dot(p-vec2(-0.5,-0.4),normalize(vec2(1.0,-0.7)))));
 float p1=sq(max(0.0,dot(p-vec2(-0.3,0.3),normalize(-vec2(0.1,-0.9)))));
 c+=sq(max(0.0,(distance(p+vec2(0.52,-0.1),vec2(0.0))-0.5)))+p0+p1;
 float c2=sq(max(0.0,(distance(p+vec2(0.5,0.0),vec2(0.0))-0.53)))+p0+p1;
 float xr=0.7; vec2 xa=vec2(-0.4,0.05);
 vec2 pd=rot(-0.2,p-xa);
 float ang=mix(-3.1,-1.8,floor((clamp(atan(pd.y,pd.x),-3.1,-1.8)+3.1)/1.299*6.0+0.5)/6.0);
 float x=1.0-smoothstep(0.02,0.025,distance(pd,vec2(cos(ang),sin(ang))*xr));
 return vec3(1.0-smoothstep(s-0.015,s-0.009,sqrt(c)),1.0-smoothstep(0.1,0.106,sqrt(c2)-0.03),x);}

vec4 wing(vec2 p){
 p+=fbm2(p*4.0)*0.02;
 float f=clamp(fbm2(p*vec2(1.0,16.0))*0.26+pow(clamp((p.y*4.0-abs(p.x)*2.0)/3.0,0.0,1.0),2.0),0.0,1.0);
 vec3 wc=mix(uColA,uColB,f)*uGain;
 vec3 c0=wing0Tex(p); vec3 c1=wing1Tex(p);
 vec3 col=mix(mix(uVein,c0.x*wc+(1.0-c0.x)*uVein,c0.y),c1.x*wc+(1.0-c1.x)*uVein,c1.y);
 col=mix(col,uVein,c0.z); col=mix(col,uVein,c1.z);
 return vec4(col,max(c0.y,c1.y));}

vec3 traceW(vec3 ro,vec3 rd,vec3 bd,float flap){
 vec3 up=vec3(0.0,1.0,0.0); vec3 c=cross(bd,up);
 float fa=mix(radians(20.0),radians(150.0),flap);
 vec3 w=cos(fa)*c+sin(fa)*up;
 float t=-dot(ro,w)/dot(rd,w);
 vec3 s=cross(w,bd); vec3 rp=ro+rd*t;
 return vec3(dot(rp,s),dot(rp,bd),t);}

vec4 traceB(vec3 ro,vec3 rd,vec3 bo,vec3 bd,float flap,out float al){
 al=0.0; flap=pow(flap,0.75); bo.y-=flap*0.5; ro-=bo;
 vec3 up=vec3(0.0,1.0,0.0); vec3 c=cross(bd,up);
 vec3 v0=traceW(ro,rd,bd,flap);
 ro-=dot(ro,c)*2.0*c; rd-=dot(rd,c)*2.0*c;
 vec3 v1=traceW(ro,rd,bd,flap);
 if(max(abs(v0.x),abs(v0.y))>2.0 && max(abs(v1.x),abs(v1.y))>2.0) return vec4(0.0,0.0,0.0,1e4);
 vec4 a0=wing(v0.xy); vec4 a1=wing(v1.xy);
 bool u0=a0.a>0.0 && v0.z>0.0; bool u1=a1.a>0.0 && v1.z>0.0;
 if(!u0&&!u1) return vec4(0.0,0.0,0.0,1e4);
 if(u0&&!u1){ al=a0.a; return vec4(a0.rgb,v0.z); }
 if(!u0&&u1){ al=a1.a; return vec4(a1.rgb,v1.z); }
 float s=step(v1.z,v0.z); al=mix(a0.a,a1.a,s);
 return mix(vec4(a0.rgb,v0.z),vec4(a1.rgb,v1.z),s);}

/* Recorrido: sale desde una esquina inferior, cruza en horizontal y regresa. */
vec3 path(float t,float fi,float halfW,float halfH){
 float side = mod(fi,2.0)<0.5 ? -1.0 : 1.0;          // pares: izquierda, impares: derecha
 float ph   = fi*1.7;
 float out_ = 0.5-0.5*cos(t*0.25+ph);               // 0 = en la esquina, 1 = lo más lejos
 float span = halfW*(0.95+0.35*hash(fi+3.0));
 float x = side*((halfW+2.5) - out_*(span+2.5));
 float y = -halfH*0.05 + out_*halfH*(0.12+0.18*hash(fi+7.0))
           + sin(t*0.5+ph)*0.6 + sin(t*4.0+ph)*0.12;
 float z = sin(t*0.25+ph*2.0)*1.5;
 return vec3(x,y,z);}

void main(){
 vec2 uv=gl_FragCoord.xy/uRes; vec2 q=uv*2.0-1.0; float asp=uRes.x/uRes.y; q.x*=asp;
 float tilt=0.35;
 mat3 m=rX(tilt);
 vec3 ro=m*vec3(0.0,0.0,uCam), rd=m*normalize(vec3(q,-1.2));
 float halfH=uCam/1.2, halfW=halfH*asp;
 vec3 col=vec3(0.0); float d=1e3; float alpha=0.0;
 for(int i=0;i<NB;i+=1){
   float fi=float(i);
   float t=uTime+fi*2.3;
   vec3 bo=path(t,fi,halfW,halfH);
   vec3 nx=path(t+1e-2,fi,halfW,halfH);
   vec3 bd=normalize(vec3(nx.x-bo.x,0.0,nx.z-bo.z));
   float a; vec4 b=traceB(ro,rd,bo,bd,0.5+0.5*cos(t*9.0),a);
   float s=step(b.a,d);
   col=mix(col,b.rgb,s); alpha=mix(alpha,a,s); d=min(d,b.a);
 }
 gl_FragColor=vec4(sqrt(max(col,0.0))*alpha,alpha);
}`;

export function Butterflies() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = wrap.current, cv = canvas.current;
    if (!root || !cv) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mob = matchMedia("(max-width:767px)").matches;
    const NUM = mob ? CFG.NUM_MOBILE : CFG.NUM;
    const SCALE = mob ? CFG.SCALE_MOB : CFG.SCALE;

    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) { root.style.display = "none"; return; }

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(gl.VERTEX_SHADER, VS), fsh = sh(gl.FRAGMENT_SHADER, fs(NUM));
    if (!vs || !fsh) { root.style.display = "none"; return; }
    const pr = gl.createProgram()!;
    gl.attachShader(pr, vs); gl.attachShader(pr, fsh); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { root.style.display = "none"; return; }
    gl.useProgram(pr);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(pr, n);
    const uRes = U("uRes"), uTime = U("uTime");
    gl.uniform1f(U("uCam"), CFG.CAM_Z);
    gl.uniform1f(U("uGain"), CFG.GAIN);
    gl.uniform3fv(U("uColA"), hex(CFG.COL_A));
    gl.uniform3fv(U("uColB"), hex(CFG.COL_B));
    gl.uniform3fv(U("uVein"), hex(CFG.VEIN));
    gl.clearColor(0, 0, 0, 0);

    const draw = (t: number) => {
      gl.uniform1f(uTime, t);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, mob ? CFG.DPR_MAX_MOB : CFG.DPR_MAX) * SCALE;
      const w = Math.max(1, Math.round(root.clientWidth * dpr));
      const h = Math.max(1, Math.round(root.clientHeight * dpr));
      if (w === W && h === H) return;
      W = w; H = h; cv.width = w; cv.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      if (reduce) draw(3);
    };
    const ro = new ResizeObserver(() => requestAnimationFrame(resize));
    ro.observe(root);
    resize();

    let raf = 0, acc = 0, last = 0, vis = false;
    const frame = (now: number) => {
      acc = (acc + ((now - last) / 1000) * CFG.SPEED) % LOOP;
      last = now;
      draw(acc);
      raf = requestAnimationFrame(frame);
    };
    const play = () => { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; vis && !document.hidden ? play() : stop(); });
    io.observe(root);
    const onVis = () => (!document.hidden && vis ? play() : stop());
    document.addEventListener("visibilitychange", onVis);
    if (reduce) draw(3);

    return () => {
      stop(); io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden className="absolute inset-0 pointer-events-none z-[1]">
      <canvas ref={canvas} className="block w-full h-full" />
    </div>
  );
}
